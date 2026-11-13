import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGetClient } from '@/features/clients/hooks/use-get-client';
import { useCreateClient } from '@/features/clients/hooks/use-create-client';
import { useUpdateClient } from '@/features/clients/hooks/use-update-client';
import {
  createClientSchema,
  type ClientFormValues,
} from '@/features/clients/schemas/client.schema';
import type { Client, SaveClientPayload } from '@/features/clients/types/clients.types';
import { PAGES } from '@/shared/config/pages-url.config';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function ClientsFormPage() {
  const { id } = useParams();
  const clientId = Number(id);
  const query = useGetClient(clientId);
  if (!id) return <ClientForm key="create" />;
  if (!Number.isInteger(clientId) || clientId <= 0)
    return (
      <p role="alert" className="p-4 text-destructive">
        Некорректный номер клиента
      </p>
    );
  if (query.isPending)
    return (
      <div role="status" aria-label="Загрузка формы клиента" className="space-y-6 p-4">
        <Skeleton className="h-9 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  if (query.isError || !query.data)
    return (
      <div className="space-y-4 p-4">
        <p role="alert">Не удалось загрузить клиента</p>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link to={PAGES.CLIENTS} />}>
            К списку клиентов
          </Button>
          <Button onClick={() => query.refetch()}>Повторить</Button>
        </div>
      </div>
    );
  return <ClientForm key={clientId} client={query.data} />;
}

function ClientForm({ client }: { client?: Client }) {
  const navigate = useNavigate();
  const isEdit = Boolean(client);
  const onSaved = (saved: Client) => {
    toast.success(isEdit ? 'Изменения сохранены' : 'Клиент создан');
    navigate(PAGES.CLIENT_DETAIL(saved.id), { replace: true });
  };
  const createMutation = useCreateClient({
    onSuccess: onSaved,
    onError: (message) => toast.error(message),
  });
  const updateMutation = useUpdateClient({
    onSuccess: onSaved,
    onError: (message) => toast.error(message),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(createClientSchema(isEdit)),
    defaultValues: {
      name: client?.name ?? '',
      email: client?.email ?? '',
      password: '',
      password_confirmation: '',
    },
    mode: 'onChange',
  });
  const mutation = isEdit ? updateMutation : createMutation;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const serverErrors =
    mutation.error instanceof AxiosError && mutation.error.response?.status === 422
      ? (mutation.error.response.data?.errors as Record<string, string[]>)
      : undefined;
  function onSubmit(values: ClientFormValues) {
    const payload: SaveClientPayload = {
      name: values.name,
      email: values.email,
      ...(values.password
        ? { password: values.password, password_confirmation: values.password_confirmation }
        : {}),
    };
    if (client) updateMutation.mutate({ id: client.id, data: payload });
    else createMutation.mutate(payload);
  }
  const back = client ? PAGES.CLIENT_DETAIL(client.id) : PAGES.CLIENTS;
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" render={<Link to={back} />} aria-label="Назад">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {client ? `Редактирование клиента №${client.id}` : 'Новый клиент'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Измените данные клиента' : 'Заполните данные для создания клиента'}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Информация о клиенте</CardTitle>
            <CardDescription>
              {isEdit
                ? 'Оставьте пароль пустым, чтобы сохранить текущий.'
                : 'Клиент сможет войти по указанным email и паролю.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {(
              [
                { name: 'name', label: 'Имя', type: 'text', autoComplete: 'name' },
                { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
                {
                  name: 'password',
                  label: isEdit ? 'Новый пароль' : 'Пароль',
                  type: 'password',
                  autoComplete: 'new-password',
                },
                {
                  name: 'password_confirmation',
                  label: 'Подтверждение пароля',
                  type: 'password',
                  autoComplete: 'new-password',
                },
              ] as const
            ).map((field) => {
              const message = errors[field.name]?.message ?? serverErrors?.[field.name]?.[0];
              return (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={field.name} className="text-sm font-medium">
                    {field.label}
                  </label>
                  <Input
                    id={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    {...register(field.name)}
                    disabled={isSaving}
                    aria-invalid={Boolean(message)}
                    aria-describedby={message ? `${field.name}-error` : undefined}
                  />
                  {message && (
                    <p id={`${field.name}-error`} role="alert" className="text-sm text-destructive">
                      {message}
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={isSaving} render={<Link to={back} />}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Сохранить изменения' : 'Создать клиента'}
          </Button>
        </div>
      </form>
    </div>
  );
}
