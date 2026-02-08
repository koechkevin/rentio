import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/config/api';
import { logout, setCredentials } from '@/store/slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    const propertyId = localStorage.getItem('currentPropertyId');

    if (propertyId) {
      headers.set('X-Property-Id', propertyId);
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data as { success: boolean; data: { token: string } };

        if (data.success && data.data.token) {
          // Store the new token
          localStorage.setItem('token', data.data.token);

          // Update the store
          api.dispatch(
            setCredentials({
              token: data.data.token,
              refreshToken,
              user: (api as any).getState().auth.user, // retain existing user info
            })
          );

          // Retry the original query with the new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed, log out the user
          api.dispatch(logout());
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        // Refresh failed, log out the user
        api.dispatch(logout());
        localStorage.clear();
        window.location.href = '/login';
      }
    } else {
      // No refresh token available, log out
      api.dispatch(logout());
      localStorage.clear();
      window.location.href = '/login';
    }
  }

  return result;
};
