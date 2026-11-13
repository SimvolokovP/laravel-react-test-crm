import { Skeleton } from '@/shared/components/ui/skeleton';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { UserRole } from '@/features/auth/types/auth.types';
import { PAGES } from '@/shared/config/pages-url.config';

interface ProtectedRouteProps {
  roles?: UserRole[];
  excludeRoles?: UserRole[];
}

export function ProtectedRoute({ roles, excludeRoles }: ProtectedRouteProps) {
  const { data, isPending, isError } = useAuth();

  if (isPending) {
    return (
      <div role="status" aria-label="Загрузка приложения" className="flex min-h-screen">
        <div
          className="hidden w-72 shrink-0 space-y-6 border-r bg-sidebar p-4 md:block"
          aria-hidden="true"
        >
          <Skeleton className="h-8 w-36" />
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-9 w-full" />
          ))}
        </div>
        <div className="min-w-0 flex-1" aria-hidden="true">
          <div className="flex h-12 items-center gap-4 border-b px-6">
            <Skeleton className="size-6" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-6 p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.user) {
    return <Navigate to={PAGES.LOGIN} replace />;
  }

  if (roles && !roles.includes(data.user.role)) {
    return <Navigate to={PAGES.FORBIDDEN} replace />;
  }

  if (excludeRoles?.includes(data.user.role)) {
    return <Navigate to={PAGES.ORDERS} replace />;
  }

  return <Outlet />;
}
