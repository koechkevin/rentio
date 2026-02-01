import React, { useState } from 'react';
import { Card, ListGroup, Badge, Spinner, Alert, Form, Button, Collapse } from 'react-bootstrap';
import { useGetTenantIssuesQuery } from '../../../../services/api/userProfileApi';
import { useCreateIssueMutation, type IssueCategory, type IssuePriority } from '../../../../services/api/issueApi';

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
  const { data, isLoading, error, refetch } = useGetTenantIssuesQuery(userId);
  const [createIssue, { isLoading: isSubmitting }] = useCreateIssueMutation();
  const issues = data?.data as Issue[];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'PLUMBING' as IssueCategory,
    title: '',
    description: '',
    priority: 'MEDIUM' as IssuePriority,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories: IssueCategory[] = ['PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'PAINTING', 'SECURITY', 'OTHER'];
  const priorities: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!formData.title || !formData.description) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    try {
      await createIssue(formData).unwrap();
      setSubmitSuccess(true);
      setFormData({
        category: 'PLUMBING',
        title: '',
        description: '',
        priority: 'MEDIUM',
      });
      setShowForm(false);
      refetch();

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError('Failed to submit issue. Please try again.');
      console.error('Failed to create issue:', err);
    }
  };

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
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title mb-0">Recent Issues</h6>
          <Button variant="outline-primary" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Report Issue'}
          </Button>
        </div>

        {submitSuccess && (
          <Alert variant="success" dismissible onClose={() => setSubmitSuccess(false)}>
            Issue reported successfully!
          </Alert>
        )}

        <Collapse in={showForm}>
          <div className="mb-3">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-2">
                <Form.Label className="small">Category *</Form.Label>
                <Form.Select
                  size="sm"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as IssueCategory }))}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small">Title *</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Brief description"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small">Description *</Form.Label>
                <Form.Control
                  size="sm"
                  as="textarea"
                  rows={2}
                  placeholder="Provide details..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small">Priority</Form.Label>
                <Form.Select
                  size="sm"
                  value={formData.priority}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as IssuePriority }))}
                >
                  {priorities.map((pri) => (
                    <option key={pri} value={pri}>
                      {pri}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {submitError && (
                <Alert variant="danger" className="py-2 small" dismissible onClose={() => setSubmitError(null)}>
                  {submitError}
                </Alert>
              )}

              <div className="d-grid">
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-1" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Issue'
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </Collapse>

        {!issues || issues.length === 0 ? (
          <p className="text-muted small">No unresolved issues</p>
        ) : (
          <ListGroup variant="flush">
            {issues.map((issue: Issue) => (
              <ListGroup.Item key={issue.id} className="px-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h6 className="mb-1 small">{issue.title}</h6>
                    <p className="text-muted mb-1 small">{issue.description}</p>
                    <small className="text-muted">{new Date(issue.createdAt).toLocaleDateString()}</small>
                  </div>
                  <Badge
                    bg={
                      issue.priority === 'HIGH' || issue.priority === 'URGENT'
                        ? 'danger'
                        : issue.priority === 'MEDIUM'
                          ? 'warning'
                          : 'info'
                    }
                  >
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
