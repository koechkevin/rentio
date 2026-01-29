import { API_CONFIG } from '@/config/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

interface UserProfile {
  _id: string;
  displayPicture?: string;
  backgroundPicture?: string;
  about?: string;
  website?: string;
  email: string;
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

interface Upload {
  _id: string;
  description: string;
  metadata?: { fileName?: string; fileUrl?: string };
  createdAt: string;
}

export const userProfileApi = createApi({
  reducerPath: 'userProfileApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['UserProfile', 'UserActivity', 'TenancyAgreement', 'Uploads'],
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, string>({
      query: (userId) => `/user-profile/${userId}`,
      providesTags: ['UserProfile'],
    }),
    updateUserProfile: builder.mutation<UserProfile, { userId: string; data: FormData }>({
      query: ({ userId, data }) => ({
        url: `/user-profile/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),
    getUserActivities: builder.query<UserActivity[], string>({
      query: (userId) => `/user-profile/${userId}/activities`,
      providesTags: ['UserActivity'],
    }),
    getTenancyAgreement: builder.query<TenancyAgreement, string>({
      query: (userId) => `/user-profile/${userId}/tenancy`,
      providesTags: ['TenancyAgreement'],
    }),
    getUserUploads: builder.query<Upload[], string>({
      query: (userId) => `/user-profile/${userId}/uploads`,
      providesTags: ['Uploads'],
    }),
    getTenantIssues: builder.query({
      query: (userId: string) => `/tenant/issues?userId=${userId}&status=unresolved&limit=10`,
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
