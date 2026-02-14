import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLazyCheckPaymentStatusQuery } from '../../services/api/propertyPaymentApi';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkStatus, { data, isLoading, error }] = useLazyCheckPaymentStatusQuery();
  const [pollingCount, setPollingCount] = useState(0);

  const orderTrackingId = searchParams.get('OrderTrackingId');
  const orderMerchantReference = searchParams.get('OrderMerchantReference');

  useEffect(() => {
    if (orderTrackingId || orderMerchantReference) {
      checkStatus(orderTrackingId || orderMerchantReference || '');
    }
  }, [orderTrackingId, orderMerchantReference, checkStatus]);

  useEffect(() => {
    // Poll for status updates if payment is still pending
    if (data?.data?.status === 'PENDING' && pollingCount < 10) {
      const timer = setTimeout(() => {
        checkStatus(orderTrackingId || orderMerchantReference || '');
        setPollingCount((prev) => prev + 1);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [data, pollingCount, orderTrackingId, orderMerchantReference, checkStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  if (isLoading && pollingCount === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Card className="text-center p-5">
          <Spinner animation="border" className="mx-auto mb-3" />
          <h5>Verifying payment...</h5>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Card className="text-center p-5">
          <XCircle size={64} className="text-danger mx-auto mb-3" />
          <h5>Error verifying payment</h5>
          <p className="text-muted">Please check your payment status in the payments list.</p>
          <Button variant="primary" onClick={() => navigate('/billing/payments')}>
            Go to Payments
          </Button>
        </Card>
      </div>
    );
  }

  const payment = data?.data;

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      <Card className="text-center p-5" style={{ maxWidth: '500px' }}>
        {payment?.status === 'COMPLETED' && (
          <>
            <CheckCircle size={64} className="text-success mx-auto mb-3" />
            <h4 className="text-success">Payment Successful!</h4>
            <p className="text-muted">Your payment has been processed successfully.</p>
            <div className="my-4">
              <p className="mb-1">
                <strong>Amount:</strong> {formatCurrency(payment.amount)}
              </p>
              <p className="mb-1">
                <strong>Reference:</strong> {payment.reference || payment.pesapalOrderId}
              </p>
              <p className="mb-1">
                <strong>Date:</strong> {payment.paidAt ? new Date(payment.paidAt).toLocaleString() : '-'}
              </p>
            </div>
            {payment.allocations && payment.allocations.length > 0 && (
              <Alert variant="info">Payment has been allocated to {payment.allocations.length} invoice(s).</Alert>
            )}
          </>
        )}

        {payment?.status === 'PENDING' && (
          <>
            <Clock size={64} className="text-warning mx-auto mb-3" />
            <h4 className="text-warning">Payment Pending</h4>
            <p className="text-muted">Your payment is being processed. This may take a few moments.</p>
            {pollingCount < 10 && <Spinner animation="border" size="sm" className="mt-3" />}
          </>
        )}

        {payment?.status === 'FAILED' && (
          <>
            <XCircle size={64} className="text-danger mx-auto mb-3" />
            <h4 className="text-danger">Payment Failed</h4>
            <p className="text-muted">Unfortunately, your payment could not be processed. Please try again.</p>
          </>
        )}

        <div className="mt-4">
          <Button variant="primary" onClick={() => navigate('/billing/invoices')} className="me-2">
            View Invoices
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/billing/payments')}>
            View Payments
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentCallback;
