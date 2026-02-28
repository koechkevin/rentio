import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { BillingFrequency, BillingItemType, BILLING_ITEM_TYPE_LABELS } from '../../types/billingItem.types';
import { useCreateBillingItemMutation } from '../../services/api/billingItemApi';
import { useGetUnitsQuery, type Unit as ApiUnit } from '../../services/api/unitApi';
import { useAppSelector } from '@/store/store';
import { useGetPropertiesQuery } from '@/services/api/propertyApi';

const MONTHLY_OPTIONS = [
  { value: 'JAN', label: 'January' },
  { value: 'FEB', label: 'February' },
  { value: 'MAR', label: 'March' },
  { value: 'APR', label: 'April' },
  { value: 'MAY', label: 'May' },
  { value: 'JUN', label: 'June' },
  { value: 'JUL', label: 'July' },
  { value: 'AUG', label: 'August' },
  { value: 'SEP', label: 'September' },
  { value: 'OCT', label: 'October' },
  { value: 'NOV', label: 'November' },
  { value: 'DEC', label: 'December' },
];

const QUARTERLY_OPTIONS = [
  { value: 'Q1', label: 'Q1 (Jan – Mar)' },
  { value: 'Q2', label: 'Q2 (Apr – Jun)' },
  { value: 'Q3', label: 'Q3 (Jul – Sep)' },
  { value: 'Q4', label: 'Q4 (Oct – Dec)' },
];

const CreateBillingItem = () => {
  const navigate = useNavigate();
  const currentPropertyId = useAppSelector((state) => state.property.currentPropertyId);
  const { data: propertiesData } = useGetPropertiesQuery();
  const properties = propertiesData?.data || [];
  const currentProperty = properties.find((p) => p.id === currentPropertyId);
  const [error, setError] = useState<string | null>(null);

  const { data: unitsData } = useGetUnitsQuery(currentPropertyId ?? '', {
    skip: !currentPropertyId,
  });
  const units: ApiUnit[] = unitsData?.data || [];

  const [createBillingItem, { isLoading }] = useCreateBillingItemMutation();

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    unitId: '',
    itemType: '' as BillingItemType | '',
    frequency: BillingFrequency.MONTHLY as BillingFrequency,
    billingPeriod: '',
    year: currentYear,
    amount: '',
    currency: 'KES',
    notes: '',
  });

  // Derived: tenant info from selected unit
  const selectedUnit = units.find((u) => u.id === formData.unitId) as any;
  const activeLease = selectedUnit?.leases?.find((l: any) => l.active);
  const tenantName: string = activeLease?.user?.fullName ?? '';
  const propertyName: string = selectedUnit?.property?.name ?? '';

  // Reset billing period when frequency changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, billingPeriod: '' }));
  }, [formData.frequency]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): string | null => {
    if (!formData.unitId) return 'Please select a unit.';
    if (!activeLease) return 'Selected unit has no active tenant. A billing item requires an active lease.';
    if (!formData.itemType) return 'Please select a billing item type.';
    if (formData.frequency !== BillingFrequency.ANNUALLY && !formData.billingPeriod) {
      return 'Please select a billing period.';
    }
    if (!formData.year || formData.year < 2000) return 'Please enter a valid year.';
    if (!formData.amount || Number(formData.amount) <= 0) return 'Amount must be greater than zero.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await createBillingItem({
        unitId: formData.unitId,
        itemType: formData.itemType as BillingItemType,
        frequency: formData.frequency,
        billingPeriod: formData.frequency === BillingFrequency.ANNUALLY ? undefined : formData.billingPeriod,
        year: Number(formData.year),
        amount: Number(formData.amount),
        currency: formData.currency || 'KES',
        notes: formData.notes.trim() || undefined,
      }).unwrap();

      Swal.fire({
        title: 'Billing item created!',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      navigate('/finance/billing-items');
    } catch (err: any) {
      setError(err.data?.message || 'Failed to create billing item. Please try again.');
    }
  };

  const periodOptions =
    formData.frequency === BillingFrequency.MONTHLY
      ? MONTHLY_OPTIONS
      : formData.frequency === BillingFrequency.QUARTERLY
        ? QUARTERLY_OPTIONS
        : [];

  return (
    <Row className="justify-content-center">
      <Col xl={8} lg={10}>
        <Card>
          <Card.Header>
            <Card.Title as="h4" className="mb-0">
              New Billing Item
            </Card.Title>
          </Card.Header>
          <Card.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} noValidate>
              {/* Unit */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Unit <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select value={formData.unitId} onChange={(e) => handleChange('unitId', e.target.value)}>
                  <option value="">Select a unit...</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitNumber}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Auto-populated read-only fields */}
              {formData.unitId && (
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Property</Form.Label>
                      <Form.Control readOnly value={currentProperty?.name || '—'} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Tenant (Customer)</Form.Label>
                      <Form.Control readOnly value={tenantName || 'No active tenant'} />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {/* Item Type */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Billing Type <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select value={formData.itemType} onChange={(e) => handleChange('itemType', e.target.value)}>
                  <option value="">Select billing type...</option>
                  {(Object.values(BillingItemType) as BillingItemType[]).map((type) => (
                    <option key={type} value={type}>
                      {BILLING_ITEM_TYPE_LABELS[type]}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Frequency + Billing Period + Year */}
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>
                      Billing Frequency <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select value={formData.frequency} onChange={(e) => handleChange('frequency', e.target.value)}>
                      <option value={BillingFrequency.MONTHLY}>Monthly</option>
                      <option value={BillingFrequency.QUARTERLY}>Quarterly</option>
                      <option value={BillingFrequency.ANNUALLY}>Annually</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {formData.frequency !== BillingFrequency.ANNUALLY && (
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        {formData.frequency === BillingFrequency.MONTHLY ? 'Month' : 'Quarter'}{' '}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        value={formData.billingPeriod}
                        onChange={(e) => handleChange('billingPeriod', e.target.value)}
                      >
                        <option value="">Select...</option>
                        {periodOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}

                <Col md={formData.frequency === BillingFrequency.ANNUALLY ? 8 : 4}>
                  <Form.Group>
                    <Form.Label>
                      Year <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleChange('year', e.target.value)}
                      min={2000}
                      max={2100}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Amount + Currency */}
              <Row className="mb-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>
                      Amount <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      min={0}
                      step="0.01"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Currency</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.currency}
                      onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
                      maxLength={3}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Notes */}
              <Form.Group className="mb-4">
                <Form.Label>
                  Notes <span className="text-muted small">(optional)</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Any additional notes..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    'Create Billing Item'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => navigate('/finance/billing-items')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateBillingItem;
