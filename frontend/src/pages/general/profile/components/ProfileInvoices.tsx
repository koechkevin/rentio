import { Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { useGetInvoicesQuery } from '../../../../services/api/invoiceApi';
import { InvoiceStatus } from '../../../../types/invoice.types';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { generateInvoicePDF } from '../../../../utils/invoicePdf';

interface ProfileInvoicesProps {
  userId: string;
}

const ProfileInvoices = ({ userId }: ProfileInvoicesProps) => {
  const { data, isLoading, error } = useGetInvoicesQuery({ customerId: userId, limit: 50 }, { skip: !userId });

  const getStatusVariant = (status: InvoiceStatus) => {
    const variants: Record<InvoiceStatus, string> = {
      [InvoiceStatus.DRAFT]: 'secondary',
      [InvoiceStatus.SENT]: 'info',
      [InvoiceStatus.PAID]: 'success',
      [InvoiceStatus.OVERDUE]: 'danger',
      [InvoiceStatus.CANCELLED]: 'dark',
    };
    return variants[status];
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
        <p className="mt-2 text-muted">Loading invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-0">
        Failed to load invoices. Please try again later.
      </Alert>
    );
  }

  const invoices = data?.data || [];

  if (invoices.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-receipt" style={{ fontSize: '3rem', color: '#ccc' }}></i>
        <h6 className="mt-3 mb-2">No Invoices Yet</h6>
        <p className="text-muted small mb-0">You don't have any invoices at the moment</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th className="text-end">Amount</th>
            <th>Due Date</th>
            <th>Status</th>
            <th className="text-center">Download</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                <Link to={`/finance/invoices/${invoice.id}`} className="text-decoration-none">
                  {invoice.invoiceNumber}
                </Link>
              </td>
              <td className="text-end">
                <strong>KES {formatAmount(invoice.totalAmount)}</strong>
              </td>
              <td>{formatDate(invoice.dueDate)}</td>
              <td>
                <Badge bg={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
              </td>
              <td className="text-center">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0"
                  onClick={() => generateInvoicePDF(invoice)}
                  title="Download PDF"
                >
                  <Download size={18} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {data?.pagination && data.pagination.totalItems > 0 && (
        <div className="mt-3 text-muted small text-center">
          Showing {invoices.length} of {data.pagination.totalItems} invoice(s)
        </div>
      )}
    </div>
  );
};

export default ProfileInvoices;
