import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Plus, FileText, Zap } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  BillingFrequency,
  BillingItemStatus,
  BillingItemType,
  BILLING_ITEM_TYPE_LABELS,
  type BillingItem,
} from '../../types/billingItem.types';
import {
  useGetBillingItemsQuery,
  useDeleteBillingItemMutation,
  useGenerateInvoiceFromBillingItemMutation,
  useBulkCreateRentBillingItemsMutation,
  type BulkRentResult,
} from '../../services/api/billingItemApi';
import { useGetUnitsQuery, type Unit as ApiUnit } from '../../services/api/unitApi';
import { useAppSelector } from '@/store/store';

const MONTHS = [
  { value: 'JAN', label: 'January' }, { value: 'FEB', label: 'February' },
  { value: 'MAR', label: 'March' },   { value: 'APR', label: 'April' },
  { value: 'MAY', label: 'May' },     { value: 'JUN', label: 'June' },
  { value: 'JUL', label: 'July' },    { value: 'AUG', label: 'August' },
  { value: 'SEP', label: 'September' },{ value: 'OCT', label: 'October' },
  { value: 'NOV', label: 'November' },{ value: 'DEC', label: 'December' },
];

const QUARTERS = [
  { value: 'Q1', label: 'Q1 (Jan–Mar)' },
  { value: 'Q2', label: 'Q2 (Apr–Jun)' },
  { value: 'Q3', label: 'Q3 (Jul–Sep)' },
  { value: 'Q4', label: 'Q4 (Oct–Dec)' },
];

const MONTH_ABBREVS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function getCurrentMonthAbbrev(): string {
  return MONTH_ABBREVS[new Date().getMonth()];
}

