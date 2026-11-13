import { matchPath } from 'react-router-dom';
import { PAGES } from '@/shared/config/pages-url.config';

interface PageBreadcrumb {
  label: string;
  href?: string;
}

export function getPageBreadcrumbs(pathname: string): PageBreadcrumb[] {
  if (matchPath(PAGES.SERVICE_CREATE, pathname)) {
    return [{ label: 'Услуги', href: PAGES.SERVICES }, { label: 'Новая услуга' }];
  }
  const serviceEdit = matchPath(PAGES.SERVICE_EDIT(':id'), pathname);
  if (serviceEdit?.params.id) {
    return [
      { label: 'Услуги', href: PAGES.SERVICES },
      { label: `Редактирование услуги №${serviceEdit.params.id}` },
    ];
  }
  if (matchPath(PAGES.CLIENT_CREATE, pathname)) {
    return [{ label: 'Клиенты', href: PAGES.CLIENTS }, { label: 'Новый клиент' }];
  }
  const clientEdit = matchPath(PAGES.CLIENT_EDIT(':id'), pathname);
  if (clientEdit?.params.id) {
    return [
      { label: 'Клиенты', href: PAGES.CLIENTS },
      { label: `Клиент №${clientEdit.params.id}`, href: PAGES.CLIENT_DETAIL(clientEdit.params.id) },
      { label: 'Редактирование' },
    ];
  }
  const client = matchPath(PAGES.CLIENT_DETAIL(':id'), pathname);
  if (client?.params.id) {
    return [{ label: 'Клиенты', href: PAGES.CLIENTS }, { label: `Клиент №${client.params.id}` }];
  }
  if (matchPath(PAGES.ORDER_CREATE, pathname)) {
    return [{ label: 'Заказы', href: PAGES.ORDERS }, { label: 'Новый заказ' }];
  }

  const edit = matchPath(PAGES.ORDER_EDIT(':id'), pathname);
  if (edit?.params.id) {
    return [
      { label: 'Заказы', href: PAGES.ORDERS },
      { label: `Заказ №${edit.params.id}`, href: PAGES.ORDER_DETAIL(edit.params.id) },
      { label: 'Редактирование' },
    ];
  }

  const detail = matchPath(PAGES.ORDER_DETAIL(':id'), pathname);
  if (detail?.params.id) {
    return [{ label: 'Заказы', href: PAGES.ORDERS }, { label: `Заказ №${detail.params.id}` }];
  }

  const pages = [
    { path: PAGES.SERVICES, label: 'Услуги' },
    { path: PAGES.ORDERS, label: 'Заказы' },
    { path: PAGES.ADMIN_ORDERS, label: 'Заказы' },
    { path: PAGES.CLIENTS, label: 'Клиенты' },
    { path: PAGES.PROFILE, label: 'Личный кабинет' },
  ];
  return [
    { label: pages.find((page) => matchPath(page.path, pathname))?.label ?? 'Страница не найдена' },
  ];
}
