import { Pencil } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { ArrowLeft, CalendarDays, Mail, UserRound } from 'lucide-react';
import { useGetClient } from '@/features/clients/hooks/use-get-client';
import { PAGES } from '@/shared/config/pages-url.config';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

import { ClientOrders } from '@/features/orders/components/client-orders';

export function ClientsDetailPage() {
  const { id } = useParams();
  const clientId = Number(id);
  const validId = Number.isInteger(clientId) && clientId > 0;
  const { data: client, isPending, isError, error, refetch } = useGetClient(clientId);

  if (!validId)
    return (
      <div className="space-y-4 p-4">
        <p role="alert">Некорректный номер клиента.</p>
        <Button variant="outline" render={<Link to={PAGES.CLIENTS} />}>
          К списку клиентов
        </Button>
      </div>
    );

  if (isPending)
    return (
      <div role="status" aria-label="Загрузка клиента" className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Skeleton className="h-64 w-full" />
      </div>
    );

  if (isError || !client) {
    const status = error instanceof AxiosError ? error.response?.status : undefined;
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-semibold">
          {status === 404
            ? 'Клиент не найден.'
            : status === 403
              ? 'У вас нет доступа к этому клиенту.'
              : 'Не удалось загрузить клиента.'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link to={PAGES.CLIENTS} />}>
            К списку клиентов
          </Button>
          <Button onClick={() => refetch()}>Повторить</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 md:gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          render={<Link to={PAGES.CLIENTS} />}
          aria-label="Назад к клиентам"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Клиент #{client.id}</h1>
          <p className="text-sm text-muted-foreground">Информация о клиенте</p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="outline" render={<Link to={PAGES.CLIENT_EDIT(client.id)} />}>
          <Pencil className="size-4" />
          Редактировать
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Информация о клиенте</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 space-y-1">
              <p className="text-xs text-muted-foreground">Имя</p>
              <p className="font-medium break-words">{client.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 space-y-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <a href={`mailto:${client.email}`} className="font-medium break-all hover:underline">
                {client.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Дата регистрации</p>
              <p className="font-medium">
                {client.created_at
                  ? new Date(client.created_at).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <ClientOrders clientId={client.id} />
    </div>
  );
}
