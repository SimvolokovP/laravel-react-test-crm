import { OrderFormSkeleton, ServicesSkeleton } from '@/features/orders/components/order-skeletons';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PAGES } from '@/shared/config/pages-url.config';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { NativeSelect, NativeSelectOption } from '@/shared/components/ui/native-select';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useGetOrder } from '@/features/orders/hooks/use-get-order';
import { useGetOrdersClients } from '@/features/orders/hooks/use-get-order-clients';
import { useGetServices } from '@/features/orders/hooks/use-get-services';
import { useCreateOrder } from '@/features/orders/hooks/use-create-order';
import { useUpdateOrder } from '@/features/orders/hooks/use-update-order';
import type { Order, UpdateOrderPayload } from '@/features/orders/types/orders.types';
import { createOrderSchema, type OrderFormValues } from '@/features/orders/schemas/order.schema';
import { formatPrice } from '@/shared/helpers/format-price';

export function OrdersFormPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = id ? Number(id) : 0;

  const orderQuery = useGetOrder(orderId);

  if (!id) {
    return <OrderForm key="create" />;
  }

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return <p className="p-6 text-destructive">Некорректный номер заказа</p>;
  }

  if (orderQuery.isPending) {
    return <OrderFormSkeleton />;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="space-y-4 p-6">
        <p role="alert">Не удалось загрузить заказ</p>
        <Button variant="outline" onClick={() => void orderQuery.refetch()}>
          Повторить
        </Button>
      </div>
    );
  }

  return <OrderForm key={orderId} order={orderQuery.data} />;
}

