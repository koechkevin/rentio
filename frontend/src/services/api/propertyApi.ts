import { API_CONFIG } from '@/config/api';
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export interface Property {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  county: string;
  town: string;
  gpsLatitude: number;
  gpsLongitude: number;
  ownerProvidedIdentifier?: string;
  baseCurrency: string;
  isMarketable: boolean;
  createdAt: string;
  updatedAt: string;
  userPropertyRoles: Array<{
    userId: string;
    role: string;
  }>;
}

export interface CreatePropertyRequest {
  name: string;
  slug: string;
  county: string;
  town: string;
  gpsLatitude: number;
  gpsLongitude: number;
  ownerProvidedIdentifier?: string;
}

export interface UpdatePropertyRequest {
  name?: string;
  slug?: string;
  county?: string;
  town?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  ownerProvidedIdentifier?: string;
}

export const propertyApi = createApi({
  reducerPath: 'propertyApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Property'],
  endpoints: (builder) => ({
    createProperty: builder.mutation<Property, CreatePropertyRequest>({
      query: (property) => ({
        url: '/owner/properties',
        method: 'POST',
        body: property,
      }),
      invalidatesTags: ['Property'],
    }),
    getProperties: builder.query<{ data: Property[] }, void>({
      query: () => '/owner/properties',
      providesTags: ['Property'],
    }),
    getProperty: builder.query<{ success: boolean; data: Property }, string>({
      query: (id) => `/owner/properties/${id}`,
      providesTags: ['Property'],
    }),
    updateProperty: builder.mutation<{ success: boolean; data: Property }, { id: string; data: UpdatePropertyRequest }>(
      {
        query: ({ id, data }) => ({
          url: `/owner/properties/${id}`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['Property'],
      }
    ),
  }),
});

export const { useCreatePropertyMutation, useGetPropertiesQuery, useGetPropertyQuery, useUpdatePropertyMutation } =
  propertyApi;
