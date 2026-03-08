import { useState } from 'react';
import { Row, Col, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import { Plus, Trash2, FileDown } from 'lucide-react';
import Swal from 'sweetalert2';
import { PayslipData, PayslipIncome, PayslipDeduction, PayslipCompanyContribution } from '../../types/payslip.types';
import { generatePayslipPDF } from '../../utils/payslipPdf';

const PayslipGenerator = () => {
  const [payslip, setPayslip] = useState<PayslipData>({
    companyName: 'NDALAT HILLS DIPLOMA TTTC.',
    companyAddress: 'P.O private bag 2507, Eldoret.',
    firstName: 'John',
    lastName: 'Doe',
    employeeId: '001',
    position: 'Software Engineer',
    department: 'Engineering',
    socialSecurityNo: '12345678',
    taxRefNumber: 'A00000000SP',
    physicalAddress: '-',
    periodStartDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    periodEndDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    paymentDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    paymentFrequency: 'MONTHLY',
    taxStatus: 'Resident(Individual)',
    currency: 'KES',
    payRate: 32000,
    incomeItems: [{ description: 'Basic Pay', current: 32000, ytdAmount: 64000 }],
    deductionItems: [{ description: 'Tax Deducted', current: 4800, ytdAmount: 9600 }],
    companyContributions: [],
    totalEarnings: 32000,
    totalDeductions: 4800,
    totalEarningsYTD: 64000,
    totalDeductionsYTD: 9600,
    netPay: 27200,
    companyLogo: 'http://192.168.100.66:5173/images/NHTTC.png',
  });

  const handleCompanyInfoChange = (field: string, value: any) => {
    setPayslip((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeInfoChange = (field: string, value: any) => {
    setPayslip((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddIncome = () => {
    const newIncome: PayslipIncome = {
      description: '',
      current: 0,
      ytdAmount: 0,
    };
    setPayslip((prev) => ({
      ...prev,
      incomeItems: [...prev.incomeItems, newIncome],
    }));
  };

  const handleUpdateIncome = (index: number, field: string, value: any) => {
    const updated = [...payslip.incomeItems];
    updated[index] = { ...updated[index], [field]: value };
    setPayslip((prev) => ({ ...prev, incomeItems: updated }));
  };

  const handleRemoveIncome = (index: number) => {
    setPayslip((prev) => ({
      ...prev,
      incomeItems: prev.incomeItems.filter((_, i) => i !== index),
    }));
  };

  const handleAddDeduction = () => {
    const newDeduction: PayslipDeduction = {
      description: '',
      current: 0,
      ytdAmount: 0,
    };
    setPayslip((prev) => ({
      ...prev,
      deductionItems: [...prev.deductionItems, newDeduction],
    }));
  };

  const handleUpdateDeduction = (index: number, field: string, value: any) => {
    const updated = [...payslip.deductionItems];
    updated[index] = { ...updated[index], [field]: value };
    setPayslip((prev) => ({ ...prev, deductionItems: updated }));
  };

  const handleRemoveDeduction = (index: number) => {
    setPayslip((prev) => ({
      ...prev,
      deductionItems: prev.deductionItems.filter((_, i) => i !== index),
    }));
  };

  const handleAddContribution = () => {
    const newContribution: PayslipCompanyContribution = {
      description: '',
      amount: 0,
      ytdAmount: 0,
    };
    setPayslip((prev) => ({
      ...prev,
      companyContributions: [...prev.companyContributions, newContribution],
    }));
  };

  const handleUpdateContribution = (index: number, field: string, value: any) => {
    const updated = [...payslip.companyContributions];
    updated[index] = { ...updated[index], [field]: value };
    setPayslip((prev) => ({ ...prev, companyContributions: updated }));
  };

  const handleRemoveContribution = (index: number) => {
    setPayslip((prev) => ({
      ...prev,
      companyContributions: prev.companyContributions.filter((_, i) => i !== index),
    }));
  };

  const calculateTotals = () => {
    const totalEarnings = payslip.incomeItems.reduce((sum, item) => sum + Number(item.current), 0);
    const totalDeductions = payslip.deductionItems.reduce((sum, item) => sum + Number(item.current), 0);
    const totalEarningsYTD = payslip.incomeItems.reduce((sum, item) => sum + Number(item.ytdAmount), 0);
    const totalDeductionsYTD = payslip.deductionItems.reduce((sum, item) => sum + Number(item.ytdAmount), 0);
    const netPay = totalEarnings - totalDeductions;

    return {
      totalEarnings,
      totalDeductions,
      totalEarningsYTD,
      totalDeductionsYTD,
      netPay,
    };
  };

  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return '';
    }
  };

  const handleGeneratePDF = async () => {
    if (!payslip.firstName || !payslip.lastName) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill in employee first and last name',
        icon: 'error',
      });
      return;
    }

    // Show loading indicator
    Swal.fire({
      title: 'Generating PDF',
      text: 'Please wait...',
      icon: 'info',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const totals = calculateTotals();
    let finalPayslip: PayslipData = {
      ...payslip,
      ...totals,
    };

    // Convert logo to base64 if it exists
    if (payslip.companyLogo && !payslip.companyLogo.startsWith('data:')) {
      const base64Logo = await convertImageToBase64(payslip.companyLogo);
      if (base64Logo) {
        finalPayslip = {
          ...finalPayslip,
          companyLogo: base64Logo,
        };
      }
    }

    generatePayslipPDF(finalPayslip);

    Swal.fire({
      title: 'Success',
      text: 'Payslip PDF generated successfully',
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: payslip.currency,
    }).format(Number(value));
  };

  const totals = calculateTotals();

  return (
    <Row>
      <Col xl={12}>
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Card.Title as="h4">Create Payslip</Card.Title>
              <Button variant="primary" onClick={handleGeneratePDF}>
                <FileDown size={16} className="me-2" />
                Generate PDF
              </Button>
            </div>

            {/* Company Information */}
            <Card className="mb-4" style={{ backgroundColor: '#f8f9fa' }}>
              <Card.Header>
                <Card.Title as="h6" className="mb-0">
                  Company Information
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Logo URL</Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={payslip.companyLogo || ''}
                        onChange={(e) => handleCompanyInfoChange('companyLogo', e.target.value)}
                      />
                      <Form.Text className="text-muted">Default: https://www.thehillsttc.ac.ke/logo.png</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Name</Form.Label>
                      <Form.Control
                        value={payslip.companyName}
                        onChange={(e) => handleCompanyInfoChange('companyName', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Address</Form.Label>
                      <Form.Control
                        value={payslip.companyAddress}
                        onChange={(e) => handleCompanyInfoChange('companyAddress', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Employee Information */}
            <Card className="mb-4" style={{ backgroundColor: '#f8f9fa' }}>
              <Card.Header>
                <Card.Title as="h6" className="mb-0">
                  Employee Information
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name *</Form.Label>
                      <Form.Control
                        value={payslip.firstName}
                        onChange={(e) => handleEmployeeInfoChange('firstName', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name *</Form.Label>
                      <Form.Control
                        value={payslip.lastName}
                        onChange={(e) => handleEmployeeInfoChange('lastName', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Employee ID</Form.Label>
                      <Form.Control
                        value={payslip.employeeId}
                        onChange={(e) => handleEmployeeInfoChange('employeeId', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Position</Form.Label>
                      <Form.Control
                        value={payslip.position}
                        onChange={(e) => handleEmployeeInfoChange('position', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax Ref Number</Form.Label>
                      <Form.Control
                        value={payslip.taxRefNumber}
                        onChange={(e) => handleEmployeeInfoChange('taxRefNumber', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Social Security No</Form.Label>
                      <Form.Control
                        value={payslip.socialSecurityNo}
                        onChange={(e) => handleEmployeeInfoChange('socialSecurityNo', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Currency</Form.Label>
                      <Form.Control
                        value={payslip.currency}
                        onChange={(e) => handleEmployeeInfoChange('currency', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pay Rate</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>{payslip.currency}</InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={payslip.payRate}
                          onChange={(e) => handleEmployeeInfoChange('payRate', Number(e.target.value))}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Period Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={payslip.periodStartDate.toISOString().split('T')[0]}
                        onChange={(e) => handleEmployeeInfoChange('periodStartDate', new Date(e.target.value))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Period End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={payslip.periodEndDate.toISOString().split('T')[0]}
                        onChange={(e) => handleEmployeeInfoChange('periodEndDate', new Date(e.target.value))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Physical Address</Form.Label>
                      <Form.Control
                        value={payslip.physicalAddress}
                        onChange={(e) => handleEmployeeInfoChange('physicalAddress', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Income Items */}
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title as="h6" className="mb-0">
                  Income
                </Card.Title>
                <Button variant="success" size="sm" onClick={handleAddIncome}>
                  <Plus size={14} className="me-1" /> Add Income
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th style={{ width: '120px' }}>Qty</th>
                        <th style={{ width: '140px' }}>Current</th>
                        <th style={{ width: '100px' }}>Tax Code</th>
                        <th style={{ width: '140px' }}>YTD Amount</th>
                        <th style={{ width: '60px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payslip.incomeItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-3">
                            No income items. Click "Add Income" to add one.
                          </td>
                        </tr>
                      ) : (
                        payslip.incomeItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <Form.Control
                                size="sm"
                                value={item.description}
                                onChange={(e) => handleUpdateIncome(idx, 'description', e.target.value)}
                              />
                            </td>
                            <td>
                              <Form.Control
                                size="sm"
                                type="number"
                                value={item.quantity || ''}
                                onChange={(e) =>
                                  handleUpdateIncome(
                                    idx,
                                    'quantity',
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                              />
                            </td>
                            <td>
                              <InputGroup size="sm">
                                <InputGroup.Text>{payslip.currency}</InputGroup.Text>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  value={item.current}
                                  onChange={(e) => handleUpdateIncome(idx, 'current', Number(e.target.value))}
                                />
                              </InputGroup>
                            </td>
                            <td>
                              <Form.Control
                                size="sm"
                                value={item.taxCode || ''}
                                onChange={(e) => handleUpdateIncome(idx, 'taxCode', e.target.value)}
                              />
                            </td>
                            <td>
                              <InputGroup size="sm">
                                <InputGroup.Text>{payslip.currency}</InputGroup.Text>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  value={item.ytdAmount}
                                  onChange={(e) => handleUpdateIncome(idx, 'ytdAmount', Number(e.target.value))}
                                />
                              </InputGroup>
                            </td>
                            <td>
                              <Button variant="danger" size="sm" onClick={() => handleRemoveIncome(idx)}>
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
                <div className="mt-3 text-end">
                  <strong>Total Earnings: {formatCurrency(totals.totalEarnings)}</strong>
                </div>
              </Card.Body>
            </Card>

            {/* Deduction Items */}
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title as="h6" className="mb-0">
                  Deductions
                </Card.Title>
                <Button variant="success" size="sm" onClick={handleAddDeduction}>
                  <Plus size={14} className="me-1" /> Add Deduction
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th style={{ width: '140px' }}>Balance</th>
                        <th style={{ width: '140px' }}>Current</th>
                        <th style={{ width: '100px' }}>Tax Code</th>
                        <th style={{ width: '140px' }}>YTD Amount</th>
                        <th style={{ width: '60px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payslip.deductionItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-3">
                            No deduction items. Click "Add Deduction" to add one.
                          </td>
                        </tr>
                      ) : (
                        payslip.deductionItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <Form.Control
                                size="sm"
                                value={item.description}
                                onChange={(e) => handleUpdateDeduction(idx, 'description', e.target.value)}
                              />
                            </td>
                            <td>
                              <InputGroup size="sm">
                                <InputGroup.Text>{payslip.currency}</InputGroup.Text>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  value={item.balance || ''}
                                  onChange={(e) =>
                                    handleUpdateDeduction(
                                      idx,
                                      'balance',
                                      e.target.value ? Number(e.target.value) : undefined
                                    )
                                  }
                                />
                              </InputGroup>
                            </td>
                            <td>
                              <InputGroup size="sm">
                                <InputGroup.Text>{payslip.currency}</InputGroup.Text>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  value={item.current}
                                  onChange={(e) => handleUpdateDeduction(idx, 'current', Number(e.target.value))}
                                />
                              </InputGroup>
                            </td>
                            <td>
                              <Form.Control
                                size="sm"
                                value={item.taxCode || ''}
                                onChange={(e) => handleUpdateDeduction(idx, 'taxCode', e.target.value)}
                              />
                            </td>
                            <td>
                              <InputGroup size="sm">
                                <InputGroup.Text>{payslip.currency}</InputGroup.Text>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  value={item.ytdAmount}
                                  onChange={(e) => handleUpdateDeduction(idx, 'ytdAmount', Number(e.target.value))}
                                />
                              </InputGroup>
                            </td>
                            <td>
                              <Button variant="danger" size="sm" onClick={() => handleRemoveDeduction(idx)}>
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
                <div className="mt-3 text-end">
                  <strong>Total Deductions: {formatCurrency(totals.totalDeductions)}</strong>
                </div>
              </Card.Body>
            </Card>

            {/* Company Contributions */}
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title as="h6" className="mb-0">
                  Company Contributions
                </Card.Title>
                <Button variant="success" size="sm" onClick={handleAddContribution}>
                  <Plus size={14} className="me-1" /> Add Contribution
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th style={{ width: '140px' }}>Amount</th>
                        <th style={{ width: '140px' }}>YTD Amount</th>
                        <th style={{ width: '60px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payslip.companyContributions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-3">
                            No company contributions. Click "Add Contribution" to add one.
                          </td>
                        </tr>
                      ) : (
                        payslip.companyContributions.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <Form.Control
                                size="sm"
                                value={item.description}
                                onChange={(e) => handleUpdateContribution(idx, 'description', e.target.value)}
                              />
                            </td>
                            <td>
                              <InputGroup size="sm">
                                <InputGroup.Text>{payslip.currency}</InputGroup.Text>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  value={item.amount}
                                  onChange={(e) => handleUpdateContribution(idx, 'amount', Number(e.target.value))}
                                />
                              </InputGroup>
                            </td>
                            <td>
                              <InputGroup size="sm">
                                <InputGroup.Text>{payslip.currency}</InputGroup.Text>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  value={item.ytdAmount}
                                  onChange={(e) => handleUpdateContribution(idx, 'ytdAmount', Number(e.target.value))}
                                />
                              </InputGroup>
                            </td>
                            <td>
                              <Button variant="danger" size="sm" onClick={() => handleRemoveContribution(idx)}>
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Summary */}
            <Card style={{ backgroundColor: '#f0f8ff', borderLeft: '4px solid #1a5490' }}>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Total Earnings:</strong> {formatCurrency(totals.totalEarnings)}
                    </p>
                    <p className="mb-2">
                      <strong>Total Earnings YTD:</strong> {formatCurrency(totals.totalEarningsYTD)}
                    </p>
                    <p className="mb-0">
                      <strong>Total Deductions:</strong> {formatCurrency(totals.totalDeductions)}
                    </p>
                  </Col>
                  <Col md={6} className="text-end">
                    <div style={{ color: '#1a5490' }}>
                      <h5 className="mb-2">
                        <strong>Net Pay</strong>
                      </h5>
                      <h3 style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatCurrency(totals.netPay)}</h3>
                      <p className="text-muted">YTD Deductions: {formatCurrency(totals.totalDeductionsYTD)}</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default PayslipGenerator;
