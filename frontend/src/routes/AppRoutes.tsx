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
// const InvoiceDetail = lazy(() => import('@/pages/invoices/InvoiceDetail'));
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
            {/* <Route path="apps/calendar" element={<CalendarPage />} />
            <Route path="apps/chat" element={<ChatPage />} /> */}
            {/* <Route element={<EmailLayout />}>
              <Route path="apps/email/inbox" element={<InboxPage />} />
              <Route path="apps/email/read" element={<ReadPage />} />
              <Route path="apps/email/read/:emailId" element={<ReadPage />} />
              <Route path="apps/email/compose" element={<ComposePage />} />
            </Route> */}

            {/* <Route path="ui-components/accordion" element={<AccordionPage />} />
            <Route path="ui-components/alerts" element={<AlertPage />} />
            <Route path="ui-components/badges" element={<BadgePage />} />
            <Route path="ui-components/breadcrumbs" element={<BreadcrumbPage />} />
            <Route path="ui-components/buttons" element={<ButtonPage />} />
            <Route path="ui-components/button-group" element={<ButtonGroupPage />} />
            <Route path="ui-components/cards" element={<CardPage />} />
            <Route path="ui-components/carousel" element={<CarouselPage />} />
            <Route path="ui-components/collapse" element={<CollapsePage />} />
            <Route path="ui-components/dropdowns" element={<DropdownPage />} />
            <Route path="ui-components/list-group" element={<ListGroupPage />} />
            <Route path="ui-components/modal" element={<ModalPage />} />
            <Route path="ui-components/navs" element={<NavPage />} />
            <Route path="ui-components/offcanvas" element={<OffcanvasPage />} />
            <Route path="ui-components/overlay" element={<OverlayPage />} />
            <Route path="ui-components/pagination" element={<PaginationPage />} />
            <Route path="ui-components/placeholder" element={<PlaceholderPage />} />
            <Route path="ui-components/progress" element={<ProgressBarPage />} />
            <Route path="ui-components/scrollbar" element={<ScrollbarPage />} />
            <Route path="ui-components/spinners" element={<SpinnerPage />} />
            <Route path="ui-components/table" element={<TablePage />} />
            <Route path="ui-components/tabs" element={<TabsPage />} />
            <Route path="ui-components/toasts" element={<ToastPage />} />

            <Route path="advanced-ui/image-cropper" element={<ImageCropperPage />} />
            <Route path="advanced-ui/swiper" element={<SwiperPage />} />
            <Route path="advanced-ui/sortable" element={<SortablePage />} />
            <Route path="advanced-ui/sweet-alert" element={<SweetAlertPage />} />

            <Route path="form-elements/form-control" element={<FormControlPage />} />
            <Route path="form-elements/form-text" element={<FormTextPage />} />
            <Route path="form-elements/select" element={<SelectPage />} />
            <Route path="form-elements/checks-radios" element={<ChecksRadiosPage />} />
            <Route path="form-elements/range" element={<RangePage />} />
            <Route path="form-elements/input-group" element={<InputGroupPage />} />
            <Route path="form-elements/floating-labels" element={<FloatingLabelPage />} />
            <Route path="form-elements/layout" element={<FormLayoutPage />} />
            <Route path="form-elements/validation" element={<ValidationPage />} />

            <Route path="advanced-forms/form-validation" element={<FormValidationPage />} />
            <Route path="advanced-forms/number-format" element={<NumberFormatPage />} />
            <Route path="advanced-forms/search-select" element={<SearchSelectPage />} />
            <Route path="advanced-forms/color-picker" element={<ColorPickerPage />} />
            <Route path="advanced-forms/dropzone" element={<DropzonePage />} />
            <Route path="advanced-forms/datepicker" element={<DatePickerPage />} />
            <Route path="advanced-forms/text-editor" element={<TextEditorPage />} /> */}

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

            {/* Invoice Management Routes */}
            <Route path="/finance/invoices" element={<InvoiceList />} />
            <Route path="/finance/invoices/create" element={<CreateInvoiceForm />} />
            <Route path="/finance/invoices/:id" element={<InvoiceDetail />} />

            {/* Payment Management Routes */}
            <Route path="/finance/payments" element={<PaymentList />} />
            <Route path="/finance/payments/create" element={<CreatePaymentForm />} />
            <Route path="/finance/arrears" element={<ArrearsTable />} />
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
        <Route path="*" element={<Navigate to="/error/404" />} />
      </Routes>
    </BrowserRouter>
  );
};

export { AppRoutes };
