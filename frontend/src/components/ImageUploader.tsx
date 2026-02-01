import { useState, useCallback } from 'react';
import { Card, Button, Spinner, Alert, Row, Col, Badge, Form } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import {
  useUploadFileMutation,
  useLinkUploadMutation,
  useGetEntityUploadsQuery,
  useUnlinkUploadMutation,
  useUpdateUploadOrderMutation,
  type EntityUpload,
} from '../services/api/uploadApi';

interface ImageUploaderProps {
  entityType: 'UNIT' | 'PROPERTY' | 'USER';
  entityId: string;
  propertyId?: string;
  maxFiles?: number;
  disabled?: boolean;
}

const ImageUploader = ({ entityType, entityId, propertyId, maxFiles = 10, disabled = false }: ImageUploaderProps) => {
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [linkUpload] = useLinkUploadMutation();
  const [unlinkUpload] = useUnlinkUploadMutation();
  const [updateUploadOrder] = useUpdateUploadOrderMutation();

  const { data: entityUploadsData, refetch } = useGetEntityUploadsQuery({ entityType, entityId }, { skip: !entityId });

  const entityUploads = entityUploadsData?.data || [];
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      setError(null);

      if (entityUploads.length + acceptedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} images allowed`);
        return;
      }

      for (const file of acceptedFiles) {
        try {
          const uploadResult = await uploadFile({
            file,
            propertyId,
            entityType,
          }).unwrap();
          await linkUpload({
            uploadId: uploadResult.data.id,
            entityType,
            entityId,
            order: entityUploads.length,
            isPrimary: entityUploads.length === 0,
          }).unwrap();
          await refetch();
        } catch (err) {
          setError('Failed to upload image. Please try again.');
          console.error('Upload error:', err);
        }
      }
    },
    [uploadFile, linkUpload, entityType, entityId, entityUploads.length, maxFiles, propertyId, refetch, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: maxFiles - entityUploads.length,
    disabled: disabled || entityUploads.length >= maxFiles,
  });

  const handleRemove = async (entityUploadId: string) => {
    if (disabled) return;
    try {
      await unlinkUpload(entityUploadId).unwrap();
      await refetch();
    } catch (err) {
      setError('Failed to remove image');
      console.error('Remove error:', err);
    }
  };

  const handleSetPrimary = async (entityUploadId: string, currentOrder: number) => {
    if (disabled) return;
    try {
      await updateUploadOrder({
        entityUploadId,
        order: currentOrder,
        isPrimary: true,
      }).unwrap();
      await refetch();
    } catch (err) {
      setError('Failed to set primary image');
      console.error('Set primary error:', err);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (disabled) return;
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    if (disabled || !draggedItem) return;
    e.preventDefault();

    const draggedIndex = entityUploads.findIndex((eu) => eu.id === draggedItem);
    const targetIndex = entityUploads.findIndex((eu) => eu.id === targetId);

    if (draggedIndex === targetIndex) return;

    try {
      // Update order for both items
      await updateUploadOrder({
        entityUploadId: draggedItem,
        order: targetIndex,
      }).unwrap();
      await refetch();
    } catch (err) {
      setError('Failed to reorder images');
      console.error('Reorder error:', err);
    }

    setDraggedItem(null);
  };

  console.log('entityUploads', entityUploads);
  return (
    <div>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {entityUploads.length > 0 && (
        <Row className="mb-3">
          {[...entityUploads]
            .sort((a, b) => a.order - b.order)
            .map((entityUpload) => (
              <Col key={entityUpload.id} xs={6} md={4} lg={3} className="mb-3">
                <Card
                  draggable={!disabled}
                  onDragStart={(e) => handleDragStart(e, entityUpload.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, entityUpload.id)}
                  style={{ cursor: disabled ? 'default' : 'move' }}
                >
                  <div style={{ position: 'relative' }}>
                    <Card.Img
                      variant="top"
                      src={entityUpload.upload.url}
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                    {entityUpload.isPrimary && (
                      <Badge bg="primary" style={{ position: 'absolute', top: '5px', left: '5px' }}>
                        Primary
                      </Badge>
                    )}
                  </div>
                  <Card.Body className="p-2">
                    <div className="d-flex justify-content-between">
                      {!entityUpload.isPrimary && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0"
                          onClick={() => handleSetPrimary(entityUpload.id, entityUpload.order)}
                          disabled={disabled}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-danger"
                        onClick={() => handleRemove(entityUpload.id)}
                        disabled={disabled}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>
      )}

      {entityUploads.length < maxFiles && (
        <div
          {...getRootProps()}
          style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: isDragActive ? '#f0f0f0' : '#fafafa',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <Spinner animation="border" />
          ) : (
            <>
              <i className="bi bi-cloud-upload" style={{ fontSize: '3rem', color: '#999' }}></i>
              <p className="mt-3 mb-0">
                {isDragActive ? 'Drop images here' : 'Drag & drop images here, or click to select'}
              </p>
              <small className="text-muted">
                {entityUploads.length}/{maxFiles} images uploaded
              </small>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
