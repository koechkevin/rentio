import { Card, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import { Home, Calendar, DollarSign, Clock, User } from 'lucide-react';
import { useGetTenantMetricsQuery } from '../services/api/dashboardApi';
import { formatDate } from '../utils/formatDate';

const TenantDashboardBanner = () => {
  const { data, isLoading } = useGetTenantMetricsQuery();
  const metrics = data?.data;

  if (isLoading) {
    return (
      <Alert variant="info" className="mb-4">
        <div className="text-center">Loading your tenancy information...</div>
      </Alert>
    );
  }

  if (!metrics?.hasActiveLease) {
    return (
      <Alert variant="info" className="mb-4">
        <div className="text-center">
          <User size={48} className="mb-3 text-muted" />
          <h5>No Active Tenancy</h5>
          <p className="mb-3">You don't have an active lease at the moment.</p>
          <Link to="/general/profile">
            <Button variant="primary">View Profile</Button>
          </Link>
        </div>
      </Alert>
    );
  }

  const { tenancyDetails, arrears, duration } = metrics;

  return (
    <Card className="mb-4 border-primary">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Your Tenancy</h5>
          <Link to="/general/profile">
            <Button variant="outline-primary" size="sm">
              View More
            </Button>
          </Link>
        </div>

        <div className="row g-3">
          <div className="col-md-3">
            <div className="d-flex align-items-center">
              <Home className="me-2 text-primary" size={20} />
              <div>
                <small className="text-muted d-block">Property</small>
                <strong>{tenancyDetails?.propertyName}</strong>
                <div className="text-muted small">Unit {tenancyDetails?.unitNumber}</div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="d-flex align-items-center">
              <Calendar className="me-2 text-primary" size={20} />
              <div>
                <small className="text-muted d-block">Lease Period</small>
                <strong>{tenancyDetails?.startDate && formatDate(tenancyDetails.startDate)}</strong>
                <div className="text-muted small">
                  to {tenancyDetails?.endDate ? formatDate(tenancyDetails.endDate) : 'Ongoing'}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="d-flex align-items-center">
              <DollarSign className="me-2 text-primary" size={20} />
              <div>
                <small className="text-muted d-block">Rent Amount</small>
                <strong>KES {Number(tenancyDetails?.rentAmount || 0).toLocaleString()}</strong>
                {arrears > 0 && <div className="text-danger small">Arrears: KES {arrears.toLocaleString()}</div>}
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="d-flex align-items-center">
              <Clock className="me-2 text-primary" size={20} />
              <div>
                <small className="text-muted d-block">Duration</small>
                <strong>{duration}</strong>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TenantDashboardBanner;
