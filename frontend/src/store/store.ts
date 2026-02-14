import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import { authApi } from '@/services/api/authApi';
import { userProfileApi } from '../services/api/userProfileApi';
import { propertyApi } from '../services/api/propertyApi';
import { unitApi } from '../services/api/unitApi';
import { uploadApi } from '../services/api/uploadApi';
import { leaseApi } from '../services/api/leaseApi';
import { subscriptionApi } from '../services/api/subscriptionApi';
import { invoiceApi } from '../services/api/invoiceApi';
import { paymentApi } from '../services/api/paymentApi';
import { dashboardApi } from '../services/api/dashboardApi';
import { propertyInvoiceApi } from '../services/api/propertyInvoiceApi';
import propertyReducer from './slices/propertySlice';
import { userApi } from '../services/api/userApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userProfileApi.reducerPath]: userProfileApi.reducer,
    [propertyApi.reducerPath]: propertyApi.reducer,
    [unitApi.reducerPath]: unitApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [leaseApi.reducerPath]: leaseApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [propertyInvoiceApi.reducerPath]: propertyInvoiceApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {},
    }).concat(
      authApi.middleware,
      userProfileApi.middleware,
      propertyApi.middleware,
      unitApi.middleware,
      uploadApi.middleware,
      leaseApi.middleware,
      subscriptionApi.middleware,
      invoiceApi.middleware,
      paymentApi.middleware,
      dashboardApi.middleware,
      propertyInvoiceApi.middleware,
      userApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
