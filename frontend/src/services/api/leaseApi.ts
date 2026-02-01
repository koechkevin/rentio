import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export interface CreateLeaseRequest {
  unitId: string;
  startDate?: string;
  leaseEnd?: string;
  agreedRent: number;
  deposit: number;
  email: string;
  fullName: string;
  nationalId: string;
  phone: string;
}

export interface Lease {
  id: string;
  userId: string;
  unitId: string;
  leaseStart: string;
  leaseEnd: string | null;
  agreedRent: number;
  deposit: number;
  active: boolean;
  rating: number | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  terminatedAt: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    nationalId: string;
  };
  unit: {
    id: string;
    unitNumber: string;
    type: string;
    monthlyRent: number;
    property: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export const leaseApi = createApi({
  reducerPath: 'leaseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Lease'],
  endpoints: (builder) => ({
    createLease: builder.mutation<
      { success: boolean; data: { lease: Lease; isNewUser: boolean; message: string } },
      { propertyId: string; data: CreateLeaseRequest }
    >({
      query: ({ propertyId, data }) => ({
        url: '/owner/leases',
        method: 'POST',
        headers: {
          'x-property-id': propertyId,
        },
        body: data,
      }),
      invalidatesTags: ['Lease'],
    }),
    getLeases: builder.query<{ success: boolean; data: Lease[] }, string>({
      query: (propertyId) => ({
        url: '/tenant/leases',
        headers: {
          'x-property-id': propertyId,
        },
      }),
      providesTags: ['Lease'],
    }),
    getLease: builder.query<{ success: boolean; data: Lease }, { propertyId: string; leaseId: string }>({
      query: ({ propertyId, leaseId }) => ({
        url: `/owner/leases/${leaseId}`,
        headers: {
          'x-property-id': propertyId,
        },
      }),
      providesTags: ['Lease'],
    }),
    terminateLease: builder.mutation<
      { success: boolean; data: Lease; message: string },
      { propertyId: string; leaseId: string; terminationDate?: string; reason?: string }
    >({
      query: ({ propertyId, leaseId, ...data }) => ({
        url: `/owner/leases/${leaseId}/terminate`,
        method: 'PATCH',
        headers: {
          'x-property-id': propertyId,
        },
        body: data,
      }),
      invalidatesTags: ['Lease'],
    }),
    getUserLeases: builder.query<{ success: boolean; data: Lease[] }, void>({
      query: () => '/tenant/leases',
      providesTags: ['Lease'],
    }),
  }),
});

export const {
  useCreateLeaseMutation,
  useGetLeasesQuery,
  useGetLeaseQuery,
  useTerminateLeaseMutation,
  useGetUserLeasesQuery,
} = leaseApi;
