import { useState } from 'react';
import { Row, Col, Card, Button, Badge, Spinner, Alert, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Eye, CheckCircle } from 'lucide-react';
import { useGetPaymentsQuery, useProcessPaymentMutation } from '../../services/api/paymentApi';
import { useCurrentProperty } from '@/hooks/useCurrentProperty';
import Swal from 'sweetalert2';

const PaymentList = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { currentPropertyId } = useCurrentProperty();
  const activePropertyId = propertyId || currentPropertyId || '';

  const [statusFilter, setStatusFilter] = useState<string>('');

  const {
    data: paymentsData,
    isLoading,
    error,
  } = useGetPaymentsQuery(
    {
      propertyId: activePropertyId,
      params: statusFilter ? { status: statusFilter } : undefined,
    },
    { skip: !activePropertyId }
  );

  const [processPayment] = useProcessPaymentMutation();

  const payments = paymentsData?.data || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      COMPLETED: 'success',
      PENDING: 'warning',
      FAILED: 'danger',
      REVERSED: 'secondary',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      RENT: 'primary',
      DEPOSIT: 'info',
      PENALTY: 'danger',
      UTILITY: 'warning',
      OTHER: 'secondary',
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const handleProcessPayment = async (paymentId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Process Payment?',
        text: 'This will allocate the payment to pending invoices.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, process it',
        cancelButtonText: 'Cancel',
      });

      if (result.isConfirmed) {
        await processPayment({ propertyId: activePropertyId, id: paymentId }).unwrap();

        Swal.fire({
          title: 'Payment processed!',
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.data?.message || 'Failed to process payment',
        icon: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error loading payments: {(error as any)?.data?.message || 'Unknown error'}</Alert>;
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <Card.Title as="h4">Payments</Card.Title>
                  <p className="text-muted mb-0">Manage property payments and allocations</p>
                </div>
                <Button variant="primary" onClick={() => navigate('/finance/payments/create')}>
                  <Plus size={16} className="me-2" />
                  Record Payment
                </Button>
              </div>

              <div className="mb-3 d-flex gap-2">
                <Button
                  variant={statusFilter === '' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setStatusFilter('')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'COMPLETED' ? 'success' : 'outline-success'}
                  size="sm"
                  onClick={() => setStatusFilter('COMPLETED')}
                >
                  Completed
                </Button>
                <Button
                  variant={statusFilter === 'PENDING' ? 'warning' : 'outline-warning'}
                  size="sm"
                  onClick={() => setStatusFilter('PENDING')}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'FAILED' ? 'danger' : 'outline-danger'}
                  size="sm"
                  onClick={() => setStatusFilter('FAILED')}
                >
                  Failed
                </Button>
              </div>

              {payments.length === 0 ? (
                <div className="text-center p-5">
                  <p className="text-muted">No payments found</p>
                  <Button variant="primary" onClick={() => navigate('/finance/payments/create')}>
                    Record First Payment
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Tenant</th>
                        <th>Unit</th>
                        <th>Type</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Allocated</th>
                        <th>Unallocated</th>
                        <th>Status</th>
                        <th>Processed</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>
                            <div className="small">
                              {new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {new Date(payment.paidAt || payment.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td>
                            <div>{payment.lease.user.fullName}</div>
                            <div className="small text-muted">{payment.lease.user.phone}</div>
                          </td>
                          <td>
                            <div>{payment.lease.unit.unitNumber}</div>
                            <div className="small text-muted">{payment.lease.unit.type}</div>
                          </td>
                          <td>{getTypeBadge(payment.type)}</td>
                          <td>
                            <span className="small">{payment.method}</span>
                            {payment.mpesaReceipt && (
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                {payment.mpesaReceipt}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong>KES {Number(payment.amount).toLocaleString()}</strong>
                          </td>
                          <td>
                            <span className="text-success">KES {Number(payment.allocatedAmount).toLocaleString()}</span>
                          </td>
                          <td>
                            <span className={Number(payment.unallocatedAmount) > 0 ? 'text-warning' : 'text-muted'}>
                              KES {Number(payment.unallocatedAmount).toLocaleString()}
                            </span>
                          </td>
                          <td>{getStatusBadge(payment.status)}</td>
                          <td className="text-center">
                            {payment.isProcessed ? (
                              <CheckCircle size={18} className="text-success" />
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/finance/payments/${payment.id}`)}
                              >
                                <Eye size={14} />
                              </Button>
                              {payment.status === 'COMPLETED' && !payment.isProcessed && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleProcessPayment(payment.id)}
                                  title="Process payment allocation"
                                >
                                  <CheckCircle size={14} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PaymentList;
