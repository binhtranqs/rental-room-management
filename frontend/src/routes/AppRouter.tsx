import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OwnerDashboardPage } from '@/pages/OwnerDashboardPage'
import { RoomCreatePage } from '@/pages/RoomCreatePage'
import { RoomDetailPage } from '@/pages/RoomDetailPage'
import { RoomEditPage } from '@/pages/RoomEditPage'
import { RoomsListPage } from '@/pages/RoomsListPage'
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
            element: <OwnerDashboardPage />,
          },
          {
            path: 'owner/rooms',
            element: <RoomsListPage />,
          },
          {
            path: 'owner/rooms/new',
            element: <RoomCreatePage />,
          },
          {
            path: 'owner/rooms/:id',
            element: <RoomDetailPage />,
          },
          {
            path: 'owner/rooms/:id/edit',
            element: <RoomEditPage />,
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
