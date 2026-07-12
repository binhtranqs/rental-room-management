import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { BillDetailPage } from '@/pages/BillDetailPage'
import { BillsListPage } from '@/pages/BillsListPage'
import { ContractCreatePage } from '@/pages/ContractCreatePage'
import { ContractDetailPage } from '@/pages/ContractDetailPage'
import { ContractsListPage } from '@/pages/ContractsListPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OwnerDashboardPage } from '@/pages/OwnerDashboardPage'
import { RoomCreatePage } from '@/pages/RoomCreatePage'
import { RoomDetailPage } from '@/pages/RoomDetailPage'
import { RoomEditPage } from '@/pages/RoomEditPage'
import { RoomsListPage } from '@/pages/RoomsListPage'
import { TenantCreatePage } from '@/pages/TenantCreatePage'
import { TenantDashboardPage } from '@/pages/TenantDashboardPage'
import { TenantDetailPage } from '@/pages/TenantDetailPage'
import { TenantEditPage } from '@/pages/TenantEditPage'
import { TenantsListPage } from '@/pages/TenantsListPage'
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
          {
            path: 'owner/tenants',
            element: <TenantsListPage />,
          },
          {
            path: 'owner/tenants/new',
            element: <TenantCreatePage />,
          },
          {
            path: 'owner/tenants/:id',
            element: <TenantDetailPage />,
          },
          {
            path: 'owner/tenants/:id/edit',
            element: <TenantEditPage />,
          },
          {
            path: 'owner/contracts',
            element: <ContractsListPage />,
          },
          {
            path: 'owner/contracts/new',
            element: <ContractCreatePage />,
          },
          {
            path: 'owner/contracts/:id',
            element: <ContractDetailPage />,
          },
          {
            path: 'owner/bills',
            element: <BillsListPage />,
          },
          {
            path: 'owner/bills/:id',
            element: <BillDetailPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['TENANT']} />,
        children: [
          {
            path: 'tenant/dashboard',
            element: <TenantDashboardPage />,
          },
          {
            path: 'tenant/bills',
            element: <BillsListPage />,
          },
          {
            path: 'tenant/bills/:id',
            element: <BillDetailPage />,
          },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
