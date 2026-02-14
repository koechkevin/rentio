import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useGetPropertyInvoiceQuery } from '../../services/api/propertyInvoiceApi';
import { PropertyInvoiceStatus } from '../../types/propertyInvoice.types';
import { generatePropertyInvoicePDF } from '../../utils/propertyInvoicePdf';

const PropertyInvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetPropertyInvoiceQuery(id!);

  const invoice = data?.data;

  const getStatusVariant = (status: PropertyInvoiceStatus): string => {
    const variants: Record<PropertyInvoiceStatus, string> = {
      PENDING: 'warning',
      SENT: 'info',
      PAID: 'success',
      OVERDUE: 'danger',
      CANCELLED: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleDownloadPDF = () => {
    if (invoice) {
      generatePropertyInvoicePDF(invoice);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <Alert variant="danger" className="m-3">
        Invoice not found
      </Alert>
    );
  }

  const totalPaid = invoice.payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const balance = Number(invoice.totalAmount) - totalPaid;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
        <Button variant="outline-secondary" onClick={() => navigate('/billing/invoices')}>
          <ArrowLeft size={16} className="me-2" />
          Back to Invoices
        </Button>
        <div>
          <Button variant="outline-primary" className="me-2" onClick={handlePrint}>
            <Printer size={16} className="me-2" />
            Print
          </Button>
          <Button variant="primary" onClick={handleDownloadPDF}>
            <Download size={16} className="me-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <Card.Body className="p-4">
          {/* Header */}
          <Row className="mb-4">
            <Col md={6}>
              <h2 className="text-primary mb-1">RENTIO</h2>
              <p className="text-muted mb-0">Property Management System</p>
            </Col>
            <Col md={6} className="text-md-end">
              <h3 className="mb-1">PROPERTY INVOICE</h3>
              <p className="mb-0">
                <strong>Invoice #:</strong> {invoice.invoiceNumber}
              </p>
              <p className="mb-0">
                <strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
              <p className="mb-0">
                <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
              <Badge bg={getStatusVariant(invoice.status)} className="mt-2">
                {invoice.status}
              </Badge>
            </Col>
          </Row>

          <hr />

          {/* Bill To */}
          <Row className="mb-4">
            <Col md={6}>
              <h6 className="text-muted">BILL TO:</h6>
              <p className="mb-0">
                <strong>{invoice.property.owner?.fullName}</strong>
              </p>
              <p className="mb-0">{invoice.property.owner?.email}</p>
              <p className="mb-0">{invoice.property.owner?.phone}</p>
            </Col>
            <Col md={6}>
              <h6 className="text-muted">PROPERTY:</h6>
              <p className="mb-0">
                <strong>{invoice.property.name}</strong>
              </p>
              <p className="mb-0">
                {invoice.property.town}, {invoice.property.county}
              </p>
            </Col>
          </Row>

          {/* Billing Period */}
          <Row className="mb-4">
            <Col>
              <h6 className="text-muted">BILLING PERIOD:</h6>
              <p className="mb-0">
                {new Date(invoice.billingPeriodStart).toLocaleDateString()} -{' '}
                {new Date(invoice.billingPeriodEnd).toLocaleDateString()}
              </p>
            </Col>
          </Row>

          {/* Line Items */}
          <Table bordered className="mb-4">
            <thead className="table-light">
              <tr>
                <th>Unit</th>
                <th>Type</th>
                <th>Tenant</th>
                <th>Description</th>
                <th className="text-end">Rate</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.unitNumber}</td>
                    <td>{item.unitType}</td>
                    <td>{item.tenantName || '-'}</td>
                    <td>{item.description || 'Monthly management fee'}</td>
                    <td className="text-end">{formatCurrency(item.unitAmount, invoice.currency)}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">{formatCurrency(item.total, invoice.currency)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-3">
                    No items
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="text-end">
                  <strong>Subtotal</strong>
                </td>
                <td className="text-end">{formatCurrency(invoice.subtotal, invoice.currency)}</td>
              </tr>
              {Number(invoice.tax) > 0 && (
                <tr>
                  <td colSpan={6} className="text-end">
                    <strong>Tax</strong>
                  </td>
                  <td className="text-end">{formatCurrency(invoice.tax, invoice.currency)}</td>
                </tr>
              )}
              <tr className="table-primary">
                <td colSpan={6} className="text-end">
                  <strong>Total</strong>
                </td>
                <td className="text-end">
                  <strong>{formatCurrency(invoice.totalAmount, invoice.currency)}</strong>
                </td>
              </tr>
              {totalPaid > 0 && (
                <>
                  <tr className="table-success">
                    <td colSpan={6} className="text-end">
                      <strong>Paid</strong>
                    </td>
                    <td className="text-end">{formatCurrency(totalPaid, invoice.currency)}</td>
                  </tr>
                  <tr className="table-warning">
                    <td colSpan={6} className="text-end">
                      <strong>Balance Due</strong>
                    </td>
                    <td className="text-end">
                      <strong>{formatCurrency(balance, invoice.currency)}</strong>
                    </td>
                  </tr>
                </>
              )}
            </tfoot>
          </Table>

          {/* Payments */}
          {invoice.payments.length > 0 && (
            <>
              <h6 className="text-muted mb-3">PAYMENT HISTORY:</h6>
              <Table bordered size="sm">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th className="text-end">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '-'}</td>
                      <td>{payment.paymentMethod}</td>
                      <td>{payment.reference || payment.mpesaReceipt || '-'}</td>
                      <td className="text-end">{formatCurrency(payment.amount, invoice.currency)}</td>
                      <td>
                        <Badge bg={payment.status === 'COMPLETED' ? 'success' : 'warning'}>{payment.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-4">
              <h6 className="text-muted">NOTES:</h6>
              <p className="mb-0">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <hr className="mt-4" />
          <div className="text-center text-muted">
            <small>Thank you for using Rentio Property Management System</small>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default PropertyInvoiceDetail;
