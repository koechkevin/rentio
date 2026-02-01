import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateLeaseMutation } from '../../../services/api/leaseApi';
import { useGetUnitQuery } from '../../../services/api/unitApi';

const AddTenant = () => {
  const navigate = useNavigate();
  const { propertyId, unitId } = useParams<{ propertyId: string; unitId: string }>();
  const { data: unitData, isLoading: isLoadingUnit } = useGetUnitQuery(
    { propertyId: propertyId!, unitId: unitId! },
    { skip: !propertyId || !unitId }
  );
  const [createLease, { isLoading, isSuccess, error }] = useCreateLeaseMutation();

  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    leaseEnd: '',
    agreedRent: '',
    deposit: '',
    email: '',
    fullName: '',
    nationalId: '',
    phone: '',
  });

  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (unitData?.data) {
      setFormData((prev) => ({
        ...prev,
        agreedRent: unitData.data.monthlyRent.toString(),
      }));
    }
  }, [unitData]);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate(`/properties/${propertyId}/units`);
      }, 3000);
    }
  }, [isSuccess, navigate, propertyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const result = await createLease({
        propertyId: propertyId!,
        data: {
          unitId: unitId!,
          startDate: formData.startDate,
          leaseEnd: formData.leaseEnd || undefined,
          agreedRent: parseFloat(formData.agreedRent),
          deposit: parseFloat(formData.deposit),
          email: formData.email,
          fullName: formData.fullName,
          nationalId: formData.nationalId,
          phone: formData.phone,
        },
      }).unwrap();

      setSuccessMessage(result.data.message);
    } catch (err) {
      console.error('Failed to create lease:', err);
    }
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
            <h4 className="mb-0">Add Tenant to Unit {unitData?.data?.unitNumber}</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Card.Title className="mb-4">Tenant & Lease Details</Card.Title>

              {showSuccess && (
                <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
                  {successMessage || 'Lease created successfully! Redirecting...'}
                </Alert>
              )}

              {error && <Alert variant="danger">Failed to create lease. Please try again.</Alert>}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <h6 className="mb-3">Tenant Information</h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter tenant's full name"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide full name.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>National ID *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleInputChange}
                        placeholder="Enter national ID"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide national ID.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide a valid email.</Form.Control.Feedback>
                      <Form.Text className="text-muted">Verification email will be sent to this address</Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g., +254712345678"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide phone number.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                <h6 className="mb-3">Lease Information</h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide start date.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date (Optional)</Form.Label>
                      <Form.Control
                        type="date"
                        name="leaseEnd"
                        value={formData.leaseEnd}
                        onChange={handleInputChange}
                        min={formData.startDate}
                      />
                      <Form.Text className="text-muted">Leave empty for open-ended lease</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Monthly Rent (KES) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="agreedRent"
                        value={formData.agreedRent}
                        onChange={handleInputChange}
                        placeholder="Enter monthly rent"
                        min="0"
                        step="100"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide monthly rent.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Security Deposit (KES) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="deposit"
                        value={formData.deposit}
                        onChange={handleInputChange}
                        placeholder="Enter security deposit"
                        min="0"
                        step="100"
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please provide deposit amount.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Alert variant="info" className="mt-3">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Note:</strong> If a user with this national ID exists, they will be linked to this lease.
                  Otherwise, a new account will be created and verification instructions will be sent to the provided
                  email.
                </Alert>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
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
                        Creating Lease...
                      </>
                    ) : (
                      'Create Lease'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {unitData?.data && (
            <Card>
              <Card.Body>
                <h6 className="card-title mb-3">Unit Summary</h6>
                <div className="mb-2">
                  <strong>Unit Number:</strong> {unitData.data.unitNumber}
                </div>
                <div className="mb-2">
                  <strong>Type:</strong> {unitData.data.type.replace(/_/g, ' ')}
                </div>
                <div className="mb-2">
                  <strong>Floor:</strong> {unitData.data.floor}
                </div>
                <div className="mb-2">
                  <strong>Standard Rent:</strong> KES {unitData.data.monthlyRent.toLocaleString()}
                </div>
                {unitData.data.description && (
                  <div className="mt-3">
                    <strong>Description:</strong>
                    <p className="text-muted small mt-1">{unitData.data.description}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AddTenant;
