import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import { AssignRoleRequest, AssignRoleResponse, PropertyUsersResponse, UserRole } from '../../types/user.types';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PropertyUser'],
  endpoints: (builder) => ({
    getPropertyUsers: builder.query<PropertyUsersResponse, { propertyId: string; role?: UserRole }>({
      query: ({ propertyId, role }) => ({
        url: `/owner/properties/${propertyId}/members${role ? `?role=${role}` : ''}`,
        method: 'GET',
      }),
      providesTags: ['PropertyUser'],
    }),

    assignRole: builder.mutation<AssignRoleResponse, { propertyId: string; data: AssignRoleRequest }>({
      query: ({ propertyId, data }) => ({
        url: `/owner/properties/${propertyId}/assign-role`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PropertyUser'],
    }),

    revokeRole: builder.mutation<{ success: boolean; message: string }, { propertyId: string; userId: string }>({
      query: ({ propertyId, userId }) => ({
        url: `/owner/properties/${propertyId}/users/${userId}/revoke`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PropertyUser'],
    }),
  }),
});

export const { useGetPropertyUsersQuery, useAssignRoleMutation, useRevokeRoleMutation } = userApi;
