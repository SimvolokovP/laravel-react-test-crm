import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название услуги').max(255, 'Максимум 255 символов'),
  description: z.string().trim().max(5000, 'Максимум 5000 символов'),
  price: z
    .number({ error: 'Укажите стоимость услуги' })
    .int('Укажите стоимость в целых рублях')
    .min(0, 'Стоимость не может быть отрицательной')
    .max(1000000000, 'Максимальная стоимость — 1 000 000 000 ₽'),
  is_active: z.boolean(),
});
export type ServiceFormValues = z.infer<typeof serviceSchema>;
