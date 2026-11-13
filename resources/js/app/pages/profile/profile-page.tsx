import { Mail, Pencil, UserRound } from 'lucide-react';

import { useAuth } from '@/features/auth/hooks/use-auth';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ProfileField } from '@/features/auth/components/profile-field';

export function ProfilePage() {
  const { data, isPending, isError, refetch } = useAuth();

  const user = data?.user;

  if (isPending) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <Card className="gap-0 overflow-hidden py-0">
          <div className="space-y-4 p-5">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-64" />
          </div>

          <CardContent className="space-y-4 p-5">
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="p-5">
          <p role="alert" className="text-sm text-destructive">
            Не удалось загрузить профиль
          </p>

          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Повторить
          </Button>
        </Card>
      </div>
    );
  }

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
          <div>
            <h2 className="font-semibold">Мой профиль</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Личная информация и настройки аккаунта
            </p>
          </div>

          <Button variant="outline" size="sm" disabled>
            <Pencil className="size-4" />
            Редактировать
          </Button>
        </div>

        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-4 border-b pb-6">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
              {initials || <UserRound className="size-7" />}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{user.name}</h3>
            </div>
          </div>

          <div className="grid gap-6 py-6 sm:grid-cols-2">
            <ProfileField icon={UserRound} label="Полное имя" value={user.name} />

            <ProfileField icon={Mail} label="Электронная почта" value={user.email} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
