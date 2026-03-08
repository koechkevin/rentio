import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const PayslipGenerator = lazy(() => import('../pages/payslips/PayslipGenerator'));

export const payslipRoutes: RouteObject[] = [
  {
    path: 'payslips',
    children: [
      {
        path: 'create',
        element: <PayslipGenerator />,
      },
    ],
  },
];
