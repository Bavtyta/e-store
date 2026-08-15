import { z } from 'zod';

import { imageSchema, moneySchema, seoDataSchema } from '@/shared/model';

export const categoryReferenceSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  path: z.string(),
});

export const priceTypeSchema = z.enum(['fixed', 'from', 'on_request']);

export const availabilityStatusSchema = z.enum([
  'in_stock',
  'low_stock',
  'out_of_stock',
  'on_order',
  'unknown',
]);

export const productUnitCodeSchema = z.enum([
  'piece',
  'meter',
  'kilogram',
  'roll',
  'set',
  'package',
]);

export const productStatusSchema = z.literal('active');

export const attributeValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const availabilitySchema = z.strictObject({
  message: z.string().nullable(),
  status: availabilityStatusSchema,
});

export const productUnitSchema = z.strictObject({
  code: productUnitCodeSchema,
  label: z.string(),
});

export const attributeSchema = z.strictObject({
  code: z.string(),
  group: z.string().nullable(),
  name: z.string(),
  sortOrder: z.number(),
  unit: z.string().nullable(),
  value: attributeValueSchema,
});

export const variantOptionValueSchema = z.strictObject({
  code: z.string(),
  label: z.string(),
  value: z.string(),
});

export const variantOptionGroupSchema = z.strictObject({
  code: z.string(),
  name: z.string(),
  sortOrder: z.number(),
  values: z.array(variantOptionValueSchema),
});

export const productVariantSchema = z.strictObject({
  attributes: z.array(attributeSchema),
  availability: availabilitySchema,
  availableQuantity: z.string().nullable(),
  externalId: z.string().nullable(),
  id: z.string(),
  imageId: z.string().nullable(),
  maxOrderQuantity: z.string().nullable(),
  minOrderQuantity: z.string(),
  name: z.string(),
  oldPrice: moneySchema.nullable(),
  optionValues: z.array(variantOptionValueSchema),
  packageQuantity: z.string().nullable(),
  price: moneySchema.nullable(),
  priceType: priceTypeSchema,
  quantityStep: z.string(),
  sku: z.string(),
  unit: productUnitSchema,
});

export const cartProductReferenceSchema = z.strictObject({
  id: z.string(),
  image: imageSchema.nullable(),
  name: z.string(),
  slug: z.string(),
});

export const cartResolvedVariantSchema = z.strictObject({
  product: cartProductReferenceSchema,
  variant: productVariantSchema,
});

export const addToCartTargetSchema = z.strictObject({
  id: z.string(),
  maxOrderQuantity: z.string().nullable(),
  minOrderQuantity: z.string(),
  quantityStep: z.string(),
});

export const productListItemSchema = z.strictObject({
  addToCartTarget: addToCartTargetSchema.nullable(),
  availability: availabilitySchema,
  badges: z.array(z.string()),
  categoryId: z.string(),
  id: z.string(),
  name: z.string(),
  priceFrom: moneySchema.nullable(),
  priceTo: moneySchema.nullable(),
  primaryUnit: productUnitSchema.nullable(),
  shortAttributes: z.array(attributeSchema),
  slug: z.string(),
  thumbnail: imageSchema.nullable(),
});

export const productDetailsSchema = z.strictObject({
  attributes: z.array(attributeSchema),
  category: categoryReferenceSchema,
  createdAt: z.string(),
  description: z.string().nullable(),
  externalId: z.string().nullable(),
  id: z.string(),
  images: z.array(imageSchema),
  name: z.string(),
  optionGroups: z.array(variantOptionGroupSchema),
  seo: seoDataSchema,
  slug: z.string(),
  status: productStatusSchema,
  updatedAt: z.string(),
  variants: z.array(productVariantSchema),
});

export type AttributeValue = z.infer<typeof attributeValueSchema>;
export type Attribute = z.infer<typeof attributeSchema>;
export type AddToCartTarget = z.infer<typeof addToCartTargetSchema>;
export type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type CartProductReference = z.infer<typeof cartProductReferenceSchema>;
export type CartResolvedVariant = z.infer<typeof cartResolvedVariantSchema>;
export type CategoryReference = z.infer<typeof categoryReferenceSchema>;
export type PriceType = z.infer<typeof priceTypeSchema>;
export type ProductDetails = z.infer<typeof productDetailsSchema>;
export type ProductListItem = z.infer<typeof productListItemSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
export type ProductUnitCode = z.infer<typeof productUnitCodeSchema>;
export type ProductUnit = z.infer<typeof productUnitSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type VariantOptionGroup = z.infer<typeof variantOptionGroupSchema>;
export type VariantOptionValue = z.infer<typeof variantOptionValueSchema>;
