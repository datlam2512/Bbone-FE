import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import PublicLayout from './layouts/PublicLayout'
import WorkspaceLayout from './layouts/WorkspaceLayout'
import RequireSession from './guards/RequireSession'
import RouteErrorPage from '@/shared/components/feedback/RouteErrorPage'
import AppLoading from '@/shared/components/feedback/AppLoading'

import { adminRoles, adminRoutes } from '@/features/admin/admin.routes'
import { staffRoles, staffRoutes } from '@/features/staff/staff.routes'

const lazyPage = (load) => async () => ({ Component: (await load()).default })

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    HydrateFallback: AppLoading,
    children: [
      {
        Component: PublicLayout,
        children: [
          { index: true, lazy: lazyPage(() => import('@/features/home/pages/HomePage')) },
          ...[
            ['ve-chung-toi', 'Về BBONE'],
            ['lien-he', 'Liên hệ BBONE'],
            ['thong-tin', 'Trung tâm thông tin BBONE'],
          ].map(([path, title]) => ({
            path,
            handle: { title },
            lazy: lazyPage(() => import('@/features/information/pages/InformationPage')),
          })),
          {
            path: 'thong-tin/:slug',
            lazy: lazyPage(() => import('@/features/information/pages/InformationPage')),
          },
          { path: 'dang-nhap', lazy: lazyPage(() => import('@/features/auth/pages/LoginPage')) },
          ...[
            ['verify-email', 'verify'],
            ['reset-password', 'reset'],
          ].map(([path, mode]) => ({
            path,
            lazy: async () => {
              const { default: Page } = await import('@/features/auth/pages/AuthSupportPage')
              return { Component: () => <Page mode={mode} /> }
            },
          })),
          {
            path: 'san-pham',
            lazy: lazyPage(() => import('@/features/catalog/pages/ProductsPage')),
          },
          {
            path: 'san-pham/:productId',
            lazy: lazyPage(() => import('@/features/catalog/pages/ProductDetailPage')),
          },
          {
            path: 'phong-kham',
            lazy: lazyPage(() => import('@/features/clinics/pages/ClinicsPage')),
          },
          {
            path: 'kien-thuc',
            lazy: lazyPage(() => import('@/features/knowledge/pages/KnowledgePage')),
          },
          {
            path: 'phong-kham/:clinicId',
            lazy: lazyPage(() => import('@/features/clinics/pages/ClinicDetailPage')),
          },
          {
            path: 'kien-thuc/:slug',
            lazy: lazyPage(() => import('@/features/knowledge/pages/ArticleDetailPage')),
          },
          {
            path: 'dat-lich',
            lazy: lazyPage(() => import('@/features/appointments/pages/BookingPage')),
          },
          {
            path: 'kiem-tra-suc-khoe',
            lazy: lazyPage(() => import('@/features/screening/pages/ScreeningPage')),
          },
          ...['register', 'forgot', 'reset', 'verify'].map((mode, index) => ({
            path: ['dang-ky', 'quen-mat-khau', 'dat-lai-mat-khau', 'xac-minh'][index],
            lazy: async () => {
              const { default: Page } = await import('@/features/auth/pages/AuthSupportPage')
              return { Component: () => <Page mode={mode} /> }
            },
          })),
          { path: 'gio-hang', lazy: lazyPage(() => import('@/features/cart/pages/CartPage')) },
          {
            Component: RequireSession,
            children: [
              {
                path: 'thanh-toan',
                lazy: lazyPage(() => import('@/features/cart/pages/CheckoutPage')),
              },
            ],
          },
          {
            path: 'tai-khoan',
            Component: RequireSession,
            children: [
              { index: true, lazy: lazyPage(() => import('@/features/account/pages/AccountPage')) },
              ...['appointments', 'orders', 'screening/results'].map((kind, index) => ({
                path: ['lich-hen', 'don-hang', 'kiem-tra'][index],
                lazy: async () => {
                  const { default: Page } = await import('@/features/account/pages/HistoryPage')
                  return { Component: () => <Page kind={kind} /> }
                },
              })),
              {
                path: 'lich-hen/:id',
                lazy: lazyPage(() => import('@/features/account/pages/AppointmentDetailPage')),
              },
              {
                path: 'don-hang/:id',
                lazy: lazyPage(() => import('@/features/account/pages/OrderDetailPage')),
              },
              {
                path: 'giao-hang/:id',
                lazy: lazyPage(() => import('@/features/account/pages/ShipmentPage')),
              },
              {
                path: 'ho-so/:id',
                lazy: lazyPage(() => import('@/features/account/pages/EncounterPage')),
              },
              ...['profile', 'addresses', 'notifications', 'favorites', 'records'].map(
                (mode, index) => ({
                  path: ['thong-tin', 'dia-chi', 'thong-bao', 'yeu-thich', 'ho-so'][index],
                  lazy: async () => {
                    const { default: Page } =
                      await import('@/features/account/pages/AccountSettingsPage')
                    return { Component: () => <Page mode={mode} /> }
                  },
                }),
              ),
            ],
          },
        ],
      },
      {
        path: 'quan-tri',
        Component: WorkspaceLayout,
        handle: { workspace: 'admin', roles: adminRoles },
        children: adminRoutes.map((route) => ({
          ...route,
          lazy: async () => {
            const path = route.path
            if (route.index) {
              return {
                Component: (await import('@/features/admin/pages/AdminDashboardPage')).default,
              }
            }
            if (['san-pham', 'noi-dung', 'phong-kham', 'dich-vu'].includes(path)) {
              const { default: Page } = await import('@/features/admin/pages/AdminCatalogPage')
              const kind = {
                'san-pham': 'products',
                'noi-dung': 'articles',
                'phong-kham': 'clinics',
                'dich-vu': 'services',
              }[path]
              return { Component: () => <Page kind={kind} /> }
            }
            if (path === 'hoan-tien')
              return { Component: (await import('@/features/admin/pages/RefundsPage')).default }
            if (path === 'nguoi-dung')
              return { Component: (await import('@/features/admin/pages/AdminUsersPage')).default }
            if (['don-hang', 'giao-hang'].includes(path)) {
              const { default: Page } = await import('@/features/admin/pages/AdminOrdersPage')
              return { Component: () => <Page shipments={path === 'giao-hang'} /> }
            }
            if (path === 'bao-cao')
              return { Component: (await import('@/features/admin/pages/ReportsPage')).default }
            const { default: Page } = await import('@/features/admin/pages/OperationsPage')
            return {
              Component: () => (
                <Page
                  mode={
                    { 'nhat-ky': 'audit', 'tac-vu': 'outbox', 'cau-hinh': 'runtime-policy' }[path]
                  }
                />
              ),
            }
          },
        })),
      },
      {
        path: 'nhan-vien',
        Component: WorkspaceLayout,
        handle: { workspace: 'staff', roles: staffRoles },
        children: staffRoutes.map((route) => ({
          ...route,
          lazy: async () => {
            if (route.path === 'noi-dung') {
              const { default: Page } = await import('@/features/admin/pages/AdminCatalogPage')
              return { Component: () => <Page kind="articles" /> }
            }
            if (route.path === 'khung-gio')
              return { Component: (await import('@/features/staff/pages/SchedulePage')).default }
            if (route.path === 'ho-so')
              return { Component: (await import('@/features/staff/pages/ClinicalPage')).default }
            if (route.path === 'dat-tai-quay')
              return { Component: (await import('@/features/staff/pages/DeskBookingPage')).default }
            if (route.path === 'bao-cao')
              return { Component: (await import('@/features/admin/pages/ReportsPage')).default }
            const { default: Page } = await import('@/features/staff/pages/StaffPage')
            return {
              Component: () => (
                <Page
                  mode={
                    route.index
                      ? 'overview'
                      : route.path === 'benh-nhan'
                        ? 'patients'
                        : 'appointments'
                  }
                />
              ),
            }
          },
        })),
      },
    ],
  },
])
