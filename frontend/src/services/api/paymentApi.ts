import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export interface Payment {
  id: string;
  leaseId: string;
  amount: string;
  allocatedAmount: string;
  unallocatedAmount: string;
  type: 'RENT' | 'DEPOSIT' | 'PENALTY' | 'UTILITY' | 'OTHER';
  method: 'MPESA' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE';
  mpesaReceipt?: string;
  reference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  isProcessed: boolean;
  paidAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  lease: {
    id: string;
    unitId: string;
    userId: string;
    agreedRent: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
    };
    unit: {
      id: string;
      unitNumber: string;
      type: string;
    };
  };
  allocations?: Array<{
    id: string;
    paymentId: string;
    invoiceId: string;
    amount: string;
    invoice: {
      id: string;
      invoiceNumber: string;
      totalAmount: string;
      status: string;
      dueDate?: string;
    };
  }>;
}

export interface CreatePaymentRequest {
  unitId: string;
  amount: number;
  type: 'RENT' | 'DEPOSIT' | 'PENALTY' | 'UTILITY' | 'OTHER';
  method: 'MPESA' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE';
  mpesaReceipt?: string;
  reference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  paidAt?: string;
}

export interface GetPaymentsParams {
  unitId?: string;
  status?: string;
}

export interface PaymentResponse {
  success: boolean;
  data: Payment;
  message?: string;
}

export interface PaymentsResponse {
  success: boolean;
  data: Payment[];
}

export interface ArrearsResponse {
  success: boolean;
  data: {
    customerId: string;
    arrears: string;
  };
}

export interface UnitArrears {
  unitId: string;
  unitNumber: string;
  unitType: string;
  tenant: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  } | null;
  arrears: number;
  oldestDueDate: string | null;
  leaseDetails: {
    leaseStart: string;
    leaseEnd: string | null;
    agreedRent: number;
    deposit: number;
  } | null;
}

export interface PropertyArrearsResponse {
  success: boolean;
  data: UnitArrears[];
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    createPayment: builder.mutation<PaymentResponse, { propertyId: string; data: CreatePaymentRequest }>({
      query: ({ propertyId, data }) => ({
        url: `/owner/payments`,
        method: 'POST',
        body: data,
        headers: {
          'X-Property-Id': propertyId,
        },
      }),
      invalidatesTags: ['Payment'],
    }),

    getPayments: builder.query<PaymentsResponse, { propertyId: string; params?: GetPaymentsParams }>({
      query: ({ propertyId, params }) => ({
        url: `/owner/payments`,
        params,
        headers: {
          'X-Property-Id': propertyId,
        },
      }),
      providesTags: ['Payment'],
    }),

    getPayment: builder.query<PaymentResponse, { propertyId: string; id: string }>({
      query: ({ propertyId, id }) => ({
        url: `/owner/payments/${id}`,
        headers: {
          'X-Property-Id': propertyId,
        },
      }),
      providesTags: ['Payment'],
    }),

    processPayment: builder.mutation<PaymentResponse, { propertyId: string; id: string }>({
      query: ({ propertyId, id }) => ({
        url: `/owner/payments/${id}/process`,
        method: 'POST',
        headers: {
          'X-Property-Id': propertyId,
        },
      }),
      invalidatesTags: ['Payment'],
    }),

    // Get tenant arrears (for current user)
    getTenantArrears: builder.query<ArrearsResponse, void>({
      query: () => ({
        url: `/tenant/payments/arrears`,
      }),
    }),

    // Get customer arrears (for owner/caretaker checking a specific customer)
    getCustomerArrears: builder.query<ArrearsResponse, { propertyId: string; customerId: string }>({
      query: ({ propertyId, customerId }) => ({
        url: `/owner/invoices/customer/${customerId}/arrears`,
        headers: {
          'X-Property-Id': propertyId,
        },
      }),
    }),

    // Get tenant payments (for current user)
    getTenantPayments: builder.query<PaymentsResponse, void>({
      query: () => ({
        url: `/tenant/payments`,
      }),
      providesTags: ['Payment'],
    }),

    // Get property unit arrears (for owner/caretaker)
    getPropertyUnitArrears: builder.query<PropertyArrearsResponse, string>({
      query: (propertyId) => ({
        url: `/owner/arrears`,
        headers: {
          'X-Property-Id': propertyId,
        },
      }),
      providesTags: ['Payment'],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useProcessPaymentMutation,
  useGetTenantArrearsQuery,
  useGetCustomerArrearsQuery,
  useGetTenantPaymentsQuery,
  useGetPropertyUnitArrearsQuery,
} = paymentApi;
