import { Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGetLeasesQuery } from '../../../../services/api/leaseApi';
import { getUserIdFromToken } from '../../../../utils/jwt';

const TenancyDetailsCard = () => {
  const navigate = useNavigate();
  const userId = getUserIdFromToken();

  // Get all leases for the user and find the active one
  const { data: leasesData, isLoading, error } = useGetLeasesQuery('', { skip: !userId });

  const activeLease = leasesData?.data?.find((lease: any) => lease.active && lease.userId === userId);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: string | number) => {
    if (!amount) return '0';
    return parseFloat(amount.toString()).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" size="sm" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="danger" className="mb-0">
            Failed to load tenancy details
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!activeLease) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <i className="bi bi-house-x" style={{ fontSize: '2.5rem', color: '#ccc' }}></i>
          <h6 className="mt-3 mb-2">No Active Tenancy</h6>
          <p className="text-muted small mb-0">You don't have an active lease at the moment</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title mb-0">Current Tenancy</h6>
          <Badge bg="success">Active</Badge>
        </div>

        {activeLease.unit && (
          <div className="mb-3 pb-3" style={{ borderBottom: '1px solid #dee2e6' }}>
            <small className="text-muted">Property & Unit</small>
            <div>
              <strong>{activeLease.unit.property?.name || 'Property'}</strong>
            </div>
            <div className="small text-muted">
              Unit {activeLease.unit.unitNumber} - {activeLease.unit.type?.replace(/_/g, ' ')}
            </div>
          </div>
        )}

        <div className="mb-2">
          <small className="text-muted">Lease Start</small>
          <div>{formatDate(activeLease.leaseStart)}</div>
        </div>

        {activeLease.leaseEnd && (
          <div className="mb-2">
            <small className="text-muted">Lease End</small>
            <div>{formatDate(activeLease.leaseEnd)}</div>
          </div>
        )}

        <div className="mb-2">
          <small className="text-muted">Monthly Rent</small>
          <div>
            <strong>KES {formatCurrency(activeLease.agreedRent)}</strong>
            <span className="text-muted small"> / month</span>
          </div>
        </div>

        <div className="mb-2">
          <small className="text-muted">Security Deposit</small>
          <div>KES {formatCurrency(activeLease.deposit)}</div>
        </div>

        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #dee2e6' }}>
          <small className="text-muted">Lease Duration</small>
          <div>
            {activeLease.leaseEnd
              ? `${Math.ceil(
                  (new Date(activeLease.leaseEnd).getTime() - new Date(activeLease.leaseStart).getTime()) /
                    (1000 * 60 * 60 * 24 * 30)
                )} months`
              : 'Open-ended'}
          </div>
        </div>

        {activeLease.unit && (
          <div className="mt-3">
            <Button variant="outline-primary" size="sm" className="w-100">
              <i className="bi bi-eye me-1"></i>
              Terminate Lease
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TenancyDetailsCard;
