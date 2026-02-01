import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export interface Subscription {
  id: string;
  propertyId: string;
  paidUnits: number;
  usedUnits: number;
  pricePerUnit: number;
  currency: string;
  status: string;
  lastPaymentDate: string | null;
  nextBillingDate: string | null;
  availableUnits: number;
  canAddUnits: boolean;
}

export interface RecordPaymentRequest {
  unitsCount: number;
  amount: number;
  paymentMethod?: string;
  reference?: string;
  mpesaReceipt?: string;
  paidAt?: string;
}

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Subscription'],
  endpoints: (builder) => ({
    getSubscription: builder.query<{ success: boolean; data: Subscription | null }, string>({
      query: (propertyId) => ({
        url: '/owner/subscription',
        headers: {
          'x-property-id': propertyId,
        },
      }),
      providesTags: ['Subscription'],
    }),
    recordPayment: builder.mutation<
      { success: boolean; data: Subscription; message: string },
      { propertyId: string; data: RecordPaymentRequest }
    >({
      query: ({ propertyId, data }) => ({
        url: '/owner/subscription/payment',
        method: 'POST',
        headers: {
          'x-property-id': propertyId,
        },
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),
    checkAvailability: builder.query<
      {
        success: boolean;
        data: {
          canAddUnit: boolean;
          paidUnits: number;
          usedUnits: number;
          availableUnits: number;
          requiresPayment: boolean;
          pricePerUnit: number;
          currency: string;
        };
      },
      string
    >({
      query: (propertyId) => ({
        url: '/owner/subscription/check',
        headers: {
          'x-property-id': propertyId,
        },
      }),
      providesTags: ['Subscription'],
    }),
  }),
});

export const { useGetSubscriptionQuery, useRecordPaymentMutation, useCheckAvailabilityQuery } = subscriptionApi;
