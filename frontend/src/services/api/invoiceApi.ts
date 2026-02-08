import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import { Invoice, InvoiceItem, InvoiceStatus, BillingDuration } from '@/types/invoice.types';

export interface CreateInvoiceRequest {
  customerId: string;
  unitId: string;
  dueDate: string;
  vatRate: number;
  notes?: string;
  items: Array<{
    itemName: string;
    itemDescription?: string;
    unitAmount: number;
    quantity: number;
    billingDuration: BillingDuration;
    billingPeriod: string;
  }>;
}

export interface UpdateInvoiceRequest {
  customerId?: string;
  unitId?: string;
  dueDate?: string;
  vatRate?: number;
  notes?: string;
  status?: InvoiceStatus;
  items?: Array<{
    itemName: string;
    itemDescription?: string;
    unitAmount: number;
    quantity: number;
    billingDuration: BillingDuration;
    billingPeriod: string;
  }>;
}

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  customerId?: string;
  propertyId?: string;
  unitId?: string;
  search?: string;
}

export interface InvoiceResponse {
  success: boolean;
  data: Invoice;
}

export interface InvoicesListResponse {
  success: boolean;
  data: Invoice[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface CheckItemInvoicedParams {
  unitId: string;
  itemName: string;
  billingPeriod: string;
}

export interface CheckItemInvoicedResponse {
  success: boolean;
  data: {
    alreadyInvoiced: boolean;
    existingInvoices: Array<{
      invoice: {
        id: string;
        invoiceNumber: string;
      };
      item: InvoiceItem;
    }>;
  };
}

export interface SuggestedItem {
  itemName: string;
  itemDescription: string;
  unitAmount: number;
  quantity: number;
  billingDuration: BillingDuration;
  billingPeriod: string;
  total: number;
}

export interface SuggestedItemsResponse {
  success: boolean;
  data: {
    suggestedItems: SuggestedItem[];
  };
}

export const invoiceApi = createApi({
  reducerPath: 'invoiceApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Invoice'],
  endpoints: (builder) => ({
    createInvoice: builder.mutation<InvoiceResponse, CreateInvoiceRequest>({
      query: (invoice) => ({
        url: '/invoices',
        method: 'POST',
        body: invoice,
      }),
      invalidatesTags: ['Invoice'],
    }),
    getInvoices: builder.query<InvoicesListResponse, GetInvoicesParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.status) searchParams.append('status', params.status);
        if (params?.customerId) searchParams.append('customerId', params.customerId);
        if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
        if (params?.unitId) searchParams.append('unitId', params.unitId);
        if (params?.search) searchParams.append('search', params.search);

        return `/invoices?${searchParams.toString()}`;
      },
      providesTags: ['Invoice'],
    }),
    getInvoice: builder.query<InvoiceResponse, string>({
      query: (id) => `/invoices/${id}`,
      providesTags: ['Invoice'],
    }),
    updateInvoice: builder.mutation<InvoiceResponse, { id: string; data: UpdateInvoiceRequest }>({
      query: ({ id, data }) => ({
        url: `/invoices/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Invoice'],
    }),
    deleteInvoice: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/invoices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invoice'],
    }),
    checkItemInvoiced: builder.query<CheckItemInvoicedResponse, CheckItemInvoicedParams>({
      query: ({ unitId, itemName, billingPeriod }) => {
        const searchParams = new URLSearchParams();
        searchParams.append('unitId', unitId);
        searchParams.append('itemName', itemName);
        searchParams.append('billingPeriod', billingPeriod);
        return `/invoices/check/item-invoiced?${searchParams.toString()}`;
      },
    }),
    getSuggestedItems: builder.query<SuggestedItemsResponse, { unitId: string; billingPeriod: string }>({
      query: ({ unitId, billingPeriod }) => {
        const searchParams = new URLSearchParams();
        searchParams.append('billingPeriod', billingPeriod);
        return `/invoices/suggested-items/${unitId}?${searchParams.toString()}`;
      },
    }),
    getMyInvoices: builder.query<InvoicesListResponse, GetInvoicesParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.status) searchParams.append('status', params.status);

        return `/my-invoices?${searchParams.toString()}`;
      },
      providesTags: ['Invoice'],
    }),
  }),
});

export const {
  useCreateInvoiceMutation,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useCheckItemInvoicedQuery,
  useLazyCheckItemInvoicedQuery,
  useGetSuggestedItemsQuery,
  useLazyGetSuggestedItemsQuery,
  useGetMyInvoicesQuery,
} = invoiceApi;
