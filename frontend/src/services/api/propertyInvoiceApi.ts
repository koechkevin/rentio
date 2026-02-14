import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import { PropertyInvoice, PropertyInvoiceStatus, BillingConfig } from '../../types/propertyInvoice.types';

interface PropertyInvoicesResponse {
  success: boolean;
  data: PropertyInvoice[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

interface PropertyInvoiceResponse {
  success: boolean;
  data: PropertyInvoice;
}

interface BillingConfigResponse {
  success: boolean;
  data: BillingConfig;
}

export const propertyInvoiceApi = createApi({
  reducerPath: 'propertyInvoiceApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PropertyInvoice'],
  endpoints: (builder) => ({
    getPropertyInvoices: builder.query<
      PropertyInvoicesResponse,
      { status?: PropertyInvoiceStatus; page?: number; limit?: number }
    >({
      query: ({ status, page = 1, limit = 10 }) => ({
        url: '/property-invoices',
        params: { status, page, limit },
      }),
      providesTags: ['PropertyInvoice'],
    }),

    getPropertyInvoice: builder.query<PropertyInvoiceResponse, string>({
      query: (id) => `/property-invoices/${id}`,
      providesTags: ['PropertyInvoice'],
    }),

    getBillingConfig: builder.query<BillingConfigResponse, void>({
      query: () => '/property-invoices/billing-config',
    }),

    recordPropertyInvoicePayment: builder.mutation<
      { success: boolean; message: string },
      { id: string; data: { amount: number; paymentMethod?: string; reference?: string; mpesaReceipt?: string } }
    >({
      query: ({ id, data }) => ({
        url: `/property-invoices/${id}/payments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PropertyInvoice'],
    }),
  }),
});

export const {
  useGetPropertyInvoicesQuery,
  useGetPropertyInvoiceQuery,
  useGetBillingConfigQuery,
  useRecordPropertyInvoicePaymentMutation,
} = propertyInvoiceApi;
