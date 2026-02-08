import { useState } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Download, Plus, Search } from 'lucide-react';
import { InvoiceStatus, type Invoice } from '../../types/invoice.types';
import { useGetInvoicesQuery, useDeleteInvoiceMutation } from '../../services/api/invoiceApi';

const InvoiceList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const invoices = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

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
                <Button variant="primary" onClick={() => navigate('/finance/invoices/create')}>
                  <Plus size={16} className="me-2" />
                  Create Invoice
                </Button>
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
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleView(invoice.id)}
                              title="View Invoice"
                            >
                              <Eye size={16} />
                            </Button>
                            {invoice.status !== InvoiceStatus.PAID && (
                              <Button
                                variant="link"
                                size="sm"
                                className="text-danger"
                                onClick={() => handleDelete(invoice.id)}
                                title="Delete Invoice"
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
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
    </>
  );
};

export default InvoiceList;
