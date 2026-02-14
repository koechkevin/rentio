import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import AuthGuard from '@/auth/AuthGuard';
import RouteErrorBoundary from '@/components/error-boundaries/RouteErrorBoundary';
import CreateProperty from '@/pages/properties/CreateProperty';
import PropertyList from '@/pages/properties/PropertyList';
import UnitList from '@/pages/properties/units/UnitList';
import EditUnit from '@/pages/properties/units/EditUnit';
import AddUnit from '@/pages/properties/units/AddUnit';
import UnitsRedirect from '@/pages/properties/units/UnitsRedirect';
import EditProperty from '@/pages/properties/EditProperty';
import AddTenant from '@/pages/properties/units/AddTenant';

// User Management
const UserManagement = lazy(() => import('@/pages/users/UserManagement'));

// Property Billing
const PropertyInvoiceList = lazy(() => import('@/pages/billing/PropertyInvoiceList'));
const PropertyInvoiceDetail = lazy(() => import('@/pages/billing/PropertyInvoiceDetail'));
const PropertyPayments = lazy(() => import('@/pages/billing/PropertyPayments'));
const PaymentCallback = lazy(() => import('@/pages/billing/PaymentCallback'));

const MainLayout = lazy(() => import('@/layouts/MainLayout'));
const AuthLayout = lazy(() => import('@/layouts/AuthLayout'));
const ErrorLayout = lazy(() => import('@/layouts/ErrorLayout'));

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));

const ApexChartsPage = lazy(() => import('@/pages/charts/apexcharts/ApexChartsPage'));
const ChartJsPage = lazy(() => import('@/pages/charts/chartjs/ChartJsPage'));

const BasicTablesPage = lazy(() => import('@/pages/tables/basic-tables/BasicTablesPage'));
const DatatablePage = lazy(() => import('@/pages/tables/datatable/DatatablePage'));

const IconsPage = lazy(() => import('@/pages/icons/IconsPage'));

const BlankPage = lazy(() => import('@/pages/general/BlankPage'));
const FaqPage = lazy(() => import('@/pages/general/FaqPage'));
const InvoicePage = lazy(() => import('@/pages/general/InvoicePage'));
const ProfilePage = lazy(() => import('@/pages/general/profile/ProfilePage'));
const PricingPage = lazy(() => import('@/pages/general/PricingPage'));

// Invoice Management
const InvoiceList = lazy(() => import('@/pages/invoices/InvoiceList'));
const CreateInvoiceForm = lazy(() => import('@/pages/invoices/CreateInvoiceForm'));
import InvoiceDetail from '@/pages/invoices/InvoiceDetail';

// Payment Management
const PaymentList = lazy(() => import('@/pages/payments/PaymentList'));
const CreatePaymentForm = lazy(() => import('@/pages/payments/CreatePaymentForm'));
const ArrearsTable = lazy(() => import('@/pages/payments/ArrearsTable'));

const Error404Page = lazy(() => import('@/pages/error/Error404Page'));
const Error500Page = lazy(() => import('@/pages/error/Error500Pge'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));

const AppRoutes = () => {
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={baseUrl}>
      <Routes>
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route
              path="dashboard"
              element={
                <RouteErrorBoundary routeName="Dashboard">
                  <DashboardPage />
                </RouteErrorBoundary>
              }
            />
            <Route path="/properties/add" element={<CreateProperty />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/properties/:propertyId/edit" element={<EditProperty />} />
            <Route path="/units" element={<UnitsRedirect />} />
            <Route path="/properties/:propertyId/units" element={<UnitList />} />
            <Route path="/properties/:propertyId/units/add" element={<AddUnit />} />
            <Route path="/properties/:propertyId/units/:unitId/edit" element={<EditUnit />} />
            <Route path="/properties/:propertyId/units/:unitId/add-tenant" element={<AddTenant />} />

            {/* User Management Routes */}
            <Route path="/system/users" element={<UserManagement />} />

            {/* Property Billing Routes */}
            <Route path="/billing/invoices" element={<PropertyInvoiceList />} />
            <Route path="/billing/invoices/:id" element={<PropertyInvoiceDetail />} />
            <Route path="/billing/payments" element={<PropertyPayments />} />
            <Route path="/billing/payment-callback" element={<PaymentCallback />} />

            {/* Invoice Management Routes */}
            <Route path="/finance/invoices" element={<InvoiceList />} />
            <Route path="/finance/invoices/create" element={<CreateInvoiceForm />} />
            <Route path="/finance/invoices/:id" element={<InvoiceDetail />} />

            {/* Payment Management Routes */}
            <Route path="/finance/payments" element={<PaymentList />} />
            <Route path="/finance/payments/create" element={<CreatePaymentForm />} />
            <Route path="/finance/arrears" element={<ArrearsTable />} />

            <Route
              path="charts/apexcharts"
              element={
                <RouteErrorBoundary routeName="ApexCharts">
                  <ApexChartsPage />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="charts/chartjs"
              element={
                <RouteErrorBoundary routeName="ChartJS">
                  <ChartJsPage />
                </RouteErrorBoundary>
              }
            />

            <Route path="tables/basic-tables" element={<BasicTablesPage />} />
            <Route path="tables/datatable" element={<DatatablePage />} />

            <Route path="icons" element={<IconsPage />} />

            <Route path="general/blank-page" element={<BlankPage />} />
            <Route path="general/faq" element={<FaqPage />} />
            <Route path="general/invoice" element={<InvoicePage />} />
            <Route path="general/profile" element={<ProfilePage />} />
            <Route path="general/pricing" element={<PricingPage />} />
          </Route>
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="auth/login" element={<LoginPage />} />
          <Route path="auth/register" element={<RegisterPage />} />
          <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="auth/verify-email" element={<VerifyEmailPage />} />
        </Route>
        <Route element={<ErrorLayout />}>
          <Route path="error/404" element={<Error404Page />} />
          <Route path="error/500" element={<Error500Page />} />
        </Route>
        <Route path="*" element={<Error404Page />} />
      </Routes>
    </BrowserRouter>
  );
};

export { AppRoutes };
