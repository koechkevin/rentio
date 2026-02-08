import { Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router';
import { useGetPropertyMetricsQuery } from '../../../services/api/dashboardApi';
import { formatDate } from '../../../utils/formatDate';

interface RecentIssuesTableProps {
  propertyId: string;
}

const RecentIssuesTable = ({ propertyId }: RecentIssuesTableProps) => {
  const { data, isLoading } = useGetPropertyMetricsQuery(propertyId);
  const issues = data?.data?.recentIssues || [];

  const getStatusVariant = (status: string) => {
    const variants: Record<string, string> = {
      OPEN: 'danger',
      IN_PROGRESS: 'warning',
      RESOLVED: 'success',
    };
    return variants[status] || 'secondary';
  };

  const getPriorityVariant = (priority: string) => {
    const variants: Record<string, string> = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'info',
    };
    return variants[priority] || 'secondary';
  };

  if (isLoading) {
    return <div className="text-center py-3">Loading issues...</div>;
  }

  if (issues.length === 0) {
    return <div className="text-center text-muted py-3">No issues reported yet</div>;
  }

  return (
    <div className="table-responsive">
      <Table hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Unit</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Reported</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>
                <div className="fw-bold">{issue.title}</div>
                <small className="text-muted">
                  {issue.description.length > 50 ? `${issue.description.substring(0, 50)}...` : issue.description}
                </small>
              </td>
              <td>{issue.unitNumber}</td>
              <td>
                <Badge bg={getPriorityVariant(issue.priority)}>{issue.priority}</Badge>
              </td>
              <td>
                <Badge bg={getStatusVariant(issue.status)}>{issue.status.replace('_', ' ')}</Badge>
              </td>
              <td>
                <div>{formatDate(issue.createdAt)}</div>
                <small className="text-muted">{issue.reportedBy}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RecentIssuesTable;
