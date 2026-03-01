import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner, Alert, Form, InputGroup, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Search, FileStack, Send } from 'lucide-react';
import Swal from 'sweetalert2';
import { InvoiceStatus, type Invoice } from '../../types/invoice.types';
import {
  useGetInvoicesQuery,
  useDeleteInvoiceMutation,
  useBulkCreateInvoicesFromBillingItemsMutation,
  useSendInvoiceNotificationMutation,
  type BulkInvoiceResult,
} from '../../services/api/invoiceApi';
import { useAppSelector } from '@/store/store';

const InvoiceList = () => {
  const navigate = useNavigate();
  const currentPropertyId = useAppSelector((state) => state.property.currentPropertyId);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Bulk invoice modal state
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const [bulkInvoiceResult, setBulkInvoiceResult] = useState<BulkInvoiceResult | null>(null);
  const [showBulkResultModal, setShowBulkResultModal] = useState(false);

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useGetInvoicesQuery({
    status: statusFilter as InvoiceStatus | undefined,
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
  });

  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [bulkCreateInvoices, { isLoading: isBulkInvoiceLoading }] = useBulkCreateInvoicesFromBillingItemsMutation();
  const [sendInvoiceNotification, { isLoading: isSendingNotification }] = useSendInvoiceNotificationMutation();

  const invoices = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    if (currentPropertyId) {
      refetch();
      setCurrentPage(1);
    }
  }, [currentPropertyId, refetch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await deleteInvoice(id).unwrap();
    } catch (err: any) {
      alert(err.data?.message || 'Error deleting invoice');
    }
  };

  const handleView = (id: string) => {
    navigate(`/finance/invoices/${id}`);
  };

  const handleBulkCreateInvoices = async () => {
    setShowBulkConfirmModal(false);
    try {
      const res = await bulkCreateInvoices().unwrap();
      setBulkInvoiceResult(res);
      setShowBulkResultModal(true);
    } catch (err: any) {
      Swal.fire({
        title: err.data?.message || 'Error creating invoices',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
      });
    }
  };

  const handleResendInvoice = async (id: string, invoiceNumber: string) => {
    try {
      await sendInvoiceNotification(id).unwrap();
      Swal.fire({
        title: 'Success',
        text: `Invoice ${invoiceNumber} sent successfully`,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
      });
      refetch();
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.data?.message || 'Failed to send invoice',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
      });
    }
  };

  const getStatusVariant = (status: InvoiceStatus): string => {
    const variants: Record<InvoiceStatus, string> = {
      DRAFT: 'secondary',
      SENT: 'info',
      PAID: 'success',
      OVERDUE: 'danger',
      CANCELLED: 'warning',
    };
    return variants[status] || 'secondary';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-center mt-3">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            size="sm"
            variant={page === currentPage ? 'primary' : 'outline-primary'}
            onClick={() => setCurrentPage(page)}
            className="me-1"
          >
            {page}
          </Button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {JSON.stringify(error)}
      </Alert>
    );
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Card.Title as="h4">Invoices</Card.Title>
                <div className="d-flex gap-2">
                  <Button variant="outline-success" onClick={() => setShowBulkConfirmModal(true)}>
                    <FileStack size={16} className="me-2" />
                    Bulk Create Invoices
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/finance/invoices/create')}>
                    <Plus size={16} className="me-2" />
                    Create Invoice
                  </Button>
                </div>
              </div>

              <Row className="mb-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search size={16} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Customer</th>
                      <th>Property</th>
                      <th>Unit</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      invoices.map((invoice: Invoice) => (
                        <tr key={invoice.id}>
                          <td>{invoice.invoiceNumber}</td>
                          <td>{invoice.customer?.fullName}</td>
                          <td>{invoice.property?.name}</td>
                          <td>{invoice.unit?.unitNumber}</td>
                          <td>{formatCurrency(invoice.totalAmount)}</td>
                          <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                          <td>
                            <Badge bg={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleView(invoice.id)}
                                title="View Invoice"
                              >
                                <Eye size={16} />
                              </Button>
                              {invoice.status === InvoiceStatus.DRAFT && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => handleResendInvoice(invoice.id, invoice.invoiceNumber)}
                                  disabled={isSendingNotification}
                                  title="Send Invoice"
                                >
                                  {isSendingNotification ? (
                                    <Spinner animation="border" size="sm" />
                                  ) : (
                                    <Send size={16} />
                                  )}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {renderPagination()}

              {data?.pagination && (
                <div className="text-muted mt-3">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, data.pagination.totalItems)} of {data.pagination.totalItems}{' '}
                  invoices
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bulk Create Invoices Confirmation Modal */}
      <Modal show={showBulkConfirmModal} onHide={() => setShowBulkConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Create Invoices</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This will create invoices for all <strong>PENDING</strong> billing items in this property, grouped by
            customer. Each customer will receive one invoice containing all their pending billing items as line items.
          </p>
          <p className="text-muted small mb-0">Customers with no pending billing items will be skipped.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleBulkCreateInvoices} disabled={isBulkInvoiceLoading}>
            {isBulkInvoiceLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              <>
                <FileStack size={16} className="me-2" />
                Create Invoices
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Create Invoices Result Modal */}
      <Modal
        show={showBulkResultModal}
        onHide={() => {
          setShowBulkResultModal(false);
          setBulkInvoiceResult(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Bulk Invoice Creation Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bulkInvoiceResult && (
            <>
              <div className="d-flex gap-3 mb-4">
                <div className="p-3 bg-success bg-opacity-10 rounded text-center flex-fill">
                  <div className="fs-3 fw-bold text-success">{bulkInvoiceResult.data.created.length}</div>
                  <div className="text-muted small">Invoices Created</div>
                </div>
                <div className="p-3 bg-warning bg-opacity-10 rounded text-center flex-fill">
                  <div className="fs-3 fw-bold text-warning">{bulkInvoiceResult.data.skipped.length}</div>
                  <div className="text-muted small">Skipped</div>
                </div>
              </div>

              {bulkInvoiceResult.data.created.length > 0 && (
                <>
                  <h6 className="text-success mb-2">Created Invoices</h6>
                  <Table size="sm" bordered className="mb-4">
                    <thead className="table-success">
                      <tr>
                        <th>Invoice #</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkInvoiceResult.data.created.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.invoiceNumber}</td>
                          <td>{row.customerName}</td>
                          <td>{row.itemCount}</td>
                          <td>{formatCurrency(row.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}

              {bulkInvoiceResult.data.skipped.length > 0 && (
                <>
                  <h6 className="text-warning mb-2">Skipped</h6>
                  <Table size="sm" bordered>
                    <thead className="table-warning">
                      <tr>
                        <th>Customer</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkInvoiceResult.data.skipped.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.customerName}</td>
                          <td>{row.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              setShowBulkResultModal(false);
              setBulkInvoiceResult(null);
            }}
          >
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InvoiceList;
