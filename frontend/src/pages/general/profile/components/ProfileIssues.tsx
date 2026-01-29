import { Card, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { useGetTenantIssuesQuery } from '../../../../services/api/userProfileApi';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  category?: string;
}

interface ProfileIssuesProps {
  userId: string;
}

const ProfileIssues = ({ userId }: ProfileIssuesProps) => {
  const { data: issues, isLoading, error } = useGetTenantIssuesQuery(userId);

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="danger">Failed to load issues</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Body>
        <h6 className="card-title mb-3">Recent Issues</h6>
        {!issues || issues.length === 0 ? (
          <p className="text-muted">No unresolved issues</p>
        ) : (
          <ListGroup variant="flush">
            {issues.map((issue: Issue) => (
              <ListGroup.Item key={issue.id} className="px-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{issue.title}</h6>
                    <p className="text-muted mb-1 small">{issue.description}</p>
                    <small className="text-muted">{new Date(issue.createdAt).toLocaleDateString()}</small>
                  </div>
                  <Badge bg={issue.priority === 'high' ? 'danger' : issue.priority === 'medium' ? 'warning' : 'info'}>
                    {issue.priority}
                  </Badge>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProfileIssues;
