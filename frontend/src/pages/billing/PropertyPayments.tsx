import { useState } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { CreditCard, Plus, RefreshCw, DollarSign } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import {
  useGetPropertyPaymentsQuery,
  useGetPropertyBalanceSummaryQuery,
  useInitializePaymentMutation,
  useRecordManualPaymentMutation,
} from '../../services/api/propertyPaymentApi';
import { PropertyPayment } from '../../types/propertyPayment.types';

const PropertyPayments = () => {
  const { currentPropertyId } = useAppSelector((state) => state.property);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [manualPayment, setManualPayment] = useState({
    amount: '',
    paymentMethod: 'MPESA',
    reference: '',
    mpesaReceipt: '',
  });

  const { data: paymentsData, isLoading: loadingPayments } = useGetPropertyPaymentsQuery(
    { propertyId: currentPropertyId || '' },
    { skip: !currentPropertyId }
  );

  const { data: balanceData, isLoading: loadingBalance } = useGetPropertyBalanceSummaryQuery(currentPropertyId || '', {
    skip: !currentPropertyId,
  });

  const [initializePayment, { isLoading: initializing }] = useInitializePaymentMutation();
  const [recordManualPayment, { isLoading: recordingManual }] = useRecordManualPaymentMutation();

  const handleInitializePayment = async () => {
    if (!currentPropertyId || !paymentAmount) return;

    try {
      const result = await initializePayment({
        propertyId: currentPropertyId,
        amount: parseFloat(paymentAmount),
        description: paymentDescription || undefined,
      }).unwrap();

      // Redirect to Pesapal payment page
      window.location.href = result.data.redirectUrl;
    } catch (error: any) {
      alert(error.data?.message || 'Failed to initialize payment');
    }
  };

  const handleRecordManualPayment = async () => {
    if (!currentPropertyId || !manualPayment.amount) return;

    try {
      await recordManualPayment({
        propertyId: currentPropertyId,
        amount: parseFloat(manualPayment.amount),
        paymentMethod: manualPayment.paymentMethod,
        reference: manualPayment.reference || undefined,
        mpesaReceipt: manualPayment.mpesaReceipt || undefined,
      }).unwrap();

      setShowManualModal(false);
      setManualPayment({ amount: '', paymentMethod: 'MPESA', reference: '', mpesaReceipt: '' });
    } catch (error: any) {
      alert(error.data?.message || 'Failed to record payment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const getStatusVariant = (status: string): string => {
    const variants: Record<string, string> = {
      PENDING: 'warning',
      COMPLETED: 'success',
      FAILED: 'danger',
      REVERSED: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  if (!currentPropertyId) {
    return <Alert variant="warning">Please select a property to view payments.</Alert>;
  }

  if (loadingPayments || loadingBalance) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const payments = paymentsData?.data || [];
  const balance = balanceData?.data;

  return (
    <>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <DollarSign size={32} className="text-success mb-2" />
              <h6 className="text-muted">Total Paid</h6>
              <h3>{formatCurrency(balance?.balance?.totalPaid || 0)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <RefreshCw size={32} className="text-info mb-2" />
              <h6 className="text-muted">Unallocated Balance</h6>
              <h3>{formatCurrency(balance?.balance?.unallocatedBalance || 0)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <CreditCard size={32} className="text-danger mb-2" />
              <h6 className="text-muted">Outstanding Arrears</h6>
              <h3 className="text-danger">{formatCurrency(balance?.arrears || 0)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Card.Title as="h4">
              <CreditCard size={24} className="me-2" />
              Property Payments
            </Card.Title>
            <div>
              <Button variant="outline-primary" className="me-2" onClick={() => setShowManualModal(true)}>
                <Plus size={16} className="me-2" />
                Record Manual Payment
              </Button>
              <Button
                variant="primary"
                href="https://store.pesapal.com/rentiopayments"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CreditCard size={16} className="me-2" />
                Pay Online
              </Button>
            </div>
          </div>

          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Allocated</th>
                  <th>Unallocated</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment: PropertyPayment) => (
                    <tr key={payment.id}>
                      <td>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '-'}</td>
                      <td>{payment.reference || payment.mpesaReceipt || payment.pesapalOrderId || '-'}</td>
                      <td>{payment.paymentMethod}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td className="text-success">{formatCurrency(payment.allocatedAmount)}</td>
                      <td className="text-warning">{formatCurrency(payment.unallocatedAmount)}</td>
                      <td>
                        <Badge bg={getStatusVariant(payment.status)}>{payment.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Online Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Make Online Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount (KES)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="1"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Payment description"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleInitializePayment} disabled={initializing || !paymentAmount}>
            {initializing ? <Spinner size="sm" animation="border" /> : 'Proceed to Payment'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Manual Payment Modal */}
      <Modal show={false} onHide={() => setShowManualModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Record Manual Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount (KES)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={manualPayment.amount}
                onChange={(e) => setManualPayment({ ...manualPayment, amount: e.target.value })}
                min="1"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
                value={manualPayment.paymentMethod}
                onChange={(e) => setManualPayment({ ...manualPayment, paymentMethod: e.target.value })}
              >
                <option value="MPESA">M-Pesa</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reference / Transaction ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter reference"
                value={manualPayment.reference}
                onChange={(e) => setManualPayment({ ...manualPayment, reference: e.target.value })}
              />
            </Form.Group>
            {manualPayment.paymentMethod === 'MPESA' && (
              <Form.Group className="mb-3">
                <Form.Label>M-Pesa Receipt Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., QH12345678"
                  value={manualPayment.mpesaReceipt}
                  onChange={(e) => setManualPayment({ ...manualPayment, mpesaReceipt: e.target.value })}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowManualModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRecordManualPayment}
            disabled={recordingManual || !manualPayment.amount}
          >
            {recordingManual ? <Spinner size="sm" animation="border" /> : 'Record Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PropertyPayments;
