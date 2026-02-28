export enum BillingFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

export enum BillingItemStatus {
  PENDING = 'PENDING',
  INVOICED = 'INVOICED',
}

export enum BillingItemType {
  RENT = 'RENT',
  WATER = 'WATER',
  ELECTRICITY = 'ELECTRICITY',
  GAS = 'GAS',
  GARBAGE = 'GARBAGE',
  SEWERAGE = 'SEWERAGE',
  SECURITY = 'SECURITY',
  INTERNET = 'INTERNET',
  PARKING = 'PARKING',
  SERVICE_CHARGE = 'SERVICE_CHARGE',
  OTHER = 'OTHER',
}

export const BILLING_ITEM_TYPE_LABELS: Record<BillingItemType, string> = {
  RENT: 'Rent',
  WATER: 'Water Bill',
  ELECTRICITY: 'Electricity Bill',
  GAS: 'Gas / LPG',
  GARBAGE: 'Garbage Collection',
  SEWERAGE: 'Sewerage Charge',
  SECURITY: 'Security Fee',
  INTERNET: 'Internet / WiFi',
  PARKING: 'Parking Fee',
  SERVICE_CHARGE: 'Service Charge',
  OTHER: 'Other',
};

export interface BillingItem {
  id: string;
  propertyId: string;
  unitId: string;
  customerId: string;
  itemType: BillingItemType;
  frequency: BillingFrequency;
  billingPeriod: string;
  year: number;
  amount: number | string;
  currency: string;
  status: BillingItemStatus;
  invoiceId?: string | null;
  notes?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  unit?: { id: string; unitNumber: string; type?: string };
  customer?: { id: string; fullName: string; email: string; phone?: string };
  invoice?: { id: string; invoiceNumber: string; status: string; totalAmount?: number | string } | null;
}

export interface CreateBillingItemRequest {
  unitId: string;
  itemType: BillingItemType;
  frequency: BillingFrequency;
  billingPeriod?: string;
  year: number;
  amount: number;
  currency?: string;
  notes?: string;
}

export interface UpdateBillingItemRequest {
  amount?: number;
  currency?: string;
  notes?: string;
}

export interface GetBillingItemsParams {
  unitId?: string;
  status?: BillingItemStatus;
  year?: number;
  frequency?: BillingFrequency;
  billingPeriod?: string;
  itemType?: BillingItemType;
  page?: number;
  limit?: number;
}

export interface BillingItemsListResponse {
  success: boolean;
  message: string;
  data: BillingItem[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface BillingItemResponse {
  success: boolean;
  message: string;
  data: BillingItem;
}
