import { z } from 'zod';

export const createOrderSchema = (isAdmin: boolean, isEdit: boolean) =>
  z
    .object({
      user_id: z.number().int().positive().optional(),

      status: z.enum(['new', 'in_progress', 'completed', 'cancelled']),

      service_ids: z.array(z.number().int().positive()).min(1, 'Выберите хотя бы одну услугу'),
    })
    .superRefine((values, ctx) => {
      if (isAdmin && !values.user_id) {
        ctx.addIssue({
          code: 'custom',
          path: ['user_id'],
          message: 'Выберите клиента',
        });
      }

      if (!isAdmin && isEdit) {
        ctx.addIssue({
          code: 'custom',
          message: 'Редактирование доступно только администратору',
        });
      }
    });

export type OrderFormValues = z.infer<ReturnType<typeof createOrderSchema>>;
