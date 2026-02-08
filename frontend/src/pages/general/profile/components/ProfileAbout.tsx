import { Card } from 'react-bootstrap';

interface UserProfile {
  _id: string;
  displayPicture?: string;
  backgroundPicture?: string;
  about?: string;
  website?: string;
  email: string;
  createdAt?: string;
}

interface Props {
  userProfile: UserProfile;
}
const ProfileAbout = ({ userProfile }: Props) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="grid-margin">
      <Card.Body>
        <Card.Title>About</Card.Title>
        <p className="mb-2">{userProfile.about || 'No about information provided'}</p>
        <hr />
        <div className="mb-2">
          <strong>Email:</strong> {userProfile.email}
        </div>
        {userProfile.website && (
          <div>
            <strong>Website:</strong>{' '}
            <a href={userProfile.website} target="_blank" rel="noopener noreferrer">
              {userProfile.website}
            </a>
          </div>
        )}
        <div className="mt-3">
          <label className="fs-11px fw-bolder mb-0 text-uppercase">Joined:</label>
          <p className="text-secondary">{formatDate(userProfile.createdAt)}</p>
        </div>
        {/* <div className="mt-3">
          <label className="fs-11px fw-bolder mb-0 text-uppercase">Lives:</label>
          <p className="text-secondary">New York, USA</p>
        </div> */}
        {/* <div className="mt-3 d-flex social-links">
          <Button variant="outline-secondary" className="btn-icon btn-xs me-2">
            <Github />
          </Button>
          <Button variant="outline-secondary" className="btn-icon btn-xs me-2">
            <Twitter />
          </Button>
          <Button variant="outline-secondary" className="btn-icon btn-xs me-2">
            <Instagram />
          </Button>
        </div> */}
      </Card.Body>
    </Card>
  );
};

export default ProfileAbout;
