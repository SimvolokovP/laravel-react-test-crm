const rootPath = '/';

export const PAGES = {
  root: rootPath,
  MAIN: rootPath,
  LOGIN: `${rootPath}login`,
  PROFILE: `${rootPath}profile`,
  ORDERS: `${rootPath}orders`,
  ORDER_CREATE: `${rootPath}orders/create`,
  ORDER_DETAIL: (id: number | string) => `${rootPath}orders/${id}`,
  ORDER_EDIT: (id: number | string) => `${rootPath}orders/${id}/edit`,
  CLIENTS: `${rootPath}clients`,
  SERVICES: `${rootPath}services`,
  SERVICE_CREATE: `${rootPath}services/create`,
  SERVICE_EDIT: (id: number | string) => `${rootPath}services/${id}/edit`,
  CLIENT_CREATE: `${rootPath}clients/create`,
  CLIENT_EDIT: (id: number | string) => `${rootPath}clients/${id}/edit`,
  CLIENT_DETAIL: (id: number | string) => `${rootPath}clients/${id}`,
  ADMIN_ORDERS: `${rootPath}admin/orders`,
  FORBIDDEN: `${rootPath}forbidden`,
} as const;
