import { isAxiosError } from 'axios';
export interface BackendErrorData {
  message?: string;
  errors?: Record<string, string[]>;
}
export function errorCatch(error: unknown): string {
  if (!isAxiosError<BackendErrorData>(error))
    return 'Не удалось выполнить действие. Попробуйте ещё раз.';
  if (!error.response) return 'Нет связи с сервером. Проверьте подключение.';
  const { status, data } = error.response;
  if (status === 422)
    return (
      Object.values(data?.errors ?? {}).flat()[0] ?? data?.message ?? 'Проверьте введённые данные.'
    );
  if (status === 401) return 'Необходимо войти в аккаунт.';
  if (status === 403) return 'Недостаточно прав для выполнения действия.';
  if (status === 404) return 'Запись не найдена.';
  if (status === 419) return 'Сессия истекла. Обновите страницу.';
  if (status >= 500) return 'Ошибка сервера. Попробуйте позже.';
  return data?.message ?? 'Не удалось выполнить действие.';
}
