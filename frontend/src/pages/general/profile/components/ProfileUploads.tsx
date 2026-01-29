import { Card, ListGroup, Button } from 'react-bootstrap';
import { useGetUserUploadsQuery } from '../../../../services/api/userProfileApi';

interface Props {
  userId: string;
}

const ProfileUploads = ({ userId }: Props) => {
  const { data: uploads = [], isLoading } = useGetUserUploadsQuery(userId);

  if (isLoading) return <div>Loading uploads...</div>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>Uploaded Documents</Card.Title>
        <ListGroup variant="flush">
          {uploads.length > 0 ? (
            uploads.map((upload) => (
              <ListGroup.Item key={upload._id} className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1">{upload.metadata?.fileName || upload.description}</p>
                  <small className="text-muted">{new Date(upload.createdAt).toLocaleDateString()}</small>
                </div>
                {upload.metadata?.fileUrl && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    href={upload.metadata.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </Button>
                )}
              </ListGroup.Item>
            ))
          ) : (
            <p className="text-muted">No documents uploaded yet</p>
          )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default ProfileUploads;
