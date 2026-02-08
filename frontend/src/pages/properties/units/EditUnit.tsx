import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useGetUnitQuery, useUpdateUnitMutation, type UnitType } from '../../../services/api/unitApi';
import ImageUploader from '../../../components/ImageUploader';

const EditUnit = () => {
  const navigate = useNavigate();
  const { propertyId, unitId } = useParams<{ propertyId: string; unitId: string }>();
  const { data: unitData, isLoading: isLoadingUnit } = useGetUnitQuery(
    { propertyId: propertyId!, unitId: unitId! },
    { skip: !propertyId || !unitId }
  );
  const [updateUnit, { isLoading, isSuccess, error }] = useUpdateUnitMutation();

  const [formData, setFormData] = useState({
    unitNumber: '',
    type: 'ONE_BEDROOM' as UnitType,
    monthlyRent: '',
    floor: '',
    description: '',
  });

  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const unitTypes: UnitType[] = ['BEDSITTER', 'ONE_BEDROOM', 'TWO_BEDROOM', 'THREE_BEDROOM', 'SHOP', 'OFFICE', 'OTHER'];

  useEffect(() => {
    if (unitData?.data) {
      const unit = unitData.data;
      setFormData({
        unitNumber: unit.unitNumber,
        type: unit.type,
        monthlyRent: unit.monthlyRent.toString(),
        floor: unit.floor.toString(),
        description: unit.description || '',
      });
    }
  }, [unitData]);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate(`/properties/${propertyId}/units`);
      }, 2000);
    }
  }, [isSuccess, navigate, propertyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      await updateUnit({
        propertyId: propertyId!,
        unitId: unitId!,
        data: {
          unitNumber: formData.unitNumber,
          type: formData.type,
          monthlyRent: parseFloat(formData.monthlyRent),
          floor: parseInt(formData.floor),
          description: formData.description || undefined,
        },
      }).unwrap();
    } catch (err) {
      console.error('Failed to update unit:', err);
    }
  };

  const getActiveLease = (): any => {
    return unitData?.data?.leases?.find((lease: any) => lease.active);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: string) => {
    if (!amount) return '0';
    return parseFloat(amount.toString()).toLocaleString();
  };

  if (isLoadingUnit) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <Row>
        <Col xs={12}>
          <div className="mb-4">
            <Button variant="link" className="p-0 mb-2" onClick={() => navigate(`/properties/${propertyId}/units`)}>
              <i className="bi bi-arrow-left me-2"></i>Back to Units
            </Button>
            <h4 className="mb-0">Edit Unit</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Card.Title className="mb-4">Unit Details</Card.Title>

              {showSuccess && (
                <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
                  Unit updated successfully! Redirecting...
                </Alert>
              )}

              {error && <Alert variant="danger">Failed to update unit. Please try again.</Alert>}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unit Number *</Form.Label>
                      <Form.Control
                        type="text"
                        name="unitNumber"
                        value={formData.unitNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., A101, B2, G-12"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide a unit number.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unit Type *</Form.Label>
                      <Form.Select name="type" value={formData.type} onChange={handleInputChange} required>
                        {unitTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">Please select a unit type.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Monthly Rent (KES) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="monthlyRent"
                        value={formData.monthlyRent}
                        onChange={handleInputChange}
                        placeholder="e.g., 15000"
                        min="0"
                        step="100"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide monthly rent.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Floor *</Form.Label>
                      <Form.Control
                        type="number"
                        name="floor"
                        value={formData.floor}
                        onChange={handleInputChange}
                        placeholder="e.g., 0 for Ground, 1, 2..."
                        min="0"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide floor number.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Additional details about the unit (optional)"
                  />
                </Form.Group>

                {unitId && (
                  <div className="mb-3">
                    <Form.Label>Unit Images</Form.Label>
                    <ImageUploader entityType="UNIT" entityId={unitId} propertyId={propertyId} maxFiles={10} />
                  </div>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/properties/${propertyId}/units`)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={isLoading}>
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
                        Updating...
                      </>
                    ) : (
                      'Update Unit'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          {unitData?.data && (
            <>
              <Card className="mb-3">
                <Card.Body>
                  <h6 className="card-title mb-3">Unit Information</h6>
                  <div className="mb-2">
                    <small className="text-muted">Unit Number</small>
                    <div>
                      <strong>{unitData.data.unitNumber}</strong>
                    </div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Type</small>
                    <div>{unitData.data.type.replace(/_/g, ' ')}</div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Floor</small>
                    <div>{unitData.data.floor}</div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Standard Rent</small>
                    <div>KES {formatCurrency(unitData.data.monthlyRent)}</div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Status</small>
                    <div>
                      <Badge bg={unitData.data.status === 'OCCUPIED' ? 'success' : 'secondary'}>
                        {unitData.data.status}
                      </Badge>
                    </div>
                  </div>
                  {unitData.data.description && (
                    <div className="mt-3">
                      <small className="text-muted">Description</small>
                      <p className="small mb-0">{unitData.data.description}</p>
                    </div>
                  )}
                  <div className="mt-3 d-grid gap-2">
                    <Link to={`/finance/invoices/create?unitId=${unitId}`} className="btn btn-primary btn-sm">
                      <i className="bi bi-file-earmark-text me-1"></i>
                      Create Invoice
                    </Link>
                  </div>
                </Card.Body>
              </Card>

              {getActiveLease() ? (
                <Card>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="card-title mb-0">Current Occupancy</h6>
                      <Badge bg="success">Active</Badge>
                    </div>

                    <div className="mb-3 pb-3" style={{ borderBottom: '1px solid #dee2e6' }}>
                      <small className="text-muted">Tenant</small>
                      <div>
                        <strong>{getActiveLease()?.user.fullName}</strong>
                      </div>
                      <div className="small">
                        <i className="bi bi-telephone me-1"></i>
                        {getActiveLease()?.user.phone}
                      </div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted">Lease Start</small>
                      <div>{formatDate(getActiveLease()?.leaseStart)}</div>
                    </div>

                    {getActiveLease()?.leaseEnd && (
                      <div className="mb-2">
                        <small className="text-muted">Lease End</small>
                        <div>{formatDate(getActiveLease()?.leaseEnd)}</div>
                      </div>
                    )}

                    <div className="mb-2">
                      <small className="text-muted">Agreed Rent</small>
                      <div>
                        <strong>KES {formatCurrency(getActiveLease()?.agreedRent)}</strong>
                        <span className="text-muted small"> / month</span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted">Security Deposit</small>
                      <div>KES {formatCurrency(getActiveLease()?.deposit)}</div>
                    </div>

                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid #dee2e6' }}>
                      <small className="text-muted">Lease Duration</small>
                      <div>
                        {getActiveLease()?.leaseEnd
                          ? `${Math.ceil(
                              (new Date(getActiveLease()?.leaseEnd).getTime() -
                                new Date(getActiveLease()?.leaseStart).getTime()) /
                                (1000 * 60 * 60 * 24 * 30)
                            )} months`
                          : 'Open-ended'}
                      </div>
                    </div>

                    <div className="mt-3 d-grid gap-2">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => navigate(`/properties/${propertyId}/leases/${getActiveLease()?.id}/terminate`)}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Terminate Lease
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <Card>
                  <Card.Body className="text-center py-4">
                    <i className="bi bi-person-x" style={{ fontSize: '2.5rem', color: '#ccc' }}></i>
                    <h6 className="mt-3 mb-2">No Active Tenant</h6>
                    <p className="text-muted small mb-3">This unit is currently vacant</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/properties/${propertyId}/units/${unitId}/add-tenant`)}
                    >
                      <i className="bi bi-person-plus me-1"></i>
                      Add Tenant
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default EditUnit;
