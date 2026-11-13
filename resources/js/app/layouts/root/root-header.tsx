import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { getPageBreadcrumbs } from '@/shared/config/breadcrumbs.config';

export function RootHeader() {
  const { pathname } = useLocation();
  const breadcrumbs = getPageBreadcrumbs(pathname);
  return (
    <header className="flex min-h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full min-w-0 items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 shrink-0" aria-label="Переключить боковую панель" />
        {/* <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" /> */}
        <Breadcrumb aria-label="Навигационная цепочка">
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <Fragment key={item.href ?? item.label}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink render={<Link to={item.href} />}>{item.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
