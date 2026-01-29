import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export type UnitType = 'BEDSITTER' | 'ONE_BEDROOM' | 'TWO_BEDROOM' | 'THREE_BEDROOM' | 'SHOP' | 'OFFICE' | 'OTHER';

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  type: UnitType;
  monthlyRent: number;
  floor: number;
  description?: string;
  isOccupied: boolean;
  currentTenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitRequest {
  propertyId: string;
  unitNumber: string;
  type: UnitType;
  monthlyRent: number;
  floor: number;
  description?: string;
}

export interface UpdateUnitRequest {
  unitNumber?: string;
  type?: UnitType;
  monthlyRent?: number;
  floor?: number;
  description?: string;
}

export const unitApi = createApi({
  reducerPath: 'unitApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Unit'],
  endpoints: (builder) => ({
    getUnits: builder.query<{ success: boolean; data: Unit[] }, string>({
      query: (propertyId) => ({
        url: '/owner/units',
        headers: {
          'x-property-id': propertyId,
        },
      }),
      providesTags: ['Unit'],
    }),
    getUnit: builder.query<{ success: boolean; data: Unit }, { propertyId: string; unitId: string }>({
      query: ({ propertyId, unitId }) => ({
        url: `/owner/units/${unitId}`,
        headers: {
          'x-property-id': propertyId,
        },
      }),
      providesTags: ['Unit'],
    }),
    createUnit: builder.mutation<{ success: boolean; data: Unit }, CreateUnitRequest>({
      query: ({ propertyId, ...body }) => ({
        url: '/owner/units',
        method: 'POST',
        headers: {
          'x-property-id': propertyId,
        },
        body,
      }),
      invalidatesTags: ['Unit'],
    }),
    updateUnit: builder.mutation<
      { success: boolean; data: Unit },
      { propertyId: string; unitId: string; data: UpdateUnitRequest }
    >({
      query: ({ propertyId, unitId, data }) => ({
        url: `/owner/units/${unitId}`,
        method: 'PUT',
        headers: {
          'x-property-id': propertyId,
        },
        body: data,
      }),
      invalidatesTags: ['Unit'],
    }),
    deleteUnit: builder.mutation<{ success: boolean; message: string }, { propertyId: string; unitId: string }>({
      query: ({ propertyId, unitId }) => ({
        url: `/owner/units/${unitId}`,
        method: 'DELETE',
        headers: {
          'x-property-id': propertyId,
        },
      }),
      invalidatesTags: ['Unit'],
    }),
  }),
});

export const {
  useGetUnitsQuery,
  useGetUnitQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = unitApi;
