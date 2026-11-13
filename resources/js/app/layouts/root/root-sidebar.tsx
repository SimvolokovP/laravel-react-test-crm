import { toast } from 'sonner';
import { PAGES } from '@/shared/config/pages-url.config';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CircleFadingPlus, ClipboardList, UserRound, UsersRound, LogOut } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/components/ui/sidebar';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';

import { Button } from '@/shared/components/ui/button';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useLogout } from '@/features/auth/hooks/use-logout';

export function RootSidebar() {
  const { setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { data } = useAuth();
  const logout = useLogout({
    onSuccess: () => {
      setOpenMobile(false);
      navigate(PAGES.LOGIN, { replace: true });
    },
    onError: (message) => toast.error(message),
  });

  const user = data?.user;
  const isAdmin = user?.role === 'admin';
  const items = [
    ...(!isAdmin ? [{ title: 'Личный кабинет', url: PAGES.PROFILE, icon: UserRound }] : []),
    { title: 'Заказы', url: isAdmin ? PAGES.ADMIN_ORDERS : PAGES.ORDERS, icon: ClipboardList },
    ...(isAdmin ? [{ title: 'Клиенты', url: PAGES.CLIENTS, icon: UsersRound }] : []),
  ];

  const initials =
    user?.name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? '?';

  function handleLogout() {
    logout.mutate();
  }

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to={PAGES.MAIN} />}
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              onClick={() => setOpenMobile(false)}
            >
              <CircleFadingPlus className="size-5!" />
              <span className="text-base font-semibold">TEST CRM</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {items.map(({ title, url, icon: Icon }) => (
                <SidebarMenuItem key={url}>
                  <SidebarMenuButton
                    isActive={
                      pathname === url || (url === PAGES.ADMIN_ORDERS && pathname === PAGES.ORDERS)
                    }
                    render={<NavLink to={url} />}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Icon />
                    <span>{title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-lg p-2">
          <Link
            to={isAdmin ? PAGES.ADMIN_ORDERS : PAGES.PROFILE}
            onClick={() => setOpenMobile(false)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-md outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <Avatar className="size-9 rounded-lg">
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>

            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.name ?? 'Пользователь'}</span>
              <span className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</span>
            </div>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Выйти из аккаунта"
                />
              }
            >
              <LogOut className="size-4" />
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Выйти из аккаунта?</AlertDialogTitle>

                <AlertDialogDescription>
                  Вы завершите текущую сессию. Для повторного входа потребуется указать email и
                  пароль.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {logout.isError && (
                <p role="alert" className="text-sm text-destructive">
                  Не удалось выйти из аккаунта. Попробуйте ещё раз.
                </p>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={logout.isPending}>Отмена</AlertDialogCancel>

                <AlertDialogAction
                  disabled={logout.isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    void handleLogout();
                  }}
                >
                  {logout.isPending ? 'Выходим...' : 'Выйти'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
