// Invoice Type Definitions
// Use these types in your React components for type safety

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum BillingDuration {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  ONE_TIME = 'ONE_TIME',
}

export interface InvoiceItem {
  id?: string;
  itemName: string;
  itemDescription?: string;
  unitAmount: number;
  quantity: number;
  billingDuration: BillingDuration;
  billingPeriod?: Date | string;
  total: number;
  vatable?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  propertyId: string;
  unitId: string;
  totalAmount: number;
  vatAmount: number;
  subTotal: number;
  vatRate: number;
  dueDate: string | Date;
  issueDate: string | Date;
  status: InvoiceStatus;
  notes?: string;
  createdBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date;

  // Relations
  customer?: Customer;
  property?: Property;
  unit?: Unit;
  createdByUser?: User;
  items?: InvoiceItem[];
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Property {
  id: string;
  name: string;
  county?: string;
  town?: string;
}

export interface Unit {
  id: string;
  unitNumber: string;
  type: string;
  monthlyRent?: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface CreateInvoiceRequest {
  customerId: string;
  unitId: string;
  dueDate: string | Date;
  vatRate?: number;
  notes?: string;
  items: InvoiceItem[];
}

export interface UpdateInvoiceRequest {
  dueDate?: string | Date;
  notes?: string;
  status?: InvoiceStatus;
  items?: InvoiceItem[];
  vatRate?: number;
}

export interface InvoiceListResponse {
  message: string;
  data: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InvoiceDetailResponse {
  message: string;
  data: Invoice;
}

export interface CheckItemInvoicedResponse {
  message: string;
  data: {
    alreadyInvoiced: boolean;
    existingInvoices: Array<{
      id: string;
      itemName: string;
      billingPeriod: string;
      total: number;
      invoice: {
        id: string;
        invoiceNumber: string;
        status: InvoiceStatus;
        issueDate: string;
      };
    }>;
  };
}

export interface SuggestedItemsResponse {
  message: string;
  data: {
    unit: Unit;
    suggestedItems: InvoiceItem[];
  };
}

export interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

// Filter and query interfaces
export interface InvoiceFilters {
  status?: InvoiceStatus;
  customerId?: string;
  unitId?: string;
  page?: number;
  limit?: number;
}
