export interface PropertyPaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  amount: number;
  createdAt: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
  };
}

export interface PropertyPayment {
  id: string;
  propertyId: string;
  invoiceId?: string;
  amount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  paymentMethod: string;
  reference?: string;
  mpesaReceipt?: string;
  pesapalOrderId?: string;
  pesapalTrackingId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  isProcessed: boolean;
  paidAt?: string;
  paidBy?: string;
  createdAt: string;
  updatedAt: string;
  allocations: PropertyPaymentAllocation[];
  invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
  };
}

export interface PropertyBalance {
  totalPaid: number;
  totalAllocated: number;
  unallocatedBalance: number;
}

export interface PropertyBalanceSummary {
  balance: PropertyBalance;
  arrears: number;
  invoiceSummary: Array<{
    status: string;
    _count: number;
    _sum: {
      totalAmount: number;
      paidAmount: number;
    };
  }>;
}

export interface InitializePaymentRequest {
  propertyId: string;
  amount: number;
  invoiceId?: string;
  description?: string;
}

export interface InitializePaymentResponse {
  paymentId: string;
  orderId: string;
  redirectUrl: string;
  orderTrackingId: string;
}

export interface ManualPaymentRequest {
  propertyId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  mpesaReceipt?: string;
  paidAt?: string;
}
