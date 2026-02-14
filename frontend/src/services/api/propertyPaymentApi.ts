import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import {
  PropertyPayment,
  PropertyBalanceSummary,
  InitializePaymentRequest,
  InitializePaymentResponse,
  ManualPaymentRequest,
} from '../../types/propertyPayment.types';

interface PropertyPaymentsResponse {
  success: boolean;
  data: PropertyPayment[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

interface PropertyPaymentResponse {
  success: boolean;
  data: PropertyPayment;
  message?: string;
}

interface InitPaymentApiResponse {
  success: boolean;
  data: InitializePaymentResponse;
  message: string;
}

interface BalanceSummaryResponse {
  success: boolean;
  data: PropertyBalanceSummary;
}

export const propertyPaymentApi = createApi({
  reducerPath: 'propertyPaymentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PropertyPayment', 'PropertyBalance'],
  endpoints: (builder) => ({
    initializePayment: builder.mutation<InitPaymentApiResponse, InitializePaymentRequest>({
      query: (data) => ({
        url: '/property-payments/initialize',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PropertyPayment'],
    }),

    checkPaymentStatus: builder.query<PropertyPaymentResponse, string>({
      query: (orderId) => `/property-payments/status/${orderId}`,
      providesTags: ['PropertyPayment'],
    }),

    recordManualPayment: builder.mutation<PropertyPaymentResponse, ManualPaymentRequest>({
      query: (data) => ({
        url: '/property-payments/manual',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PropertyPayment', 'PropertyBalance'],
    }),

    getPropertyPayments: builder.query<
      PropertyPaymentsResponse,
      { propertyId: string; status?: string; page?: number; limit?: number }
    >({
      query: ({ propertyId, status, page = 1, limit = 10 }) => ({
        url: `/property-payments/property/${propertyId}`,
        params: { status, page, limit },
      }),
      providesTags: ['PropertyPayment'],
    }),

    getPropertyBalanceSummary: builder.query<BalanceSummaryResponse, string>({
      query: (propertyId) => `/property-payments/property/${propertyId}/summary`,
      providesTags: ['PropertyBalance'],
    }),
  }),
});

export const {
  useInitializePaymentMutation,
  useCheckPaymentStatusQuery,
  useLazyCheckPaymentStatusQuery,
  useRecordManualPaymentMutation,
  useGetPropertyPaymentsQuery,
  useGetPropertyBalanceSummaryQuery,
} = propertyPaymentApi;
