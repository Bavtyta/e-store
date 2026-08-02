import { formatMoney } from '@/shared/model';
import type { Money } from '@/shared/model';

import type { PriceType } from './product';

const MISSING_PRICE_LABEL = 'Цена не указана';
const ON_REQUEST_PRICE_LABEL = 'Цена по запросу';

export function formatProductPrice(price: Money | null, priceType: PriceType): string {
  if (priceType === 'on_request') {
    return ON_REQUEST_PRICE_LABEL;
  }

  if (price === null) {
    return MISSING_PRICE_LABEL;
  }

  const formattedPrice = formatMoney(price);

  return priceType === 'from' ? `от ${formattedPrice}` : formattedPrice;
}
