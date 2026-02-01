import { Row, Col, Card } from 'react-bootstrap';
import { Building2, Home, Users, DollarSign } from 'lucide-react';
import { useCurrentProperty } from '../../../hooks/useCurrentProperty';
import { useGetUnitsQuery } from '../../../services/api/unitApi';
import { useGetLeasesQuery } from '../../../services/api/leaseApi';
import { useGetSubscriptionQuery } from '../../../services/api/subscriptionApi';

const PropertyStats = () => {
  const { currentPropertyId, currentProperty } = useCurrentProperty();

  const { data: unitsData } = useGetUnitsQuery(currentPropertyId!, { skip: !currentPropertyId });
  const { data: leasesData } = useGetLeasesQuery(currentPropertyId!, { skip: !currentPropertyId });
  const { data: subscriptionData } = useGetSubscriptionQuery(currentPropertyId!, { skip: !currentPropertyId });

  const units = unitsData?.data || [];
  const leases = leasesData?.data || [];
  const subscription = subscriptionData?.data;

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.leases?.some((l: any) => l.active)).length;
  const activeLeases = leases.filter((l) => l.active).length;
  const totalRent = leases.filter((l) => l.active).reduce((sum, l) => sum + parseFloat(l.agreedRent.toString()), 0);

  if (!currentProperty) {
    return null;
  }

  return (
    <Row>
      <Col md={3} className="grid-margin stretch-card">
        <Card>
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 bg-primary bg-opacity-10 rounded me-3">
                <Home className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Total Units</h6>
                <h3 className="mb-0">{totalUnits}</h3>
              </div>
            </div>
            <small className="text-muted">
              {occupiedUnits} occupied, {totalUnits - occupiedUnits} vacant
            </small>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} className="grid-margin stretch-card">
        <Card>
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 bg-success bg-opacity-10 rounded me-3">
                <Users className="text-success" size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Active Tenants</h6>
                <h3 className="mb-0">{activeLeases}</h3>
              </div>
            </div>
            <small className="text-muted">
              Current occupancy rate: {totalUnits ? ((occupiedUnits / totalUnits) * 100).toFixed(0) : 0}%
            </small>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} className="grid-margin stretch-card">
        <Card>
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 bg-info bg-opacity-10 rounded me-3">
                <DollarSign className="text-info" size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Monthly Revenue</h6>
                <h3 className="mb-0">KES {totalRent.toLocaleString()}</h3>
              </div>
            </div>
            <small className="text-muted">
              From {activeLeases} active lease{activeLeases !== 1 ? 's' : ''}
            </small>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} className="grid-margin stretch-card">
        <Card>
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 bg-warning bg-opacity-10 rounded me-3">
                <Building2 className="text-warning" size={24} />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Unit Slots</h6>
                <h3 className="mb-0">
                  {subscription?.availableUnits || 0}/{subscription?.paidUnits || 0}
                </h3>
              </div>
            </div>
            <small className="text-muted">Available slots for new units</small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default PropertyStats;
