import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import {
  BillingFrequency,
  BillingItem,
  BillingItemResponse,
  BillingItemsListResponse,
  CreateBillingItemRequest,
  GetBillingItemsParams,
  UpdateBillingItemRequest,
} from '@/types/billingItem.types';
import { Invoice } from '@/types/invoice.types';

export interface BulkRentRequest {
  frequency: BillingFrequency;
  billingPeriod?: string;
  year: number;
}

export interface BulkRentResult {
  success: boolean;
  message: string;
  data: {
    created: Array<{ unitNumber: string; tenantName: string; amount: number }>;
    skipped: Array<{ unitNumber: string; reason: string }>;
  };
}

export const billingItemApi = createApi({
  reducerPath: 'billingItemApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['BillingItem'],
  endpoints: (builder) => ({
    createBillingItem: builder.mutation<BillingItemResponse, CreateBillingItemRequest>({
      query: (data) => ({
        url: '/billing-items',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BillingItem'],
    }),

    getBillingItems: builder.query<BillingItemsListResponse, GetBillingItemsParams | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.unitId) search.append('unitId', params.unitId);
        if (params?.status) search.append('status', params.status);
        if (params?.year) search.append('year', String(params.year));
        if (params?.frequency) search.append('frequency', params.frequency);
        if (params?.billingPeriod) search.append('billingPeriod', params.billingPeriod);
        if (params?.itemType) search.append('itemType', params.itemType);
        if (params?.page) search.append('page', String(params.page));
        if (params?.limit) search.append('limit', String(params.limit));
        const qs = search.toString();
        return `/billing-items${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['BillingItem'],
    }),

    getBillingItemById: builder.query<BillingItemResponse, string>({
      query: (id) => `/billing-items/${id}`,
      providesTags: ['BillingItem'],
    }),

    updateBillingItem: builder.mutation<BillingItemResponse, { id: string; data: UpdateBillingItemRequest }>({
      query: ({ id, data }) => ({
        url: `/billing-items/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['BillingItem'],
    }),

    deleteBillingItem: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/billing-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BillingItem'],
    }),

    generateInvoiceFromBillingItem: builder.mutation<
      { success: boolean; message: string; data: Invoice },
      string
    >({
      query: (id) => ({
        url: `/billing-items/${id}/generate-invoice`,
        method: 'POST',
      }),
      invalidatesTags: ['BillingItem'],
    }),

    bulkCreateRentBillingItems: builder.mutation<BulkRentResult, BulkRentRequest>({
      query: (data) => ({
        url: '/billing-items/bulk/rent',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BillingItem'],
    }),
  }),
});

export const {
  useCreateBillingItemMutation,
  useGetBillingItemsQuery,
  useGetBillingItemByIdQuery,
  useUpdateBillingItemMutation,
  useDeleteBillingItemMutation,
  useGenerateInvoiceFromBillingItemMutation,
  useBulkCreateRentBillingItemsMutation,
} = billingItemApi;
