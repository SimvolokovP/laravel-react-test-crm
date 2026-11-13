import { z } from 'zod';

export const createClientSchema = (isEdit: boolean) =>
  z
    .object({
      name: z.string().trim().min(1, 'Укажите имя клиента').max(255, 'Максимум 255 символов'),
      email: z.string().trim().email('Укажите корректный email').max(255, 'Максимум 255 символов'),
      password: z
        .string()
        .max(255, 'Максимум 255 символов')
        .refine(
          (value) => (isEdit && value === '') || value.length >= 8,
          'Пароль должен содержать минимум 8 символов',
        ),
      password_confirmation: z.string(),
    })
    .refine((value) => value.password === value.password_confirmation, {
      message: 'Пароли не совпадают',
      path: ['password_confirmation'],
    });

export type ClientFormValues = z.infer<ReturnType<typeof createClientSchema>>;
