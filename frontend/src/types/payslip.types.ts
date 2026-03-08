export interface PayslipEmployee {
  firstName: string;
  lastName: string;
  ssn: string;
  position: string;
  birthDate: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  engagementDate: string;
  terminationDate?: string;
  costCenter: string;
  taxStatus: string;
  taxRefNumber: string;
  physicalAddress: string;
  currency: string;
}

export interface PayslipIncome {
  description: string;
  quantity?: number;
  current: number;
  taxCode?: string;
  ytdAmount: number;
}

export interface PayslipDeduction {
  description: string;
  balance?: number;
  current: number;
  taxCode?: string;
  ytdAmount: number;
}

export interface PayslipBenefit {
  name: string;
  amount: number;
  ytdAmount: number;
}

export interface PayslipCompanyContribution {
  description: string;
  amount: number;
  ytdAmount: number;
}

export interface PayslipData {
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  position: string;
  department?: string;
  birthDate?: Date;
  socialSecurityNo: string;
  taxRefNumber: string;
  physicalAddress: string;
  periodStartDate: Date;
  periodEndDate: Date;
  paymentDate: Date;
  paymentFrequency: 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY';
  taxStatus: string;
  currency: string;
  payRate: number;
  incomeItems: PayslipIncome[];
  deductionItems: PayslipDeduction[];
  companyContributions: PayslipCompanyContribution[];
  totalEarnings: number;
  totalDeductions: number;
  totalEarningsYTD: number;
  totalDeductionsYTD: number;
  netPay: number;
  notes?: string;
  bankDetails?: string;
}

export interface Payslip {
  id: string;
  companyName: string;
  companyLogo?: string;
  companyAddress: string;
  employee: PayslipEmployee;
  income: PayslipIncome;
  deductions: PayslipDeduction;
  netPay: number;
  benefits: PayslipBenefit[];
  companyContributions: PayslipCompanyContribution[];
  payDate: string;
  bankName?: string;
  bankAccount?: string;
  notes?: string;
}
