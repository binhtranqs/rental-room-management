import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OwnerDashboardPlaceholderPage } from '@/pages/OwnerDashboardPlaceholderPage'
import { TenantDashboardPlaceholderPage } from '@/pages/TenantDashboardPlaceholderPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        element: <ProtectedRoute allowedRoles={['OWNER']} />,
        children: [
          {
            path: 'owner/dashboard',
            element: <OwnerDashboardPlaceholderPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['TENANT']} />,
        children: [
          {
            path: 'tenant/dashboard',
            element: <TenantDashboardPlaceholderPage />,
          },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
