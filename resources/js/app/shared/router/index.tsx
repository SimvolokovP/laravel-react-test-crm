import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RootLayout } from '@/layouts/root/root-layout';
import { LoginPage } from '@/pages/login/login-page';
import { ProtectedRoute } from '@/shared/router/protected-route';
import { OrdersIndexPage } from '@/pages/orders/orders-index-page';
import { ProfilePage } from '@/pages/profile/profile-page';
import { ClientsIndexPage } from '@/pages/clients/clients-index-page';
import { ClientsDetailPage } from '@/pages/clients/clients-detail-page';
import { ClientsFormPage } from '@/pages/clients/clients-form-page';
import { ServicesIndexPage } from '@/pages/services/services-index-page';
import { ServicesFormPage } from '@/pages/services/services-form-page';
import { PAGES } from '@/shared/config/pages-url.config';
import { OrdersFormPage } from '@/pages/orders/orders-form-page';
import { OrdersDetailPage } from '@/pages/orders/orders-detail-page';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PAGES.LOGIN} element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<RootLayout />}>
            <Route path={PAGES.MAIN} element={<Navigate to={PAGES.ORDERS} replace />} />
            <Route path={PAGES.ORDERS} element={<OrdersIndexPage />} />
            <Route path={PAGES.ORDER_CREATE} element={<OrdersFormPage />} />
            <Route path={PAGES.ORDER_DETAIL(':id')} element={<OrdersDetailPage />} />
            <Route element={<ProtectedRoute excludeRoles={['admin']} />}>
              <Route path={PAGES.PROFILE} element={<ProfilePage />} />
            </Route>
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path={PAGES.ORDER_EDIT(':id')} element={<OrdersFormPage />} />
              <Route path={PAGES.CLIENTS} element={<ClientsIndexPage />} />
              <Route path={PAGES.SERVICES} element={<ServicesIndexPage />} />
              <Route path={PAGES.SERVICE_CREATE} element={<ServicesFormPage />} />
              <Route path={PAGES.SERVICE_EDIT(':id')} element={<ServicesFormPage />} />
              <Route path={PAGES.CLIENT_CREATE} element={<ClientsFormPage />} />
              <Route path={PAGES.CLIENT_EDIT(':id')} element={<ClientsFormPage />} />
              <Route path={PAGES.CLIENT_DETAIL(':id')} element={<ClientsDetailPage />} />
              <Route path={PAGES.ADMIN_ORDERS} element={<OrdersIndexPage />} />
            </Route>
          </Route>
        </Route>
        <Route path={PAGES.FORBIDDEN} element={<div>Доступ запрещён</div>} />
        <Route path="*" element={<Navigate to={PAGES.MAIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
