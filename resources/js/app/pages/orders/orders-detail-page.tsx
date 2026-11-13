import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Pencil, UserRound } from 'lucide-react';
import { AxiosError } from 'axios';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { OrderDetailSkeleton } from '@/features/orders/components/order-skeletons';
import { Separator } from '@/shared/components/ui/separator';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useGetOrder } from '@/features/orders/hooks/use-get-order';
import { OrderStatusBadge } from '@/features/orders/components/order-status-badge';

import { formatPrice } from '@/shared/helpers/format-price';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export function OrdersDetailPage() {
  const { id } = useParams<{ id: string }>();

  const orderId = Number(id);
  const isValidId = Number.isInteger(orderId) && orderId > 0;

  const { data: authData } = useAuth();
  const { data: order, isPending, isError, error, refetch } = useGetOrder(orderId);

  const isAdmin = authData?.user.role === 'admin';

  if (!isValidId) {
    return (
      <div className="px-4 py-6 lg:px-6">
        <p className="text-sm text-destructive">Некорректный номер заказа.</p>
        <Button variant="outline" className="mt-4" render={<Link to="/orders" />}>
          К списку заказов
        </Button>
      </div>
    );
  }

  if (isPending) return <OrderDetailSkeleton />;

  if (isError || !order) {
    const status = error instanceof AxiosError ? error.response?.status : undefined;

    const message =
      status === 404
        ? 'Заказ не найден.'
        : status === 403
          ? 'У вас нет доступа к этому заказу.'
          : 'Не удалось загрузить заказ.';

    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 lg:px-6">
        <h1 className="text-xl font-semibold">{message}</h1>

        <div className="flex gap-2">
          <Button variant="outline" render={<Link to="/orders" />}>
            К списку заказов
          </Button>

          <Button onClick={() => void refetch()}>Повторить</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-2 md:gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            render={<Link to="/orders" />}
            aria-label="Назад к заказам"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Заказ #{order.id}</h1>

            <p className="text-sm text-muted-foreground">Информация о заказе</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />

          {isAdmin && (
            <Button variant="outline" render={<Link to={`/orders/${order.id}/edit`} />}>
              <Pencil className="size-4" />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о заказе</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 size-5 text-muted-foreground" />

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Клиент</p>
              <p className="font-medium">{order.client.name}</p>
              <p className="text-sm text-muted-foreground">{order.client.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-5 text-muted-foreground" />

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Дата создания</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Услуги</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4">Наименование</TableHead>
                  <TableHead className="px-4 text-right">Стоимость</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {order.services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="px-4 py-4 font-medium">{service.name}</TableCell>

                    <TableCell className="px-4 py-4 text-right tabular-nums">
                      {formatPrice(service.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Общая стоимость</p>
              <p className="text-xs text-muted-foreground">{order.services.length} услуг(и)</p>
            </div>

            <p className="text-2xl font-semibold tabular-nums">{formatPrice(order.amount)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