function OrderForm({ order }: { order?: Order }) {
  const navigate = useNavigate();

  const { data: authData } = useAuth();
  const isAdmin = authData?.user.role === 'admin';
  const isEdit = Boolean(order);

  const clientsQuery = useGetOrdersClients(isAdmin);
  const servicesQuery = useGetServices();

  const onSaved = (saved: Order) => {
    toast.success(isEdit ? 'Изменения сохранены' : 'Заказ создан');
    navigate(PAGES.ORDER_DETAIL(saved.id), { replace: true });
  };

  const createMutation = useCreateOrder({
    onSuccess: onSaved,
    onError: (message) => toast.error(message),
  });

  const updateMutation = useUpdateOrder({
    onSuccess: onSaved,
    onError: (message) => toast.error(message),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(createOrderSchema(isAdmin, isEdit)),
    defaultValues: {
      user_id: order?.client.id,
      status: order?.status ?? 'new',
      service_ids: order?.services.map((service) => service.id) ?? [],
    },
    mode: 'onChange',
  });

  const selectedServices =
    useWatch({
      control,
      name: 'service_ids',
    }) ?? [];

  const services = servicesQuery.data ?? [];
  const clients = clientsQuery.data ?? [];

  const total = services
    .filter((service) => selectedServices.includes(service.id))
    .reduce((sum, service) => sum + Number(service.price), 0);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: OrderFormValues) {
    if (isEdit && !isAdmin) {
      toast.error('Редактирование доступно только администратору');
      return;
    }

    const payload: UpdateOrderPayload = {
      ...(isAdmin ? { user_id: values.user_id } : {}),
      ...(isAdmin && isEdit ? { status: values.status } : {}),
      service_ids: values.service_ids,
    };

    if (order) {
      updateMutation.mutate({
        id: order.id,
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  }

  const mutationError = isEdit ? updateMutation.error : createMutation.error;

  const validationErrors =
    mutationError instanceof AxiosError && mutationError.response?.status === 422
      ? (mutationError.response.data?.errors as Record<string, string[]>)
      : null;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          render={<Link to={PAGES.ORDERS} />}
          aria-label="Назад к заказам"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {order ? `Редактирование заказа №${order.id}` : 'Новый заказ'}
          </h1>

          <p className="text-sm text-muted-foreground">
            {order ? 'Измените клиента, статус и состав услуг' : 'Выберите услуги и оформите заказ'}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Информация о заказе</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {isAdmin && isEdit && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label htmlFor="order-status" className="text-sm font-medium">
                      Статус
                    </label>

                    <NativeSelect
                      id="order-status"
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isSaving}
                      aria-invalid={!!errors.status}
                    >
                      <NativeSelectOption value="new">Новый</NativeSelectOption>
                      <NativeSelectOption value="in_progress">В работе</NativeSelectOption>
                      <NativeSelectOption value="completed">Завершён</NativeSelectOption>
                      <NativeSelectOption value="cancelled">Отменён</NativeSelectOption>
                    </NativeSelect>

                    {(errors.status || validationErrors?.status) && (
                      <p className="text-sm text-destructive">
                        {errors.status?.message ?? validationErrors?.status?.[0]}
                      </p>
                    )}
                  </div>
                )}
              />
            )}

            {isAdmin ? (
              clientsQuery.isPending ? (
                <div role="status" aria-label="Загрузка клиентов" className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ) : (
                <Controller
                  name="user_id"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label htmlFor="client" className="text-sm font-medium">
                        Клиент
                      </label>

                      <NativeSelect
                        id="client"
                        name={field.name}
                        ref={field.ref}
                        value={field.value === undefined ? '' : String(field.value)}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value ? Number(event.target.value) : undefined,
                          )
                        }
                        onBlur={field.onBlur}
                        disabled={isSaving || clientsQuery.isPending || clientsQuery.isError}
                        aria-invalid={!!errors.user_id}
                      >
                        <NativeSelectOption value="">Выберите клиента</NativeSelectOption>

                        {clients.map((client) => (
                          <NativeSelectOption key={client.id} value={String(client.id)}>
                            {client.name} — {client.email}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>

                      {(errors.user_id || validationErrors?.user_id) && (
                        <p className="text-sm text-destructive">
                          {errors.user_id?.message ?? validationErrors?.user_id?.[0]}
                        </p>
                      )}

                      {clientsQuery.isError && (
                        <p className="text-sm text-destructive">Не удалось загрузить клиентов</p>
                      )}
                    </div>
                  )}
                />
              )
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium">Клиент</p>
                <p className="text-sm text-muted-foreground">{authData?.user.name}</p>
              </div>
            )}

            <Controller
              name="service_ids"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium">Услуги</h3>
                    <p className="text-xs text-muted-foreground">Можно выбрать несколько услуг</p>
                  </div>

                  {servicesQuery.isPending ? (
                    <ServicesSkeleton />
                  ) : servicesQuery.isError ? (
                    <p className="text-sm text-destructive">Не удалось загрузить услуги</p>
                  ) : services.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Доступных услуг пока нет</p>
                  ) : (
                    <div className="divide-y rounded-lg border">
                      {services.map((service) => {
                        const checked = field.value.includes(service.id);

                        return (
                          <label
                            key={service.id}
                            className="flex cursor-pointer items-center gap-3 p-4 hover:bg-muted/40"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                field.onChange(
                                  value === true
                                    ? [...field.value, service.id]
                                    : field.value.filter((id) => id !== service.id),
                                );
                              }}
                              disabled={isSaving}
                            />

                            <span className="min-w-0 flex-1 text-sm">{service.name}</span>

                            <span className="shrink-0 text-sm font-medium tabular-nums">
                              {formatPrice(service.price)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {(errors.service_ids || validationErrors?.service_ids) && (
                    <p className="text-sm text-destructive">
                      {errors.service_ids?.message ?? validationErrors?.service_ids?.[0]}
                    </p>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Итого</p>
              <p className="text-2xl font-semibold tabular-nums">{formatPrice(total)}</p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" render={<Link to={PAGES.ORDERS} />}>
                Отмена
              </Button>

              <Button
                type="submit"
                disabled={
                  isSaving ||
                  servicesQuery.isPending ||
                  servicesQuery.isError ||
                  services.length === 0 ||
                  (isAdmin && (clientsQuery.isPending || clientsQuery.isError))
                }
              >
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? 'Сохранить изменения' : 'Создать заказ'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {(createMutation.isError || updateMutation.isError) && (
          <p role="alert" className="text-sm text-destructive lg:col-span-2">
            Не удалось сохранить заказ. Проверьте данные и попробуйте снова.
          </p>
        )}
      </form>
    </div>
  );
}
