import { useState } from 'react';
import { Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import { useGetUserProfileQuery } from '../../../services/api/userProfileApi';
import ProfileHeader from './components/ProfileHeader';
import ProfileNav from './components/ProfileNav';
import ProfileAbout from './components/ProfileAbout';
import ProfileTimeline from './components/ProfileTimeline';
import ProfileUploads from './components/ProfileUploads';
import TenancyDetails from './components/TenancyDetails';
import ProfileIssues from './components/ProfileIssues';
import TenancyDetailsCard from './components/TenancyDetailsCard';
import { useAppSelector } from '@/store/store';

const ProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState('timeline');
  const {
    data: userProfile,
    isLoading,
    error,
  } = useGetUserProfileQuery('', {
    skip: !userId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error || !userProfile) return <div>Profile not found</div>;

  return (
    <>
      <Row>
        <Col xs={12} className="grid-margin">
          <Card>
            <ProfileHeader userProfile={userProfile} userId={userId!} />
            <ProfileNav />
          </Card>
        </Col>
      </Row>
      <Row className="profile-body">
        {/* left wrapper start */}
        <Col md={4} xl={3} className="d-none d-md-block left-wrapper">
          <ProfileAbout userProfile={userProfile} />
          <div className="grid-margin">
            <TenancyDetails userId={userId!} />
          </div>
        </Col>
        {/* left wrapper end */}
        {/* middle wrapper start */}
        <Col md={8} xl={6} className="middle-wrapper">
          <Card>
            <Card.Body>
              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'timeline')}>
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="timeline">Timeline</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="uploads">Uploads</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="issues">Issues</Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content>
                  <Tab.Pane eventKey="timeline">
                    <ProfileTimeline userId={userId!} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="uploads">
                    <ProfileUploads userId={userId!} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="issues">
                    <ProfileIssues userId={userId!} />
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
        {/* middle wrapper end */}
        {/* right wrapper start */}
        <Col xl={3} className="d-xl-block">
          <Row>
            <Col md={12} className="grid-margin">
              <TenancyDetailsCard />
            </Col>
          </Row>
        </Col>
        {/* right wrapper end */}
      </Row>
    </>
  );
};

export default ProfilePage;
