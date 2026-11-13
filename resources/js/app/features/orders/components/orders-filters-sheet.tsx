import { useState, type FormEvent } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
} from '@/shared/components/ui/sheet';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/shared/components/ui/native-select';
import type { OrdersFilters, OrderStatus } from '@/features/orders/types/orders.types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useGetOrdersClients } from '@/features/orders/hooks/use-get-order-clients';

interface Props {
  filters: OrdersFilters;
  onApply: (filters: OrdersFilters) => void;
}

export function OrdersFiltersSheet({ filters, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const count = Object.keys(filters).length;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" />}>
        <SlidersHorizontal className="size-4" />
        Фильтры{count > 0 ? ` (${count})` : ''}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Фильтры заказов</SheetTitle>
          <SheetDescription>Задайте условия и нажмите «Применить».</SheetDescription>
        </SheetHeader>
        {open && (
          <FiltersForm
            filters={filters}
            onApply={(value) => {
              onApply(value);
              setOpen(false);
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function FiltersForm({ filters, onApply }: Props) {
  const { data: auth } = useAuth();
  const isAdmin = auth?.user.role === 'admin';
  const clientsQuery = useGetOrdersClients(isAdmin);
  const [minimum, setMinimum] = useState(filters.amount_min?.toString() ?? '');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result: OrdersFilters = {};
    const client = String(data.get('client_id') ?? '');
    const status = String(data.get('status') ?? '');
    const min = String(data.get('amount_min') ?? '');
    const max = String(data.get('amount_max') ?? '');
    if (isAdmin && client) result.client_id = Number(client);
    if (status) result.status = status as OrderStatus;
    if (min) result.amount_min = Number(min);
    if (max) result.amount_max = Number(max);
    onApply(result);
  }
  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {isAdmin && (
          <div className="space-y-2">
            <label htmlFor="filter-client" className="text-sm font-medium">
              Клиент
            </label>
            <NativeSelect
              id="filter-client"
              name="client_id"
              defaultValue={filters.client_id ?? ''}
              disabled={clientsQuery.isPending || clientsQuery.isError}
            >
              <NativeSelectOption value="">
                {clientsQuery.isPending ? 'Загрузка клиентов...' : 'Все клиенты'}
              </NativeSelectOption>
              {clientsQuery.data?.map((client) => (
                <NativeSelectOption key={client.id} value={client.id}>
                  {client.name} — {client.email}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {clientsQuery.isError && (
              <div role="alert" className="space-y-2">
                <p className="text-sm text-destructive">Не удалось загрузить клиентов</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => clientsQuery.refetch()}
                >
                  Повторить
                </Button>
              </div>
            )}
          </div>
        )}
        <label className="grid gap-2 text-sm font-medium">
          Статус
          <NativeSelect name="status" defaultValue={filters.status ?? ''}>
            <NativeSelectOption value="">Все статусы</NativeSelectOption>
            <NativeSelectOption value="new">Новый</NativeSelectOption>
            <NativeSelectOption value="in_progress">В работе</NativeSelectOption>
            <NativeSelectOption value="completed">Завершён</NativeSelectOption>
            <NativeSelectOption value="cancelled">Отменён</NativeSelectOption>
          </NativeSelect>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2 text-sm font-medium">
            Сумма от, ₽
            <Input
              name="amount_min"
              type="number"
              min="0"
              step="1"
              value={minimum}
              onChange={(event) => setMinimum(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Сумма до, ₽
            <Input
              name="amount_max"
              type="number"
              min={minimum || 0}
              step="1"
              defaultValue={filters.amount_max}
            />
          </label>
        </div>
      </div>
      <SheetFooter>
        <Button
          type="submit"
          disabled={isAdmin && (clientsQuery.isPending || clientsQuery.isError)}
        >
          Применить
        </Button>
        <Button type="button" variant="outline" onClick={() => onApply({})}>
          Сбросить фильтры
        </Button>
      </SheetFooter>
    </form>
  );
}
