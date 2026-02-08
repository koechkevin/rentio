import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export interface IssuesStats {
  open: number;
  closed: number;
  total: number;
  percentage: number;
}

export interface RecentIssue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  unitNumber: string;
  reportedBy: string;
  createdAt: string;
}

export interface RecentActivity {
  id: string;
  unitNumber: string;
  tenantName: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
  updatedAt: string;
}

export interface MonthlyPayment {
  month: number;
  total: number;
  cumulative: number;
}

export interface PropertyDashboardMetrics {
  issuesStats: IssuesStats;
  recentIssues: RecentIssue[];
  recentActivity: RecentActivity[];
  monthlyPayments: MonthlyPayment[];
}

export interface TenancyDetails {
  propertyName: string;
  unitNumber: string;
  startDate: string;
  endDate: string | null;
  rentAmount: string;
}

export interface TenantDashboardMetrics {
  hasActiveLease: boolean;
  tenancyDetails: TenancyDetails | null;
  arrears: number;
  duration: string | null;
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getPropertyMetrics: builder.query<{ success: boolean; data: PropertyDashboardMetrics }, string>({
      query: (propertyId) => `/owner/dashboard/${propertyId}`,
      providesTags: ['Dashboard'],
    }),
    getTenantMetrics: builder.query<{ success: boolean; data: TenantDashboardMetrics }, void>({
      query: () => '/tenant/dashboard',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetPropertyMetricsQuery, useGetTenantMetricsQuery } = dashboardApi;
