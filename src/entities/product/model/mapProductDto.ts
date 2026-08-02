import { productDetailsSchema, productListItemSchema, productVariantSchema } from './product';

export function mapProductListItemDto(dto: unknown) {
  return productListItemSchema.safeParse(dto);
}

export function mapProductDetailsDto(dto: unknown) {
  return productDetailsSchema.safeParse(dto);
}

export function mapProductVariantDto(dto: unknown) {
  return productVariantSchema.safeParse(dto);
}
