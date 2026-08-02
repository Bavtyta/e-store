import { Badge } from '@/shared/ui';
import type { BadgeTone } from '@/shared/ui';

import type { Availability, AvailabilityStatus } from '../model/product';

const availabilityLabels: Readonly<Record<AvailabilityStatus, string>> = {
  in_stock: 'В наличии',
  low_stock: 'Мало в наличии',
  on_order: 'Под заказ',
  out_of_stock: 'Нет в наличии',
  unknown: 'Наличие уточняется',
};

const availabilityTones: Readonly<Record<AvailabilityStatus, BadgeTone>> = {
  in_stock: 'success',
  low_stock: 'warning',
  on_order: 'warning',
  out_of_stock: 'error',
  unknown: 'neutral',
};

export interface ProductAvailabilityProps {
  availability: Availability;
}

export function ProductAvailability({ availability }: ProductAvailabilityProps) {
  const providedMessage = availability.message?.trim();
  const message =
    providedMessage === undefined || providedMessage.length === 0
      ? availabilityLabels[availability.status]
      : providedMessage;

  return (
    <Badge data-status={availability.status} tone={availabilityTones[availability.status]}>
      {message}
    </Badge>
  );
}
