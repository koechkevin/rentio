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
  }),
});

export const { useCreatePropertyMutation, useGetPropertiesQuery } = propertyApi;
