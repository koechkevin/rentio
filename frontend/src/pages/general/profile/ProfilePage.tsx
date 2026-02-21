import { useState } from 'react';
import { Row, Col, Card, Nav, Tab, Alert, Button } from 'react-bootstrap';
import ProfileHeader from './components/ProfileHeader';
import ProfileNav from './components/ProfileNav';
import ProfileAbout from './components/ProfileAbout';
import ProfileTimeline from './components/ProfileTimeline';
import ProfileUploads from './components/ProfileUploads';
import TenancyDetails from './components/TenancyDetails';
import ProfileIssues from './components/ProfileIssues';
import ProfileInvoices from './components/ProfileInvoices';
import ProfilePayments from './components/ProfilePayments';
import TenancyDetailsCard from './components/TenancyDetailsCard';
import PhoneVerificationModal from './components/PhoneVerificationModal';
import ChangePhoneModal from './components/ChangePhoneModal';
import { useAppSelector } from '@/store/store';
import { useGetCurrentUserQuery } from '@/services/api/authApi';

const ProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState('timeline');
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);
  const [showChangePhoneModal, setShowChangePhoneModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: userData, isLoading, error } = useGetCurrentUserQuery();
  const userProfile = userData?.data?.user || null;

  const isPhoneVerified = userProfile?.isPhoneVerified || false;

  const handlePhoneVerificationSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !userProfile) return <div>Profile not found</div>;

  return (
    <>
      {!isPhoneVerified ? (
        <Row className="mb-3">
          <Col xs={12}>
            <Alert variant="warning" dismissible>
              <Alert.Heading>Verify Your Phone Number</Alert.Heading>
              <p>Your phone number is not verified. Please verify it to use all features.</p>
              <Button variant="warning" onClick={() => setShowPhoneVerificationModal(true)}>
                Verify Phone Number
              </Button>
            </Alert>
          </Col>
        </Row>
      ) : null}

      <Row>
        <Col xs={12} className="grid-margin">
          <Card>
            <ProfileHeader userProfile={userProfile} userId={userId!} />
            <ProfileNav />
          </Card>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col xs={12} className="d-flex justify-content-end">
          <Button onClick={() => setShowChangePhoneModal(true)}>Change Phone Number</Button>
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
                  <Nav.Item>
                    <Nav.Link eventKey="invoices">Invoices</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="payments">Payments</Nav.Link>
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
                  <Tab.Pane eventKey="invoices">
                    <ProfileInvoices userId={userId!} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="payments">
                    <ProfilePayments userId={userId!} />
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

      <PhoneVerificationModal
        show={showPhoneVerificationModal}
        phoneNumber={userProfile?.phone || ''}
        onClose={() => setShowPhoneVerificationModal(false)}
        onSuccess={handlePhoneVerificationSuccess}
      />

      <ChangePhoneModal
        show={showChangePhoneModal}
        currentPhoneNumber={userProfile?.phone || ''}
        onClose={() => setShowChangePhoneModal(false)}
        onSuccess={handlePhoneVerificationSuccess}
      />
    </>
  );
};

export default ProfilePage;
