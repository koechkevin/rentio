import { useState } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, FileText } from 'lucide-react';
import { PropertyInvoiceStatus, type PropertyInvoice } from '../../types/propertyInvoice.types';
import { useGetPropertyInvoicesQuery, useGetBillingConfigQuery } from '../../services/api/propertyInvoiceApi';

const PropertyInvoiceList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useGetPropertyInvoicesQuery({
    status: statusFilter as PropertyInvoiceStatus | undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const { data: billingConfig } = useGetBillingConfigQuery();

  const invoices = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

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

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' });
    return startDate;
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

  if (isLoading) {
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
        Error loading invoices
      </Alert>
    );
  }

  return (
    <Row>
      <Col xl={12}>
        {billingConfig && (
          <Alert variant="info" className="mb-4">
            <strong>Billing Rate:</strong> {formatCurrency(billingConfig.data.ratePerUnit)} per occupied unit per month
          </Alert>
        )}

        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Card.Title as="h4">
                <FileText size={24} className="me-2" />
                Property Billing Invoices
              </Card.Title>
            </div>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
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
                    <th>Property</th>
                    <th>Billing Period</th>
                    <th>Occupied Units</th>
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
                    invoices.map((invoice: PropertyInvoice) => (
                      <tr key={invoice.id}>
                        <td>{invoice.invoiceNumber}</td>
                        <td>{invoice.property?.name}</td>
                        <td>{formatDateRange(invoice.billingPeriodStart, invoice.billingPeriodEnd)}</td>
                        <td>{invoice.occupiedUnits}</td>
                        <td>{formatCurrency(invoice.totalAmount, invoice.currency)}</td>
                        <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                        </td>
                        <td>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => navigate(`/billing/invoices/${invoice.id}`)}
                            title="View Invoice"
                          >
                            <Eye size={16} />
                          </Button>
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
  );
};

export default PropertyInvoiceList;
