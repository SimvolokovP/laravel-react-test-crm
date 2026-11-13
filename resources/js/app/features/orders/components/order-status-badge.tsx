import { Badge } from '@/shared/components/ui/badge';

import type { OrderStatus } from '@/features/orders/types/orders.types';

const statusVariants: Record<OrderStatus, { label: string; className: string }> = {
  new: {
    label: 'Новый',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  in_progress: {
    label: 'В работе',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  completed: {
    label: 'Завершён',
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  cancelled: {
    label: 'Отменён',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusVariants[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
