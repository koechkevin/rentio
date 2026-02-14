export enum PropertyInvoiceStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export interface PropertyInvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  mpesaReceipt?: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

export interface PropertyInvoiceItem {
  id: string;
  invoiceId: string;
  unitId: string;
  unitNumber: string;
  unitType: string;
  tenantName?: string;
  tenantEmail?: string;
  description?: string;
  unitAmount: number;
  quantity: number;
  total: number;
  createdAt: string;
}

export interface PropertyInvoice {
  id: string;
  invoiceNumber: string;
  propertyId: string;
  property: {
    id: string;
    name: string;
    county?: string;
    town?: string;
    owner?: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
    };
  };
  billingPeriodStart: string;
  billingPeriodEnd: string;
  occupiedUnits: number;
  ratePerUnit: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  currency: string;
  status: PropertyInvoiceStatus;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: PropertyInvoiceItem[];
  payments: PropertyInvoicePayment[];
}

export interface BillingConfig {
  ratePerUnit: number;
  currency: string;
  taxRate: number;
  dueDays: number;
}
