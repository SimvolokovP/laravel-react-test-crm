import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useDeleteServices } from '@/features/services/hooks/use-delete-services';
import { errorCatch } from '@/shared/api/api.config';
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
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { PAGES } from '@/shared/config/pages-url.config';
import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Search } from 'lucide-react';
import { useGetServices } from '@/features/services/hooks/use-get-services';
import type { ServicesSort } from '@/features/services/types/services.types';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { formatPrice } from '@/shared/helpers/format-price';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { NativeSelect, NativeSelectOption } from '@/shared/components/ui/native-select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/shared/components/ui/table';

const headers: { label: string; sort?: ServicesSort }[] = [
  { label: 'Номер', sort: 'id' },
  { label: 'Наименование', sort: 'name' },
  { label: 'Описание' },
  { label: 'Стоимость', sort: 'price' },
  { label: 'Статус', sort: 'is_active' },
];

export function ServicesIndexPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const deleteServices = useDeleteServices({
    onSuccess: () => {
      toast.success('Удаление выполнено');
      setSelectedIds([]);
      setDeletingIds([]);
      setPage(1);
      setSelectedIds([]);
    },
    onError: (message) => toast.error(message),
  });
  function confirmDelete(ids: number[]) {
    deleteServices.reset();
    setDeletingIds([...ids]);
  }
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<10 | 15 | 20>(10);
  const [sort, setSort] = useState<ServicesSort>('id');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const [active, setActive] = useState('all');
  const { data, isPending, isError, refetch } = useGetServices({
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    sort,
    direction,
    is_active: active === 'all' ? undefined : active === '1' ? 1 : 0,
  });
  const services = data?.data ?? [];
  const visibleSelected = services.filter((service) => selectedIds.includes(service.id));
  const allSelected = services.length > 0 && visibleSelected.length === services.length;
  function changeSort(column: ServicesSort) {
    setDirection(sort === column && direction === 'asc' ? 'desc' : 'asc');
    setSort(column);
    setPage(1);
    setSelectedIds([]);
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
          <div>
            <h2 className="font-semibold">
              Все услуги{' '}
              <span className="ml-2 text-xs text-muted-foreground">{data?.meta.total ?? 0}</span>
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Каталог услуг и их стоимость</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <label className="relative min-w-0 flex-1 sm:w-72">
              <span className="sr-only">Поиск по названию или описанию услуги</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                maxLength={255}
                placeholder="Название или описание услуги"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                  setSelectedIds([]);
                }}
                className="pl-9"
              />
            </label>
            <NativeSelect
              aria-label="Фильтр активности услуг"
              value={active}
              onChange={(event) => {
                setActive(event.target.value);
                setPage(1);
                setSelectedIds([]);
              }}
            >
              <NativeSelectOption value="all">Все услуги</NativeSelectOption>
              <NativeSelectOption value="1">Активные</NativeSelectOption>
              <NativeSelectOption value="0">Неактивные</NativeSelectOption>
            </NativeSelect>
            <Button render={<Link to={PAGES.SERVICE_CREATE} />}>
              <Plus className="size-4" />
              Новая услуга
            </Button>
          </div>
        </div>
        {visibleSelected.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
            <span className="text-sm text-muted-foreground">
              Выбрано на странице: {visibleSelected.length}
            </span>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteServices.isPending}
              onClick={() => confirmDelete(visibleSelected.map((service) => service.id))}
            >
              <Trash2 className="size-4" />
              Удалить
            </Button>
          </div>
        )}
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12 px-5">
                <Checkbox
                  aria-label="Выбрать все услуги на странице"
                  checked={allSelected}
                  indeterminate={!allSelected && visibleSelected.length > 0}
                  disabled={
                    isPending || isError || services.length === 0 || deleteServices.isPending
                  }
                  onCheckedChange={(checked) =>
                    setSelectedIds(checked ? services.map((service) => service.id) : [])
                  }
                />
              </TableHead>
              {headers.map((header) => (
                <TableHead
                  key={header.label}
                  className="px-5 py-3"
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
              <TableHead className="px-5 py-3 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              [0, 1, 2, 3, 4].map((row) => (
                <TableRow key={row}>
                  <TableCell className="px-5 py-4">
                    <Skeleton className="size-4" />
                  </TableCell>
                  {headers.map((header) => (
                    <TableCell key={header.label} className="px-5 py-4">
                      <Skeleton className="h-5 w-full max-w-40" />
                    </TableCell>
                  ))}
                  <TableCell className="px-5 py-4">
                    <Skeleton className="ml-auto h-8 w-9" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <p role="alert" className="mb-3 text-sm text-destructive">
                    Не удалось загрузить услуги
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Повторить
                  </Button>
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {debouncedSearch || active !== 'all'
                    ? 'Услуги по вашему запросу не найдены'
                    : 'Услуг пока нет'}
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow
                  key={service.id}
                  data-state={selectedIds.includes(service.id) ? 'selected' : undefined}
                >
                  <TableCell className="px-5 py-4">
                    <Checkbox
                      aria-label={'Выбрать услугу ' + service.name}
                      checked={selectedIds.includes(service.id)}
                      disabled={deleteServices.isPending}
                      onCheckedChange={(checked) =>
                        setSelectedIds((current) =>
                          checked
                            ? [...new Set([...current, service.id])]
                            : current.filter((id) => id !== service.id),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="px-5 py-4 font-semibold">#{service.id}</TableCell>
                  <TableCell className="min-w-48 max-w-80 px-5 py-4 font-medium whitespace-normal break-words">
                    {service.name}
                  </TableCell>
                  <TableCell className="max-w-96 px-5 py-4 whitespace-normal break-words text-muted-foreground">
                    {service.description || '—'}
                  </TableCell>
                  <TableCell className="px-5 py-4 font-medium tabular-nums">
                    {formatPrice(service.price)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge variant={service.is_active ? 'secondary' : 'outline'}>
                      {service.is_active ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link to={PAGES.SERVICE_EDIT(service.id)} />}
                        aria-label={`Редактировать услугу ${service.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        aria-label={'Удалить услугу ' + service.name}
                        disabled={deleteServices.isPending}
                        onClick={() => confirmDelete([service.id])}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isPending && !isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-xs text-muted-foreground">
            <span>
              Показано {services.length} из {data?.meta.total ?? 0} услуг · Страница{' '}
              {data?.meta.current_page ?? 1} из {data?.meta.last_page ?? 1}
            </span>
            <label className="flex items-center gap-2">
              Услуг на странице
              <NativeSelect
                size="sm"
                value={perPage}
                onChange={(event) => {
                  setPerPage(Number(event.target.value) as 10 | 15 | 20);
                  setPage(1);
                  setSelectedIds([]);
                }}
              >
                {[10, 15, 20].map((value) => (
                  <NativeSelectOption key={value} value={value}>
                    {value}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  setPage(page - 1);
                  setSelectedIds([]);
                }}
              >
                Назад
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (data?.meta.last_page ?? 1)}
                onClick={() => {
                  setPage(page + 1);
                  setSelectedIds([]);
                }}
              >
                Далее
              </Button>
            </div>
          </div>
        )}
      </Card>
      <AlertDialog
        open={deletingIds.length > 0}
        onOpenChange={(open) => {
          if (!open && !deleteServices.isPending) setDeletingIds([]);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deletingIds.length === 1
                ? 'Удалить услугу?'
                : 'Удалить выбранные услуги (' + deletingIds.length + ')?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Удаление нельзя отменить. Услуги, используемые в заказах, удалить нельзя — их можно
              деактивировать. Если такая услуга выбрана, удаление целиком отменится.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteServices.isError && (
            <p role="alert" className="text-sm text-destructive">
              {errorCatch(deleteServices.error)}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteServices.isPending}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteServices.isPending}
              onClick={(event) => {
                event.preventDefault();
                deleteServices.mutate(deletingIds);
              }}
            >
              {deleteServices.isPending ? 'Удаляем...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
