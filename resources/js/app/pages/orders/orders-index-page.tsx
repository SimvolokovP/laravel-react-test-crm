import { OrdersFiltersSheet } from '@/features/orders/components/orders-filters-sheet';
import { Input } from '@/shared/components/ui/input';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { Search } from 'lucide-react';
import type { OrdersFilters, OrdersSort } from '@/features/orders/types/orders.types';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/shared/components/ui/table';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { NativeSelect, NativeSelectOption } from '@/shared/components/ui/native-select';
import { Plus, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useDeleteOrder } from '@/features/orders/hooks/use-delete-order';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { PAGES } from '@/shared/config/pages-url.config';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/shared/components/ui/alert-dialog';

import { useGetOrders } from '@/features/orders/hooks/use-get-orders';
import { formatPrice } from '@/shared/helpers/format-price';

import { useNavigate } from 'react-router-dom';

import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '@/features/orders/components/order-status-badge';

export function OrdersIndexPage() {
  const navigate = useNavigate();
  const { data: auth } = useAuth();
  const isAdmin = auth?.user.role === 'admin';
  const columns = isAdmin ? 6 : 5;
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteOrder = useDeleteOrder({
    onSuccess: () => {
      toast.success('Заказ удалён');
      setDeletingId(null);
    },
    onError: (message) => toast.error(message),
  });

  const [filters, setFilters] = useState<OrdersFilters>({});
  const [sort, setSort] = useState<OrdersSort>('id');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<10 | 15 | 20>(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 1000);
  const { data, isPending, isError, refetch } = useGetOrders({
    ...filters,
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    sort,
    direction,
  });
  function changeSort(column: OrdersSort) {
    setDirection(sort === column && direction === 'asc' ? 'desc' : 'asc');
    setSort(column);
    setPage(1);
  }
  const headers: { label: string; sort?: OrdersSort }[] = [
    { label: 'Номер', sort: 'id' },
    { label: 'Клиент', sort: 'client' },
    { label: 'Услуги' },
    { label: 'Сумма', sort: 'amount' },
    { label: 'Статус', sort: 'status' },
  ];

  const orders = data?.data ?? [];

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
          <div>
            <h2 className="font-semibold">
              Все заказы
              <span className="ml-2 text-xs text-muted-foreground">{data?.meta?.total ?? 0}</span>
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">От первого обращения до завершения</p>
          </div>

          <div className="flex w-full flex-wrap md:items-center gap-2 sm:w-auto flex-col md:flex-row items-start">
            <Button render={<Link to={PAGES.ORDER_CREATE} />}>
              <Plus className="size-4" />
              Новый заказ
            </Button>
            <label className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
              <span className="sr-only">Поиск по номеру заказа или клиенту</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                maxLength={255}
                placeholder="Номер заказа или клиент"
                className="pl-9"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </label>
            <OrdersFiltersSheet
              filters={filters}
              onApply={(value) => {
                setFilters(value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                {headers.map((header) => (
                  <TableHead
                    key={header.label}
                    className="px-5 py-3 text-xs font-medium"
                    aria-sort={
                      header.sort && sort === header.sort
                        ? direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    {header.sort ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3"
                        onClick={() => changeSort(header.sort!)}
                      >
                        {header.label}
                        {sort !== header.sort ? (
                          <ArrowUpDown className="size-4" />
                        ) : direction === 'asc' ? (
                          <ArrowUp className="size-4" />
                        ) : (
                          <ArrowDown className="size-4" />
                        )}
                      </Button>
                    ) : (
                      header.label
                    )}
                  </TableHead>
                ))}
                {isAdmin && <TableHead className="px-5 text-right">Действия</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isPending ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: columns }).map((_, cell) => (
                      <TableCell key={cell} className="px-5 py-4">
                        <Skeleton className="h-5 w-full max-w-32" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={columns} className="h-32 text-center">
                    <p className="mb-3 text-sm text-destructive">Не удалось загрузить заказы</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      Повторить
                    </Button>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns} className="h-32 text-center text-muted-foreground">
                    Заказы не найдены
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  return (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      tabIndex={0}
                      role="link"
                      aria-label={`Открыть заказ №${order.id}`}
                      onClick={() => navigate(PAGES.ORDER_DETAIL(order.id))}
                      onKeyDown={(event) => {
                        if (event.target === event.currentTarget && event.key === 'Enter')
                          navigate(PAGES.ORDER_DETAIL(order.id));
                      }}
                    >
                      <TableCell className="px-5 py-4 font-semibold">#{order.id}</TableCell>

                      <TableCell className="px-5 py-4 font-medium">
                        {isAdmin ? (
                          <Link
                            to={PAGES.CLIENT_DETAIL(order.client.id)}
                            onClick={(event) => event.stopPropagation()}
                            className="hover:underline"
                          >
                            {order.client.name}
                          </Link>
                        ) : (
                          order.client.name
                        )}
                      </TableCell>

                      <TableCell className="min-w-48 max-w-80 px-5 py-4 whitespace-normal break-words text-muted-foreground">
                        {order.services.map((service) => service.name).join(', ')}
                      </TableCell>

                      <TableCell className="px-5 py-4 font-medium tabular-nums">
                        {formatPrice(order.amount)}
                      </TableCell>

                      <TableCell className="px-5 py-4">
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      {isAdmin && (
                        <TableCell
                          className="px-5 py-4"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              render={<Link to={PAGES.ORDER_EDIT(order.id)} />}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!isPending && !isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-xs text-muted-foreground">
            <div className="flex gap-2 items-center">
              Показано
              <NativeSelect
                size="sm"
                value={perPage}
                onChange={(event) => {
                  setPerPage(Number(event.target.value) as 10 | 15 | 20);
                  setPage(1);
                }}
              >
                {[10, 15, 20].map((value) => (
                  <NativeSelectOption key={value} value={value}>
                    {value}
                  </NativeSelectOption>
                ))}
              </NativeSelect>{' '}
              заказов · Страница {data?.meta.current_page ?? 1} из {data?.meta.last_page ?? 1}
            </div>
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
      </Card>
      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open && !deleteOrder.isPending) setDeletingId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заказ №{deletingId}?</AlertDialogTitle>
            <AlertDialogDescription>
              Заказ будет удалён без возможности восстановления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteOrder.isError && (
            <p role="alert" className="text-sm text-destructive">
              Не удалось удалить заказ. Попробуйте ещё раз.
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOrder.isPending}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteOrder.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (deletingId !== null) deleteOrder.mutate(deletingId);
              }}
            >
              {deleteOrder.isPending ? 'Удаляем...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
