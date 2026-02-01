import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import { getUserIdFromToken } from '../../utils/jwt';

interface UserProfile {
  _id: string;
  displayPicture?: string;
  backgroundPicture?: string;
  about?: string;
  website?: string;
  email: string;
  fullName: string;
}

interface UserActivity {
  _id: string;
  activityType: string;
  description: string;
  createdAt: string;
}

interface TenancyAgreement {
  _id: string;
  rentAmount: number;
  rentFrequency: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface EntityUpload {
  entityType: string;
  entityId: string;
  isPrimary: boolean;
  order: number;
}

interface Upload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  entityUploads: EntityUpload[];
}

export const userProfileApi = createApi({
  reducerPath: 'userProfileApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['UserProfile', 'UserActivity', 'TenancyAgreement', 'Uploads'],
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, string | void>({
      query: (userId) => {
        const id = userId || getUserIdFromToken();
        if (!id) throw new Error('User ID not found');
        return `/user-profile/${id}`;
      },
      providesTags: ['UserProfile'],
    }),
    updateUserProfile: builder.mutation<UserProfile, { userId?: string; data: FormData }>({
      query: ({ userId, data }) => {
        const id = userId || getUserIdFromToken();
        if (!id) throw new Error('User ID not found');
        return {
          url: `/user-profile/${id}`,
          method: 'PUT',
          body: data,
        };
      },
      invalidatesTags: ['UserProfile'],
    }),
    getUserActivities: builder.query<UserActivity[], string | void>({
      query: (userId) => {
        const id = userId || getUserIdFromToken();
        if (!id) throw new Error('User ID not found');
        return `/user-profile/${id}/activities`;
      },
      providesTags: ['UserActivity'],
    }),
    getTenancyAgreement: builder.query<TenancyAgreement, string | void>({
      query: (userId) => {
        const id = userId || getUserIdFromToken();
        if (!id) throw new Error('User ID not found');
        return `/user-profile/${id}/tenancy`;
      },
      providesTags: ['TenancyAgreement'],
    }),
    getUserUploads: builder.query<Upload[], string | void>({
      query: (userId) => {
        const id = userId || getUserIdFromToken();
        if (!id) throw new Error('User ID not found');
        return `/user-profile/${id}/uploads`;
      },
      providesTags: ['Uploads'],
    }),
    getTenantIssues: builder.query({
      query: (userId?: string) => '/tenant/issues',
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetUserActivitiesQuery,
  useGetTenancyAgreementQuery,
  useGetUserUploadsQuery,
  useGetTenantIssuesQuery,
} = userProfileApi;
