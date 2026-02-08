import { Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useGetPropertyUnitArrearsQuery } from '../../services/api/paymentApi';
import { useAppSelector } from '../../store/store';
import { AlertTriangle, CheckCircle, Phone, Mail, Calendar } from 'lucide-react';

const ArrearsTable = () => {
  const currentPropertyId = useAppSelector((state) => state.property.currentPropertyId);
  const { data, isLoading, error } = useGetPropertyUnitArrearsQuery(currentPropertyId || '', {
    skip: !currentPropertyId,
  });

  const unitArrears = data?.data || [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const getArrearsStatus = (arrears: number) => {
    if (arrears === 0) return { variant: 'success', label: 'Paid Up', icon: CheckCircle };
    if (arrears > 0) return { variant: 'danger', label: 'Arrears', icon: AlertTriangle };
    return { variant: 'secondary', label: 'N/A', icon: AlertTriangle };
  };

  if (!currentPropertyId) {
    return (
      <Alert variant="info">
        <AlertTriangle className="me-2" size={20} />
        Please select a property to view arrears
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading arrears data...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <AlertTriangle className="me-2" size={20} />
        Failed to load arrears data. Please try again.
      </Alert>
    );
  }

  if (unitArrears.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <CheckCircle size={48} className="text-success mb-3" />
          <h5>No Active Leases</h5>
          <p className="text-muted">There are no units with active leases in this property.</p>
        </Card.Body>
      </Card>
    );
  }

  // Calculate totals
  const totalArrears = unitArrears.reduce((sum, unit) => sum + unit.arrears, 0);
  const unitsWithArrears = unitArrears.filter((unit) => unit.arrears > 0).length;

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <div className="row">
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle bg-danger bg-opacity-10 p-3 me-3"
                  style={{ width: '60px', height: '60px' }}
                >
                  <AlertTriangle size={28} className="text-danger" />
                </div>
                <div>
                  <small className="text-muted d-block">Total Arrears</small>
                  <h4 className="mb-0 text-danger">{formatCurrency(totalArrears)}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle bg-warning bg-opacity-10 p-3 me-3"
                  style={{ width: '60px', height: '60px' }}
                >
                  <AlertTriangle size={28} className="text-warning" />
                </div>
                <div>
                  <small className="text-muted d-block">Units with Arrears</small>
                  <h4 className="mb-0">{unitsWithArrears}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle bg-success bg-opacity-10 p-3 me-3"
                  style={{ width: '60px', height: '60px' }}
                >
                  <CheckCircle size={28} className="text-success" />
                </div>
                <div>
                  <small className="text-muted d-block">Paid Up Units</small>
                  <h4 className="mb-0">{unitArrears.length - unitsWithArrears}</h4>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Tenant Details</th>
                  <th className="text-end">Monthly Rent</th>
                  <th className="text-end">Balance</th>
                  <th>Oldest Due Date</th>
                  <th>Lease Period</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {unitArrears.map((unit) => {
                  const status = getArrearsStatus(unit.arrears);
                  const StatusIcon = status.icon;
                  return (
                    <tr key={unit.unitId}>
                      <td>
                        <div className="fw-bold">Unit {unit.unitNumber}</div>
                        <small className="text-muted">{unit.unitType.replace('_', ' ')}</small>
                      </td>
                      <td>
                        {unit.tenant ? (
                          <div>
                            <div className="fw-bold">{unit.tenant.fullName}</div>
                            <div className="text-muted small d-flex align-items-center">
                              <Phone size={12} className="me-1" />
                              {unit.tenant.phone}
                            </div>
                            <div className="text-muted small d-flex align-items-center">
                              <Mail size={12} className="me-1" />
                              {unit.tenant.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">No tenant</span>
                        )}
                      </td>
                      <td className="text-end">
                        {unit.leaseDetails ? (
                          <strong>{formatCurrency(unit.leaseDetails.agreedRent)}</strong>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-end">
                        <strong className={unit.arrears > 0 ? 'text-danger' : 'text-success'}>
                          {formatCurrency(unit.arrears)}
                        </strong>
                      </td>
                      <td>
                        {unit.oldestDueDate ? (
                          <div className="d-flex align-items-center">
                            <Calendar size={14} className="me-1 text-muted" />
                            <span className={unit.arrears > 0 ? 'text-danger' : ''}>
                              {formatDate(unit.oldestDueDate)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        {unit.leaseDetails ? (
                          <div className="small">
                            <div>{formatDate(unit.leaseDetails.leaseStart)}</div>
                            <div className="text-muted">
                              to {unit.leaseDetails.leaseEnd ? formatDate(unit.leaseDetails.leaseEnd) : 'Ongoing'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center">
                        <Badge bg={status.variant} className="d-flex align-items-center justify-content-center">
                          <StatusIcon size={14} className="me-1" />
                          {status.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default ArrearsTable;