const BillingItemList = () => {
  const navigate = useNavigate();
  const currentPropertyId = useAppSelector((state) => state.property.currentPropertyId);

  const [unitFilter, setUnitFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Bulk rent modal state
  const [showBulkRentModal, setShowBulkRentModal] = useState(false);
  const [bulkFrequency, setBulkFrequency] = useState<BillingFrequency>(BillingFrequency.MONTHLY);
  const [bulkPeriod, setBulkPeriod] = useState(getCurrentMonthAbbrev());
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [bulkRentResult, setBulkRentResult] = useState<BulkRentResult | null>(null);
  const [showBulkRentResultModal, setShowBulkRentResultModal] = useState(false);

  const { data: unitsData } = useGetUnitsQuery(currentPropertyId ?? '', {
    skip: !currentPropertyId,
  });
  const units: ApiUnit[] = unitsData?.data || [];

  const { data, isLoading, error, refetch } = useGetBillingItemsQuery({
    unitId: unitFilter || undefined,
    status: (statusFilter as BillingItemStatus) || undefined,
    year: yearFilter ? Number(yearFilter) : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const [deleteBillingItem] = useDeleteBillingItemMutation();
  const [generateInvoice] = useGenerateInvoiceFromBillingItemMutation();
  const [bulkCreateRent, { isLoading: isBulkRentLoading }] = useBulkCreateRentBillingItemsMutation();

  const items: BillingItem[] = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    if (currentPropertyId) {
      refetch();
      setCurrentPage(1);
    }
  }, [currentPropertyId, refetch]);

  // Reset period when frequency changes
  useEffect(() => {
    if (bulkFrequency === BillingFrequency.MONTHLY) {
      setBulkPeriod(getCurrentMonthAbbrev());
    } else if (bulkFrequency === BillingFrequency.QUARTERLY) {
      setBulkPeriod('Q1');
    } else {
      setBulkPeriod('ANNUAL');
    }
  }, [bulkFrequency]);

  const getStatusVariant = (status: BillingItemStatus): string =>
    ({ PENDING: 'warning', INVOICED: 'success' }[status] ?? 'secondary');

  const formatCurrency = (amount: number | string, currency = 'KES') =>
    `${currency} ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  const formatPeriodLabel = (item: BillingItem): string => {
    const { frequency, billingPeriod, year } = item;
    if (frequency === 'ANNUALLY') return `Annual ${year}`;
    if (frequency === 'QUARTERLY') {
      const labels: Record<string, string> = {
        Q1: 'Q1 (Jan–Mar)', Q2: 'Q2 (Apr–Jun)',
        Q3: 'Q3 (Jul–Sep)', Q4: 'Q4 (Oct–Dec)',
      };
      return `${labels[billingPeriod] ?? billingPeriod} ${year}`;
    }
    const months: Record<string, string> = {
      JAN: 'Jan', FEB: 'Feb', MAR: 'Mar', APR: 'Apr',
      MAY: 'May', JUN: 'Jun', JUL: 'Jul', AUG: 'Aug',
      SEP: 'Sep', OCT: 'Oct', NOV: 'Nov', DEC: 'Dec',
    };
    return `${months[billingPeriod] ?? billingPeriod} ${year}`;
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete billing item?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete',
    });
    if (!result.isConfirmed) return;

    try {
      await deleteBillingItem(id).unwrap();
      Swal.fire({ title: 'Deleted', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
    } catch (err: any) {
      Swal.fire({ title: err.data?.message || 'Error deleting item', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    }
  };

  const handleGenerateInvoice = async (item: BillingItem) => {
    const typeLabel = BILLING_ITEM_TYPE_LABELS[item.itemType] ?? item.itemType;
    const result = await Swal.fire({
      title: 'Generate Invoice?',
      text: `Convert "${typeLabel}" billing item into an invoice for ${item.customer?.fullName ?? 'tenant'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Generate',
    });
    if (!result.isConfirmed) return;

    try {
      const res = await generateInvoice(item.id).unwrap();
      Swal.fire({
        title: 'Invoice created!',
        text: `Invoice ${res.data.invoiceNumber} generated successfully.`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'View Invoice',
        cancelButtonText: 'Stay here',
      }).then((r) => {
        if (r.isConfirmed) navigate(`/finance/invoices/${res.data.id}`);
      });
    } catch (err: any) {
      Swal.fire({ title: err.data?.message || 'Error generating invoice', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3500 });
    }
  };

  const handleBulkRentSubmit = async () => {
    try {
      const payload = {
        frequency: bulkFrequency,
        billingPeriod: bulkFrequency !== BillingFrequency.ANNUALLY ? bulkPeriod : undefined,
        year: bulkYear,
      };
      const res = await bulkCreateRent(payload).unwrap();
      setShowBulkRentModal(false);
      setBulkRentResult(res);
      setShowBulkRentResultModal(true);
    } catch (err: any) {
      Swal.fire({ title: err.data?.message || 'Error creating rent billing items', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3500 });
    }
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
    return <Alert variant="danger" className="m-3">{JSON.stringify(error)}</Alert>;
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Card.Title as="h4">Billing Items</Card.Title>
                <div className="d-flex gap-2">
                  <Button variant="outline-success" onClick={() => setShowBulkRentModal(true)}>
                    <Zap size={16} className="me-2" />
                    Bulk Create Rent
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/finance/billing-items/create')}>
                    <Plus size={16} className="me-2" />
                    New Billing Item
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <Row className="mb-3 g-2">
                <Col md={4}>
                  <Form.Select
                    value={unitFilter}
                    onChange={(e) => { setUnitFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">All Units</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.unitNumber}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="INVOICED">Invoiced</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Year"
                    value={yearFilter}
                    onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
                    min={2020}
                    max={2100}
                  />
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Unit</th>
                      <th>Customer</th>
                      <th>Billing Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-muted">
                          No billing items found
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id}>
                          <td>{BILLING_ITEM_TYPE_LABELS[item.itemType] ?? item.itemType}</td>
                          <td>{item.unit?.unitNumber ?? '—'}</td>
                          <td>{item.customer?.fullName ?? '—'}</td>
                          <td>{formatPeriodLabel(item)}</td>
                          <td>{formatCurrency(item.amount, item.currency)}</td>
                          <td>
                            <Badge bg={getStatusVariant(item.status)}>{item.status}</Badge>
                          </td>
                          <td>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => navigate(`/finance/billing-items/${item.id}`)}
                              title="View"
                            >
                              <Eye size={16} />
                            </Button>
                            {item.status === BillingItemStatus.PENDING && (
                              <>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-success"
                                  onClick={() => handleGenerateInvoice(item)}
                                  title="Generate Invoice"
                                >
                                  <FileText size={16} />
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-danger"
                                  onClick={() => handleDelete(item.id)}
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </>
                            )}
                            {item.status === BillingItemStatus.INVOICED && item.invoiceId && (
                              <Button
                                variant="link"
                                size="sm"
                                className="text-primary"
                                onClick={() => navigate(`/finance/invoices/${item.invoiceId}`)}
                                title="View Invoice"
                              >
                                <FileText size={16} />
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
                <div className="text-muted mt-2 small">
                  {data.pagination.totalItems} billing item{data.pagination.totalItems !== 1 ? 's' : ''}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bulk Create Rent Modal */}
      <Modal show={showBulkRentModal} onHide={() => setShowBulkRentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Create Rent Billing Items</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Creates a RENT billing item for every occupied unit in this property. Units that already have
            a rent billing item for the selected period will be skipped.
          </p>

          <Form.Group className="mb-3">
            <Form.Label>Billing Frequency</Form.Label>
            <Form.Select
              value={bulkFrequency}
              onChange={(e) => setBulkFrequency(e.target.value as BillingFrequency)}
            >
              <option value={BillingFrequency.MONTHLY}>Monthly</option>
              <option value={BillingFrequency.QUARTERLY}>Quarterly</option>
              <option value={BillingFrequency.ANNUALLY}>Annually</option>
            </Form.Select>
          </Form.Group>

          {bulkFrequency === BillingFrequency.MONTHLY && (
            <Form.Group className="mb-3">
              <Form.Label>Month</Form.Label>
              <Form.Select value={bulkPeriod} onChange={(e) => setBulkPeriod(e.target.value)}>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {bulkFrequency === BillingFrequency.QUARTERLY && (
            <Form.Group className="mb-3">
              <Form.Label>Quarter</Form.Label>
              <Form.Select value={bulkPeriod} onChange={(e) => setBulkPeriod(e.target.value)}>
                {QUARTERS.map((q) => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Year</Form.Label>
            <Form.Control
              type="number"
              value={bulkYear}
              onChange={(e) => setBulkYear(Number(e.target.value))}
              min={2020}
              max={2100}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkRentModal(false)} disabled={isBulkRentLoading}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleBulkRentSubmit} disabled={isBulkRentLoading}>
            {isBulkRentLoading ? (
              <><Spinner animation="border" size="sm" className="me-2" />Creating...</>
            ) : (
              <><Zap size={16} className="me-2" />Create Rent Items</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Rent Result Modal */}
      <Modal
        show={showBulkRentResultModal}
        onHide={() => { setShowBulkRentResultModal(false); setBulkRentResult(null); }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Bulk Rent Creation Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bulkRentResult && (
            <>
              <div className="d-flex gap-3 mb-4">
                <div className="p-3 bg-success bg-opacity-10 rounded text-center flex-fill">
                  <div className="fs-3 fw-bold text-success">{bulkRentResult.data.created.length}</div>
                  <div className="text-muted small">Created</div>
                </div>
                <div className="p-3 bg-warning bg-opacity-10 rounded text-center flex-fill">
                  <div className="fs-3 fw-bold text-warning">{bulkRentResult.data.skipped.length}</div>
                  <div className="text-muted small">Skipped</div>
                </div>
              </div>

              {bulkRentResult.data.created.length > 0 && (
                <>
                  <h6 className="text-success mb-2">Created</h6>
                  <Table size="sm" bordered className="mb-4">
                    <thead className="table-success">
                      <tr>
                        <th>Unit</th>
                        <th>Tenant</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkRentResult.data.created.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.unitNumber}</td>
                          <td>{row.tenantName}</td>
                          <td>KES {Number(row.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}

              {bulkRentResult.data.skipped.length > 0 && (
                <>
                  <h6 className="text-warning mb-2">Skipped</h6>
                  <Table size="sm" bordered>
                    <thead className="table-warning">
                      <tr>
                        <th>Unit</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkRentResult.data.skipped.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.unitNumber}</td>
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
          <Button variant="primary" onClick={() => { setShowBulkRentResultModal(false); setBulkRentResult(null); }}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BillingItemList;
