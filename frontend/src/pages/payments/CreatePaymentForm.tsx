import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Home, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';
import DatePicker from '../dashboard/components/DatePicker';
import { useCreatePaymentMutation } from '../../services/api/paymentApi';
import { useGetUnitsQuery, Unit as ApiUnit } from '../../services/api/unitApi';
import { useCurrentProperty } from '@/hooks/useCurrentProperty';

const CreatePaymentForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { propertyId } = useParams();
  const { currentPropertyId } = useCurrentProperty();
  const activePropertyId = propertyId || currentPropertyId || '';

  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<ApiUnit | null>(null);

  const { data: unitsData } = useGetUnitsQuery(activePropertyId, { skip: !activePropertyId });
  const [createPayment, { isLoading }] = useCreatePaymentMutation();

  const units = unitsData?.data || [];

  const [formData, setFormData] = useState({
    unitId: '',
    amount: '',
    type: 'RENT' as 'RENT' | 'DEPOSIT' | 'PENALTY' | 'UTILITY' | 'OTHER',
    method: 'MPESA' as 'MPESA' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE',
    mpesaReceipt: '',
    reference: '',
    status: 'COMPLETED' as 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED',
    paidAt: new Date(),
  });

  // Get active lease from selected unit
  const activeLease = selectedUnit?.leases?.find((lease) => lease.active);

  // Auto-populate from URL params
  useEffect(() => {
    const unitIdFromUrl = searchParams.get('unitId');
    if (unitIdFromUrl && units.length > 0) {
      const unit = units.find((u) => u.id === unitIdFromUrl);
      if (unit) {
        handleUnitChange(unitIdFromUrl);
      }
    }
  }, [searchParams, units]);

  const handleUnitChange = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    setSelectedUnit(unit || null);
    setFormData({ ...formData, unitId });

    // Auto-populate customer from active lease
    const activeLease = unit?.leases?.find((lease) => lease.active);

    if (unitId && !activeLease) {
      setError('This unit has no active tenant. Please select a unit with an active lease.');
      return;
    }

    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeLease) {
      setError('No active tenant found for this unit');
      return;
    }

    try {
      const payload = {
        unitId: formData.unitId,
        amount: parseFloat(formData.amount),
        type: formData.type,
        method: formData.method,
        mpesaReceipt: formData.mpesaReceipt || undefined,
        reference: formData.reference || undefined,
        status: formData.status,
        paidAt: formData.paidAt.toISOString(),
      };

      await createPayment({ propertyId: activePropertyId, data: payload }).unwrap();

      setFormData({
        unitId: '',
        amount: '',
        type: 'RENT',
        method: 'MPESA',
        mpesaReceipt: '',
        reference: '',
        status: 'COMPLETED',
        paidAt: new Date(),
      });

      Swal.fire({
        title: 'Payment recorded successfully!',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      navigate('/finance/payments');
    } catch (err: any) {
      setError(err.data?.message || 'Error recording payment');
    }
  };

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Card.Title as="h4">Record Payment</Card.Title>
                <Button variant="outline-secondary" onClick={() => navigate('/finance/payments')}>
                  <ArrowLeft size={16} className="me-2" />
                  Back
                </Button>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Unit *</Form.Label>
                      <Form.Select required value={formData.unitId} onChange={(e) => handleUnitChange(e.target.value)}>
                        <option value="">Select Unit</option>
                        {units.map((unit) => {
                          const hasActiveLease = unit.leases?.some((lease) => lease.active);
                          return (
                            <option key={unit.id} value={unit.id} disabled={!hasActiveLease}>
                              {unit.unitNumber} - {unit.type} {!hasActiveLease ? '(No Active Tenant)' : ''}
                            </option>
                          );
                        })}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Only units with active tenants are available for payment recording
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  {/* Tenancy Details Card */}
                  {selectedUnit && activeLease && (
                    <Col md={12}>
                      <Card className="mb-3">
                        <Card.Body>
                          <h6 className="mb-3">
                            <Home size={16} className="me-2" />
                            Tenancy Details
                          </h6>
                          <div className="mb-2">
                            <small className="text-muted d-block">
                              <User size={14} className="me-1" />
                              Tenant
                            </small>
                            <strong>{activeLease.user.fullName}</strong>
                            <div className="small text-muted">{activeLease.user.phone}</div>
                          </div>
                          <div className="mb-2">
                            <small className="text-muted d-block">
                              <Calendar size={14} className="me-1" />
                              Lease Period
                            </small>
                            <div className="small">
                              {new Date(activeLease.leaseStart).toLocaleDateString()}
                              {activeLease.leaseEnd && ` - ${new Date(activeLease.leaseEnd).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div>
                            <small className="text-muted d-block">Monthly Rent</small>
                            <strong className="text-primary">
                              KES {Number(activeLease.agreedRent).toLocaleString()}
                            </strong>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <DollarSign size={16} className="me-1" />
                        Amount *
                      </Form.Label>
                      <Form.Control
                        type="number"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Type *</Form.Label>
                      <Form.Select
                        required
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as 'RENT' | 'DEPOSIT' | 'PENALTY' | 'UTILITY' | 'OTHER',
                          })
                        }
                      >
                        <option value="RENT">Rent</option>
                        <option value="DEPOSIT">Deposit</option>
                        <option value="PENALTY">Penalty</option>
                        <option value="UTILITY">Utility</option>
                        <option value="OTHER">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method *</Form.Label>
                      <Form.Select
                        required
                        value={formData.method}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            method: e.target.value as 'MPESA' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE',
                          })
                        }
                      >
                        <option value="MPESA">M-Pesa</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CASH">Cash</option>
                        <option value="CHEQUE">Cheque</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status *</Form.Label>
                      <Form.Select
                        required
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED',
                          })
                        }
                      >
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                        <option value="REVERSED">Reversed</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Receipt/Transaction Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.mpesaReceipt}
                        onChange={(e) => setFormData({ ...formData, mpesaReceipt: e.target.value })}
                        placeholder="e.g., M-Pesa code or receipt number"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Reference</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        placeholder="e.g., Invoice number or description"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Paid At *</Form.Label>
                      <DatePicker
                        selected={formData.paidAt}
                        onDateSelect={(date) => setFormData({ ...formData, paidAt: date })}
                        placeholder="Select payment date"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="outline-secondary" type="button" onClick={() => navigate('/finance/payments')}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Recording...
                      </>
                    ) : (
                      'Record Payment'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CreatePaymentForm;
