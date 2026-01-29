import { Card, ListGroup } from 'react-bootstrap';
import { useGetUserActivitiesQuery } from '../../../../services/api/userProfileApi';

interface Props {
  userId: string;
}

const ProfileTimeline = ({ userId }: Props) => {
  const { data: activities = [], isLoading } = useGetUserActivitiesQuery(userId);

  if (isLoading) return <div>Loading timeline...</div>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>Timeline</Card.Title>
        <ListGroup variant="flush">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <ListGroup.Item key={activity._id}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{activity.activityType.replace(/_/g, ' ').toUpperCase()}</strong>
                    <p className="mb-0 mt-1">{activity.description}</p>
                  </div>
                  <small className="text-muted">{new Date(activity.createdAt).toLocaleDateString()}</small>
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <p className="text-muted">No activities yet</p>
          )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default ProfileTimeline;
