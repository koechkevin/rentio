import { Card, ListGroup, Button, Badge, Row, Col } from 'react-bootstrap';
import { useGetUserUploadsQuery } from '../../../../services/api/userProfileApi';

interface EntityUpload {
  entityType: string;
  entityId: string;
  isPrimary: boolean;
  order: number;
}

interface Upload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  entityUploads: EntityUpload[];
}

interface Props {
  userId: string;
}

const ProfileUploads = ({ userId }: Props) => {
  const { data: uploads = [], isLoading } = useGetUserUploadsQuery(userId);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'bi-file-image';
    if (mimeType.startsWith('video/')) return 'bi-file-play';
    if (mimeType.includes('pdf')) return 'bi-file-pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'bi-file-word';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'bi-file-excel';
    return 'bi-file-earmark';
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2 mb-0">Loading uploads...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0">Uploaded Documents</Card.Title>
          <Badge bg="secondary">{uploads.length} files</Badge>
        </div>

        {uploads.length > 0 ? (
          <ListGroup variant="flush">
            {uploads.map((upload: Upload) => (
              <ListGroup.Item key={upload.id} className="px-0">
                <Row className="align-items-center">
                  <Col xs="auto">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                      }}
                    >
                      {upload.mimeType.startsWith('image/') ? (
                        <img
                          src={upload.url}
                          alt={upload.originalName}
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                      ) : (
                        <i className={`${getFileIcon(upload.mimeType)} fs-4 text-primary`}></i>
                      )}
                    </div>
                  </Col>

                  <Col>
                    <div className="mb-1">
                      <strong className="d-block text-truncate" style={{ maxWidth: '300px' }}>
                        {upload.originalName}
                      </strong>
                      <div className="d-flex gap-2 flex-wrap">
                        <small className="text-muted">{formatFileSize(upload.size)}</small>
                        <small className="text-muted">•</small>
                        <small className="text-muted">{formatDate(upload.createdAt)}</small>
                      </div>
                    </div>

                    {upload.entityUploads.length > 0 && (
                      <div className="d-flex gap-1 flex-wrap">
                        {upload.entityUploads.map((entity, index) => (
                          <Badge key={index} bg="light" text="dark" className="d-flex align-items-center gap-1">
                            <i className="bi bi-link-45deg"></i>
                            {entity.entityType}
                            {entity.isPrimary && (
                              <i className="bi bi-star-fill text-warning" style={{ fontSize: '0.7rem' }}></i>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Col>

                  <Col xs="auto">
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        href={upload.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View"
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleDownload(upload.url, upload.originalName)}
                        title="Download"
                      >
                        <i className="bi bi-download"></i>
                      </Button>
                    </div>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center py-4">
            <i className="bi bi-cloud-upload" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            <p className="text-muted mt-3 mb-0">No documents uploaded yet</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProfileUploads;
