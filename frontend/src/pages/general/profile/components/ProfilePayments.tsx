import { Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useGetTenantPaymentsQuery } from '../../../../services/api/paymentApi';
import { Link } from 'react-router-dom';

interface ProfilePaymentsProps {
  userId: string;
}

const ProfilePayments = ({ userId }: ProfilePaymentsProps) => {
  const { data, isLoading, error } = useGetTenantPaymentsQuery(undefined, { skip: !userId });

  const getStatusVariant = (status: string) => {
    const variants: Record<string, string> = {
      COMPLETED: 'success',
      PENDING: 'warning',
      FAILED: 'danger',
      REVERSED: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number | string) => {
    return Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" />
        <p className="mt-2 text-muted">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-0">
        Failed to load payments. Please try again later.
      </Alert>
    );
  }

  const payments = data?.data || [];

  if (payments.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-cash-stack" style={{ fontSize: '3rem', color: '#ccc' }}></i>
        <h6 className="mt-3 mb-2">No Payments Yet</h6>
        <p className="text-muted small mb-0">You haven't made any payments yet</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead>
          <tr>
            <th>Payment Date</th>
            <th className="text-end">Amount</th>
            <th>Allocated To Invoice(s)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>
                <div>{formatDate(payment.paidAt || payment.createdAt)}</div>
                <small className="text-muted">
                  {new Date(payment.paidAt || payment.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </small>
              </td>
              <td className="text-end">
                <strong>KES {formatAmount(payment.amount)}</strong>
              </td>
              <td>
                {payment.allocations && payment.allocations.length > 0 ? (
                  <div>
                    {payment.allocations.map((allocation, index) => (
                      <div key={allocation.id} className="mb-1">
                        <Link to={`/finance/invoices/${allocation.invoiceId}`} className="text-decoration-none">
                          {allocation.invoice.invoiceNumber}
                        </Link>
                        <span className="text-muted small ms-2">(KES {formatAmount(allocation.amount)})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted">Not allocated yet</span>
                )}
              </td>
              <td>
                <Badge bg={getStatusVariant(payment.status)}>{payment.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {payments.length > 0 && (
        <div className="mt-3 text-center">
          <small className="text-muted">
            Total Paid: <strong>KES {formatAmount(payments.reduce((sum, p) => sum + Number(p.amount), 0))}</strong>
          </small>
        </div>
      )}
    </div>
  );
};

export default ProfilePayments;
