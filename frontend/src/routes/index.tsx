// ...existing imports...
import { payslipRoutes } from './payslip.routes';

export const mainRoutes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      // ...existing routes...
      ...payslipRoutes,
    ],
  },
];
