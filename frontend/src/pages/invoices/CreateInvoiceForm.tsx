import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Trash2, Plus, ArrowLeft, Calendar, User, Home } from 'lucide-react';
import Swal from 'sweetalert2';
import DatePicker from '../dashboard/components/DatePicker';
import { BillingDuration } from '../../types/invoice.types';
import {
  useCreateInvoiceMutation,
  useLazyGetSuggestedItemsQuery,
  useLazyCheckItemInvoicedQuery,
} from '../../services/api/invoiceApi';
import { useGetUnitsQuery, Unit as ApiUnit } from '../../services/api/unitApi';
import { useCurrentProperty } from '@/hooks/useCurrentProperty';

interface InvoiceItem {
  itemName: string;
  itemDescription: string;
  unitAmount: number;
  quantity: number;
  billingDuration: BillingDuration;
  billingPeriod: Date;
  total: number;
  vatable: boolean;
}

const CreateInvoiceForm = () => {
  const VAT_RATE = 16; // Standard VAT rate in Kenya

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { propertyId } = useParams();
  const { currentPropertyId } = useCurrentProperty();
  const activePropertyId = propertyId || currentPropertyId || '';

  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<ApiUnit | null>(null);

  const { data: unitsData } = useGetUnitsQuery(activePropertyId, { skip: !activePropertyId });
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const [getSuggestedItems] = useLazyGetSuggestedItemsQuery();
  const [checkItemInvoiced] = useLazyCheckItemInvoicedQuery();

  const units = unitsData?.data || [];

  const [formData, setFormData] = useState({
    customerId: '',
    unitId: '',
    dueDate: new Date(),
    vatRate: VAT_RATE,
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);

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

  const billingDurations = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME'];

  const handleUnitChange = async (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    setSelectedUnit(unit || null);

    // Auto-populate customer from active lease
    const activeLease = unit?.leases?.find((lease) => lease.active);
    const customerId = activeLease?.user?.id || '';

    setFormData({ ...formData, unitId, customerId });
    setWarnings([]);

    if (unitId) {
      if (!activeLease) {
        setError('This unit has no active tenant. Please select a unit with an active lease.');
        return;
      }

      setError(null);

      try {
        const result = await getSuggestedItems({
          unitId,
          billingPeriod: new Date().toISOString(),
        }).unwrap();

        if (result.data.suggestedItems.length > 0) {
          setItems(
            result.data.suggestedItems.map((item) => {
              const adjustedUnitAmount = Math.ceil(item.unitAmount / (1 + formData.vatRate / 100));
              return {
                ...item,
                billingPeriod: new Date(item.billingPeriod),
                unitAmount: adjustedUnitAmount,
                total: adjustedUnitAmount * item.quantity,
                vatable: false,
              };
            })
          );
        }
      } catch (err) {
        console.error('Error fetching suggested items:', err);
      }
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemName: '',
        itemDescription: '',
        unitAmount: 0,
        quantity: 1,
        billingDuration: BillingDuration.MONTHLY,
        billingPeriod: new Date(),
        total: 0,
        vatable: false,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = async (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'unitAmount' || field === 'quantity' || field === 'vatable') {
      const item = newItems[index];
      // For VAT-inclusive items (like rent), adjust unit amount to account for VAT
      if (item.vatable) {
        const adjustedUnitAmount = item.unitAmount * (1 - VAT_RATE / 100);
        item.total = adjustedUnitAmount * item.quantity;
      } else {
        item.total = item.unitAmount * item.quantity;
      }
    }

    if ((field === 'itemName' || field === 'billingPeriod') && formData.unitId) {
      const item = newItems[index];
      if (item.itemName && item.billingPeriod) {
        try {
          const result = await checkItemInvoiced({
            unitId: formData.unitId,
            itemName: item.itemName,
            billingPeriod: item.billingPeriod.toISOString(),
          }).unwrap();

          if (result.data.alreadyInvoiced) {
            const warning = `${item.itemName} has already been invoiced for this period in invoice ${result.data.existingInvoices[0].invoice.invoiceNumber}`;
            if (!warnings.includes(warning)) {
              setWarnings([...warnings, warning]);
            }
          } else {
            setWarnings(warnings.filter((w) => !w.includes(item.itemName)));
          }
        } catch (err) {
          console.error('Error checking invoice:', err);
        }
      }
    }

    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateVAT = () => {
    // Calculate VAT only on non-vatable items (vatable items already have VAT included)
    const nonVatableTotal = items.filter((item) => !item.vatable).reduce((sum, item) => sum + item.total, 0);
    return (nonVatableTotal * VAT_RATE) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate.toISOString(),
        items: items.map((item) => ({
          ...item,
          billingPeriod: item.billingPeriod.toISOString(),
        })),
      };

      await createInvoice(payload).unwrap();

      setFormData({
        customerId: '',
        unitId: '',
        dueDate: new Date(),
        vatRate: VAT_RATE,
        notes: '',
      });
      setItems([]);
      setWarnings([]);

      Swal.fire({
        title: 'Invoice created successfully!',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      navigate('/finance/invoices');
    } catch (err: any) {
      setError(err.data?.message || 'Error creating invoice');
    }
  };

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Card.Title as="h4">Create Invoice</Card.Title>
                <Button variant="outline-secondary" onClick={() => navigate('/finance/invoices')}>
                  <ArrowLeft size={16} className="me-2" />
                  Back
                </Button>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {warnings.length > 0 && (
                <Alert variant="warning">
                  {warnings.map((warning, index) => (
                    <div key={index}>{warning}</div>
                  ))}
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
                        Only units with active tenants are available for invoicing
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
                      <Form.Label>Due Date *</Form.Label>
                      <DatePicker
                        selected={formData.dueDate}
                        onDateSelect={(date) => setFormData({ ...formData, dueDate: date })}
                        placeholder="Select due date"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Invoice Items</h5>
                  <Button variant="outline-primary" size="sm" onClick={handleAddItem}>
                    <Plus size={16} className="me-2" />
                    Add Item
                  </Button>
                </div>

                <div className="table-responsive mb-4">
                  <Table bordered>
                    <thead>
                      <tr>
                        <th style={{ width: '13%' }}>Item Name *</th>
                        <th style={{ width: '17%' }}>Description</th>
                        <th style={{ width: '10%' }}>Unit Amount *</th>
                        <th style={{ width: '8%' }}>Quantity *</th>
                        <th style={{ width: '10%' }}>Duration *</th>
                        <th style={{ width: '12%' }}>Billing Period</th>
                        <th style={{ width: '8%' }}>Total</th>
                        {/* <th style={{ width: '7%' }}>VAT Incl.</th> */}
                        <th style={{ width: '5%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <Form.Control
                              size="sm"
                              value={item.itemName}
                              onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              size="sm"
                              value={item.itemDescription}
                              onChange={(e) => handleItemChange(index, 'itemDescription', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="number"
                              value={item.unitAmount}
                              onChange={(e) => handleItemChange(index, 'unitAmount', parseFloat(e.target.value))}
                              required
                              min="0"
                            />
                          </td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                              required
                              min="1"
                            />
                          </td>
                          <td>
                            <Form.Select
                              size="sm"
                              value={item.billingDuration}
                              onChange={(e) => handleItemChange(index, 'billingDuration', e.target.value)}
                            >
                              {billingDurations.map((duration) => (
                                <option key={duration} value={duration}>
                                  {duration}
                                </option>
                              ))}
                            </Form.Select>
                          </td>
                          <td>
                            <DatePicker
                              selected={item.billingPeriod}
                              onDateSelect={(date) => handleItemChange(index, 'billingPeriod', date)}
                              placeholder="Period"
                              className="w-100"
                            />
                          </td>
                          <td>
                            <Form.Control size="sm" value={item.total.toFixed(2)} readOnly />
                          </td>
                          {/* <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={item.vatable}
                              onChange={(e) => handleItemChange(index, 'vatable', e.target.checked)}
                              title="Check if total amount is VAT-inclusive (e.g., RENT)"
                            />
                          </td> */}
                          <td className="text-center">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger p-0"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <Row className="mb-4">
                  <Col md={{ span: 4, offset: 8 }}>
                    <div className="d-flex justify-content-between mb-2">
                      <strong>Subtotal:</strong>
                      <span>KES {calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <strong>VAT ({VAT_RATE}%):</strong>
                      <span>KES {calculateVAT().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between border-top pt-2">
                      <h5>Total:</h5>
                      <h5>KES {calculateTotal().toFixed(2)}</h5>
                    </div>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="outline-secondary" type="button" onClick={() => navigate('/finance/invoices')}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={isLoading || items.length === 0}>
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
                      'Create Invoice'
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

export default CreateInvoiceForm;
