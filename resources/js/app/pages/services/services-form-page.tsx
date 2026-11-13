import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGetService } from '@/features/services/hooks/use-get-service';
import { useCreateService } from '@/features/services/hooks/use-create-service';
import { useUpdateService } from '@/features/services/hooks/use-update-service';
import { serviceSchema, type ServiceFormValues } from '@/features/services/schemas/service.schema';
import type { Service } from '@/features/services/types/services.types';
import { PAGES } from '@/shared/config/pages-url.config';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function ServicesFormPage() {
  const { id } = useParams();
  const serviceId = Number(id);
  const query = useGetService(serviceId);
  if (!id) return <ServiceForm key="create" />;
  if (!Number.isInteger(serviceId) || serviceId <= 0)
    return (
      <p role="alert" className="p-4 text-destructive">
        Некорректный номер услуги
      </p>
    );
  if (query.isPending)
    return (
      <div role="status" aria-label="Загрузка формы услуги" className="space-y-6 p-4">
        <Skeleton className="h-9 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-5">
            {[0, 1].map((item) => (
              <div key={item} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  if (query.isError || !query.data)
    return (
      <div className="space-y-4 p-4">
        <p role="alert">
          {query.error instanceof AxiosError && query.error.response?.status === 404
            ? 'Услуга не найдена'
            : 'Не удалось загрузить услугу'}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link to={PAGES.SERVICES} />}>
            К списку услуг
          </Button>
          <Button onClick={() => query.refetch()}>Повторить</Button>
        </div>
      </div>
    );
  return <ServiceForm key={serviceId} service={query.data} />;
}

function ServiceForm({ service }: { service?: Service }) {
  const navigate = useNavigate();
  const onSaved = () => {
    toast.success(service ? 'Изменения сохранены' : 'Услуга создана');
    navigate(PAGES.SERVICES, { replace: true });
  };
  const createMutation = useCreateService({
    onSuccess: onSaved,
    onError: (message) => toast.error(message),
  });
  const updateMutation = useUpdateService({
    onSuccess: onSaved,
    onError: (message) => toast.error(message),
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name ?? '',
      description: service?.description ?? '',
      price: service?.price ?? 0,
      is_active: service?.is_active ?? true,
    },
    mode: 'onChange',
  });
  const mutation = service ? updateMutation : createMutation;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const serverErrors =
    mutation.error instanceof AxiosError && mutation.error.response?.status === 422
      ? (mutation.error.response.data?.errors as Record<string, string[]>)
      : undefined;
  function onSubmit(values: ServiceFormValues) {
    const payload = { ...values, description: values.description || null };
    if (service) updateMutation.mutate({ id: service.id, data: payload });
    else createMutation.mutate(payload);
  }
  function fieldError(field: keyof ServiceFormValues) {
    const message = errors[field]?.message ?? serverErrors?.[field]?.[0];
    return message ? (
      <p id={`${field}-error`} role="alert" className="text-sm text-destructive">
        {message}
      </p>
    ) : null;
  }
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          render={<Link to={PAGES.SERVICES} />}
          aria-label="Назад к услугам"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {service ? `Редактирование услуги №${service.id}` : 'Новая услуга'}
          </h1>
          <p className="text-sm text-muted-foreground">Название, стоимость и доступность услуги</p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Информация об услуге</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Название
                </label>
                <Input
                  id="name"
                  {...register('name')}
                  disabled={isSaving}
                  aria-invalid={Boolean(errors.name || serverErrors?.name)}
                  aria-describedby="name-error"
                />
                {fieldError('name')}
              </div>
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Стоимость, ₽
                </label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  max="1000000000"
                  step="1"
                  {...register('price', { valueAsNumber: true })}
                  disabled={isSaving}
                  aria-invalid={Boolean(errors.price || serverErrors?.price)}
                  aria-describedby="price-error"
                />
                {fieldError('price')}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Описание
              </label>
              <Textarea
                id="description"
                rows={4}
                {...register('description')}
                disabled={isSaving}
                aria-invalid={Boolean(errors.description || serverErrors?.description)}
                aria-describedby="description-error"
              />
              {fieldError('description')}
            </div>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="is_active"
                      checked={field.value}
                      onCheckedChange={(value) => field.onChange(value === true)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      disabled={isSaving}
                      aria-describedby="is_active-error"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium">
                      Активна
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Активные услуги доступны для выбора при оформлении заказа.
                  </p>
                  {fieldError('is_active')}
                </div>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            render={<Link to={PAGES.SERVICES} />}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {service ? 'Сохранить изменения' : 'Создать услугу'}
          </Button>
        </div>
      </form>
    </div>
  );
}
