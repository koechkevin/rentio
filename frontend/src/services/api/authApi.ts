import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

import { API_CONFIG } from '@/config/api';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      fullName: string;
      globalRole: string;
      userPropertyRoles: Array<{
        propertyId: string;
        role: string;
      }>;
    };
    token: string;
    refreshToken: string;
  };
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  nationalId: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      fullName: string;
      phone: string;
      email: string;
      globalRole: string;
      isEmailVerified: boolean;
    };
  };
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      fullName: string;
      phone: string;
      email: string;
      globalRole: string;
      isEmailVerified: boolean;
    };
    token: string;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
      nationalId: string;
      globalRole: string;
      status: string;
      isEmailVerified: boolean;
      displayPicture?: string;
      backgroundPicture?: string;
      about?: string;
      website?: string;
      createdAt: string;
      updatedAt: string;
    };
    userPropertyRoles: Array<{
      propertyId: string;
      role: string;
      property: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  verificationCode: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'CurrentUser'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailRequest>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
    }),
    resendVerification: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: (data) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: data,
      }),
    }),
    refreshToken: builder.mutation<{ success: boolean; data: { token: string } }, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => '/auth/me',
      providesTags: ['CurrentUser'],
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    checkEmailExists: builder.mutation<{ success: boolean; exists: boolean }, { email: string }>({
      query: (data) => ({
        url: '/auth/check-email',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCheckEmailExistsMutation,
} = authApi;
