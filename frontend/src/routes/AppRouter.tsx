import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { LoginPlaceholderPage } from '@/pages/LoginPlaceholderPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

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
        element: <LoginPlaceholderPage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
