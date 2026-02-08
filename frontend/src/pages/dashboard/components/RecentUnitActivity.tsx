import { ListGroup } from 'react-bootstrap';
import { Home, User, Calendar } from 'lucide-react';
import { useGetPropertyMetricsQuery } from '../../../services/api/dashboardApi';
import { formatDate } from '../../../utils/formatDate';

interface RecentUnitActivityProps {
  propertyId: string;
}

const RecentUnitActivity = ({ propertyId }: RecentUnitActivityProps) => {
  const { data, isLoading } = useGetPropertyMetricsQuery(propertyId);
  const activities = data?.data?.recentActivity || [];

  if (isLoading) {
    return <div className="text-center py-3">Loading activity...</div>;
  }

  if (activities.length === 0) {
    return <div className="text-center text-muted py-3">No recent activity</div>;
  }

  return (
    <ListGroup variant="flush">
      {activities.map((activity) => (
        <ListGroup.Item key={activity.id} className="px-0">
          <div className="d-flex align-items-start">
            <div className="me-3">
              <div
                className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px' }}
              >
                <Home size={20} className="text-primary" />
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div>
                  <h6 className="mb-0">Unit {activity.unitNumber}</h6>
                  <div className="text-muted small d-flex align-items-center">
                    <User size={14} className="me-1" />
                    {activity.tenantName}
                  </div>
                </div>
                <span className={`badge bg-${activity.active ? 'success' : 'secondary'}`}>
                  {activity.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="text-muted small">
                <Calendar size={14} className="me-1" />
                {formatDate(activity.startDate)} - {activity.endDate ? formatDate(activity.endDate) : 'Ongoing'}
              </div>
              <div className="text-muted small">Updated: {formatDate(activity.updatedAt)}</div>
            </div>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default RecentUnitActivity;
