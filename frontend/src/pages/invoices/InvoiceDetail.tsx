import { Row, Col, Card, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { InvoiceStatus } from '../../types/invoice.types';
import { useGetInvoiceQuery } from '../../services/api/invoiceApi';
import { generateInvoicePDF } from '../../utils/invoicePdf';

const InvoiceDetail = () => {
  console.log('Rendering InvoiceDetail component');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useGetInvoiceQuery(id!, { skip: !id });
  const invoice = data?.data || null;

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

  const handleDownloadPDF = () => {
    if (!invoice) return;
    generateInvoicePDF(invoice);
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
      <Row>
        <Col xl={12}>
          <Alert variant="danger">
            {error && 'data' in error ? (error as any).data?.message : 'Invoice not found'}
            <div className="mt-3">
              <Button variant="outline-danger" onClick={() => navigate('/finance/invoices')}>
                <ArrowLeft size={16} className="me-2" />
                Back to Invoices
              </Button>
            </div>
          </Alert>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <Card.Title as="h4">Invoice Details</Card.Title>
                  <p className="text-muted mb-0">Invoice Number: {invoice.invoiceNumber}</p>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="primary" onClick={handleDownloadPDF}>
                    <Download size={16} className="me-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/finance/invoices')}>
                    <ArrowLeft size={16} className="me-2" />
                    Back
                  </Button>
                </div>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="mb-3">Customer Information</h6>
                  <p className="mb-1">
                    <strong>Name:</strong> {invoice.customer?.fullName || 'N/A'}
                  </p>
                  <p className="mb-1">
                    <strong>Email:</strong> {invoice.customer?.email || 'N/A'}
                  </p>
                  <p className="mb-1">
                    <strong>Phone:</strong> {invoice.customer?.phone || 'N/A'}
                  </p>
                </Col>

                <Col md={6}>
                  <h6 className="mb-3">Property & Unit Information</h6>
                  <p className="mb-1">
                    <strong>Property:</strong> {invoice.property?.name || 'N/A'}
                  </p>
                  <p className="mb-1">
                    <strong>Unit:</strong> {invoice.unit?.unitNumber || 'N/A'}
                  </p>
                  <p className="mb-1">
                    <strong>Type:</strong> {invoice.unit?.type || 'N/A'}
                  </p>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={3}>
                  <p className="mb-1 text-muted">Issue Date</p>
                  <p className="fw-bold">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                </Col>
                <Col md={3}>
                  <p className="mb-1 text-muted">Due Date</p>
                  <p className="fw-bold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </Col>
                <Col md={3}>
                  <p className="mb-1 text-muted">Status</p>
                  <Badge bg={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                </Col>
                <Col md={3}>
                  <p className="mb-1 text-muted">VAT Rate</p>
                  <p className="fw-bold">{invoice.vatRate}%</p>
                </Col>
              </Row>

              <h6 className="mb-3">Invoice Items</h6>
              <div className="table-responsive mb-4">
                <Table bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>Item Name</th>
                      <th>Description</th>
                      <th className="text-end">Unit Amount</th>
                      <th className="text-center">Quantity</th>
                      <th>Duration</th>
                      <th>Billing Period</th>
                      <th className="text-center">VAT Incl.</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item) => (
                      <tr key={item.id}>
                        <td>{item.itemName}</td>
                        <td>{item.itemDescription || '-'}</td>
                        <td className="text-end">KES {Number(item.unitAmount || 0).toFixed(2)}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td>{item.billingDuration}</td>
                        <td>{item.billingPeriod ? new Date(item.billingPeriod).toLocaleDateString() : '-'}</td>
                        <td className="text-center">{item.vatable ? '✓' : '-'}</td>
                        <td className="text-end">KES {Number(item.total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <Row>
                <Col md={{ span: 4, offset: 8 }}>
                  <div className="d-flex justify-content-between mb-2">
                    <strong>Subtotal:</strong>
                    <span>KES {Number(invoice.subTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <strong>VAT ({invoice.vatRate}%):</strong>
                    <span>KES {Number(invoice.vatAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-2">
                    <h5>Total:</h5>
                    <h5>KES {Number(invoice.totalAmount || 0).toFixed(2)}</h5>
                  </div>
                </Col>
              </Row>

              {invoice.notes && (
                <Row className="mt-4">
                  <Col md={12}>
                    <h6 className="mb-2">Notes</h6>
                    <Alert variant="info" className="mb-0">
                      {invoice.notes}
                    </Alert>
                  </Col>
                </Row>
              )}

              {(invoice as any).allocations && (invoice as any).allocations.length > 0 && (
                <Row className="mt-4">
                  <Col md={12}>
                    <h6 className="mb-3">Payment History</h6>
                    <div className="table-responsive">
                      <Table bordered hover>
                        <thead className="table-light">
                          <tr>
                            <th>Payment Date</th>
                            <th>Reference</th>
                            <th className="text-end">Amount Paid</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(invoice as any).allocations.map((allocation: any) => (
                            <tr key={allocation.id}>
                              <td>
                                {new Date(allocation.payment.paidAt).toLocaleDateString()}{' '}
                                <span className="text-muted small">
                                  {new Date(allocation.payment.paidAt).toLocaleTimeString()}
                                </span>
                              </td>
                              <td>{allocation.payment.reference || 'N/A'}</td>
                              <td className="text-end text-success fw-bold">
                                KES {Number(allocation.amount).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                          <tr className="table-info">
                            <td colSpan={2} className="fw-bold">
                              Total Paid:
                            </td>
                            <td className="text-end text-success fw-bold">
                              KES{' '}
                              {(invoice as any).allocations
                                .reduce((sum: number, a: any) => sum + Number(a.amount), 0)
                                .toFixed(2)}
                            </td>
                          </tr>
                          <tr className="table-warning">
                            <td colSpan={2} className="fw-bold">
                              Balance Due:
                            </td>
                            <td className="text-end text-danger fw-bold">
                              KES{' '}
                              {(
                                Number(invoice.totalAmount) -
                                (invoice as any).allocations.reduce((sum: number, a: any) => sum + Number(a.amount), 0)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default InvoiceDetail;
