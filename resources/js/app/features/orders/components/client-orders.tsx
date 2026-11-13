import { useGetOrders } from '@/features/orders/hooks/use-get-orders';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/shared/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { PAGES } from '@/shared/config/pages-url.config';
import { formatPrice } from '@/shared/helpers/format-price';
import { OrderStatusBadge } from '@/features/orders/components/order-status-badge';

export function ClientOrders({ clientId }: { clientId: number }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch } = useGetOrders({
    client_id: clientId,
    page,
    per_page: 10,
    sort: 'id',
    direction: 'desc',
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Заказы клиента{' '}
          <span className="ml-2 text-sm text-muted-foreground">{data?.meta.total ?? ''}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                {['Номер', 'Услуги', 'Сумма', 'Статус'].map((label) => (
                  <TableHead key={label} className="px-4">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                [0, 1, 2].map((row) => (
                  <TableRow key={row}>
                    {[0, 1, 2, 3].map((cell) => (
                      <TableCell key={cell} className="px-4 py-4">
                        <Skeleton className="h-5 w-full max-w-32" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <p role="alert" className="mb-3 text-destructive">
                      Не удалось загрузить заказы
                    </p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      Повторить
                    </Button>
                  </TableCell>
                </TableRow>
              ) : !data?.data.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    У клиента пока нет заказов
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    tabIndex={0}
                    role="link"
                    aria-label={`Открыть заказ №${order.id}`}
                    onClick={() => navigate(PAGES.ORDER_DETAIL(order.id))}
                  >
                    <TableCell className="px-4 py-4 font-medium">#{order.id}</TableCell>
                    <TableCell className="min-w-48 max-w-80 px-4 py-4 whitespace-normal break-words text-muted-foreground">
                      {order.services.map((service) => service.name).join(', ')}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-medium tabular-nums">
                      {formatPrice(order.amount)}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {!isPending && !isError && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              Показано {data?.data.length ?? 0} из {data?.meta.total ?? 0} заказов · Страница{' '}
              {data?.meta.current_page ?? 1} из {data?.meta.last_page ?? 1}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Назад
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (data?.meta.last_page ?? 1)}
                onClick={() => setPage(page + 1)}
              >
                Далее
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
