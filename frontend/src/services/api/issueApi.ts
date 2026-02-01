import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export type IssueCategory = 'PLUMBING' | 'ELECTRICAL' | 'CARPENTRY' | 'PAINTING' | 'SECURITY' | 'OTHER';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Issue {
  id: string;
  leaseId: string;
  unitId: string;
  reportedBy: string;
  category: IssueCategory;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  photos: string[];
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  unit?: {
    id: string;
    unitNumber: string;
    property: {
      id: string;
      name: string;
    };
  };
}

export interface CreateIssueRequest {
  category: IssueCategory;
  title: string;
  description: string;
  priority?: IssuePriority;
}

export const issueApi = createApi({
  reducerPath: 'issueApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Issue'],
  endpoints: (builder) => ({
    createIssue: builder.mutation<{ success: boolean; data: Issue; message: string }, CreateIssueRequest>({
      query: (data) => ({
        url: '/tenant/issues',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Issue'],
    }),
    getTenantIssues: builder.query<{ success: boolean; data: Issue[] }, { status?: string; limit?: number }>({
      query: ({ status, limit = 50 }) => ({
        url: '/tenant/issues',
        params: { status, limit },
      }),
      providesTags: ['Issue'],
    }),
    getIssue: builder.query<{ success: boolean; data: Issue }, string>({
      query: (id) => `/tenant/issues/${id}`,
      providesTags: ['Issue'],
    }),
  }),
});

export const { useCreateIssueMutation, useGetTenantIssuesQuery, useGetIssueQuery } = issueApi;
