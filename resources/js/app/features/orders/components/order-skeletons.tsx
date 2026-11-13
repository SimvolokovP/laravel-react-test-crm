import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function ServicesSkeleton() {
  return (
    <div role="status" aria-label="Загрузка услуг" className="divide-y rounded-lg border">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-3 p-4" aria-hidden="true">
          <Skeleton className="size-4 shrink-0" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="ml-auto h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function OrderFormSkeleton() {
  return (
    <div role="status" aria-label="Загрузка формы заказа" className="space-y-6 p-4">
      <div className="flex items-center gap-3" aria-hidden="true">
        <Skeleton className="size-9" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-3/4 max-w-80" />
          <Skeleton className="h-4 w-1/2 max-w-64" />
        </div>
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2" aria-hidden="true">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[0, 1].map((item) => (
              <div key={item} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
            <Skeleton className="h-4 w-24" />
            <ServicesSkeleton />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-28" />
            </div>
            <Skeleton className="h-9 w-40" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div role="status" aria-label="Загрузка заказа" className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3" aria-hidden="true">
        <Skeleton className="size-9" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
      <Card aria-hidden="true">
        <CardHeader>
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card aria-hidden="true">
        <CardHeader>
          <Skeleton className="h-5 w-20" />
        </CardHeader>
        <CardContent>
          <ServicesSkeleton />
          <div className="mt-6 flex justify-between border-t pt-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-28" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
