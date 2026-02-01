import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateUnitMutation, type UnitType } from '../../../services/api/unitApi';
import { useCheckAvailabilityQuery } from '../../../services/api/subscriptionApi';
import { AlertCircle } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

const AddUnit = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [createUnit, { isLoading, isSuccess, error }] = useCreateUnitMutation();

  const [formData, setFormData] = useState({
    unitNumber: '',
    type: 'ONE_BEDROOM' as UnitType,
    monthlyRent: '',
    floor: '',
    description: '',
  });

  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdUnitId, setCreatedUnitId] = useState<string | null>(null);

  const unitTypes: UnitType[] = ['BEDSITTER', 'ONE_BEDROOM', 'TWO_BEDROOM', 'THREE_BEDROOM', 'SHOP', 'OFFICE', 'OTHER'];

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
      const result = await createUnit({
        propertyId: propertyId!,
        unitNumber: formData.unitNumber,
        type: formData.type,
        monthlyRent: parseFloat(formData.monthlyRent),
        floor: parseInt(formData.floor),
        description: formData.description || undefined,
      }).unwrap();

      setCreatedUnitId(result.data.id);
    } catch (err) {
      console.error('Failed to create unit:', err);
    }
  };

  const { data: availabilityData, isLoading: isCheckingAvailability } = useCheckAvailabilityQuery(propertyId!, {
    skip: !propertyId,
  });

  const canAddUnit = availabilityData?.data?.canAddUnit ?? false;
  const availableUnits = availabilityData?.data?.availableUnits ?? 0;
  const pricePerUnit = availabilityData?.data?.pricePerUnit ?? 500;
  const currency = availabilityData?.data?.currency ?? 'KES';

  return (
    <div>
      <Row>
        <Col xs={12}>
          <div className="mb-4">
            <Button variant="link" className="p-0 mb-2" onClick={() => navigate(`/properties/${propertyId}/units`)}>
              <i className="bi bi-arrow-left me-2"></i>Back to Units
            </Button>
            <h4 className="mb-0">Add New Unit</h4>
          </div>
        </Col>
      </Row>

      {!isCheckingAvailability && !canAddUnit && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex align-items-start">
            <AlertCircle className="me-2 mt-1" size={20} />
            <div>
              <Alert.Heading className="h6">Subscription Required</Alert.Heading>
              <p className="mb-2">
                You need to purchase unit slots before adding units to this property. Units are charged at {currency}{' '}
                {pricePerUnit.toLocaleString()} per unit per month.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate(`/properties/${propertyId}/subscription`)}>
                Purchase Unit Slots
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {!isCheckingAvailability && canAddUnit && (
        <Alert variant="info" className="mb-4">
          <p className="mb-0">
            <strong>{availableUnits}</strong> unit slot{availableUnits !== 1 ? 's' : ''} available for this property.
          </p>
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Card.Title className="mb-4">Unit Details</Card.Title>

              {showSuccess && !createdUnitId && (
                <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
                  Unit created successfully! Redirecting...
                </Alert>
              )}

              {createdUnitId && (
                <Alert variant="success">
                  Unit created successfully! You can now upload images before redirecting...
                </Alert>
              )}

              {error && <Alert variant="danger">Failed to create unit. Please try again.</Alert>}

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

                {createdUnitId && (
                  <div className="mb-3">
                    <Form.Label>Unit Images</Form.Label>
                    <ImageUploader entityType="UNIT" entityId={createdUnitId} propertyId={propertyId} maxFiles={10} />
                  </div>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  {!createdUnitId ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/properties/${propertyId}/units`)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" disabled={isLoading || !canAddUnit}>
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
                            Creating...
                          </>
                        ) : (
                          'Create Unit'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button variant="primary" onClick={() => navigate(`/properties/${propertyId}/units`)}>
                      Done - Go to Units
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddUnit;
