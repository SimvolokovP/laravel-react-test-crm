import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Search } from 'lucide-react';
import { useGetClients } from '@/features/clients/hooks/use-get-clients';
import { useNavigate } from 'react-router-dom';
import { PAGES } from '@/shared/config/pages-url.config';
import type { ClientsSort } from '@/features/clients/types/clients.types';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { Card } from '@/shared/components/ui/card';
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

const headers: { label: string; sort: ClientsSort }[] = [
  { label: 'Номер', sort: 'id' },
  { label: 'Имя', sort: 'name' },
  { label: 'Email', sort: 'email' },
  { label: 'Дата регистрации', sort: 'created_at' },
];

export function ClientsIndexPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<10 | 15 | 20>(10);
  const [sort, setSort] = useState<ClientsSort>('id');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const { data, isPending, isError, refetch } = useGetClients({
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    sort,
    direction,
  });
  const clients = data?.data ?? [];

  function changeSort(column: ClientsSort) {
    setDirection(sort === column && direction === 'asc' ? 'desc' : 'asc');
    setSort(column);
    setPage(1);
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
          <div>
            <h2 className="font-semibold">
              Все клиенты{' '}
              <span className="ml-2 text-xs text-muted-foreground">{data?.meta.total ?? 0}</span>
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Клиенты CRM и их контактные данные</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <label className="relative min-w-0 flex-1 sm:w-72">
              <span className="sr-only">Поиск по имени или email</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                maxLength={255}
                placeholder="Имя или email клиента"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </label>
            <Button render={<Link to={PAGES.CLIENT_CREATE} />}>
              <Plus className="size-4" />
              Новый клиент
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {headers.map((header) => (
                <TableHead
                  key={header.sort}
                  className="px-5 py-3"
                  aria-sort={
                    sort === header.sort
                      ? direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3"
                    onClick={() => changeSort(header.sort)}
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
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, row) => (
                <TableRow key={row}>
                  {headers.map((header) => (
                    <TableCell key={header.sort} className="px-5 py-4">
                      <Skeleton className="h-5 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <p role="alert" className="mb-3 text-sm text-destructive">
                    Не удалось загрузить клиентов
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Повторить
                  </Button>
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  {debouncedSearch ? 'Клиенты по вашему запросу не найдены' : 'Клиентов пока нет'}
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  tabIndex={0}
                  role="link"
                  aria-label={`Открыть клиента ${client.name}`}
                  className="cursor-pointer"
                  onClick={() => navigate(PAGES.CLIENT_DETAIL(client.id))}
                  onKeyDown={(event) => {
                    if (event.target === event.currentTarget && event.key === 'Enter')
                      navigate(PAGES.CLIENT_DETAIL(client.id));
                  }}
                >
                  <TableCell className="px-5 py-4 font-semibold">#{client.id}</TableCell>
                  <TableCell className="max-w-72 px-5 py-4 font-medium whitespace-normal break-words">
                    {client.name}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <a
                      href={`mailto:${client.email}`}
                      onClick={(event) => event.stopPropagation()}
                      className="text-muted-foreground hover:underline"
                    >
                      {client.email}
                    </a>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-muted-foreground">
                    {client.created_at
                      ? new Date(client.created_at).toLocaleDateString('ru-RU')
                      : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isPending && !isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              Показано{' '}
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
              клиентов · Страница {data?.meta.current_page ?? 1} из {data?.meta.last_page ?? 1}
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
      </Card>
    </div>
  );
}
