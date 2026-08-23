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

export const productPurchaseActionSchema = z.enum(['direct', 'select_variant', 'unavailable']);

const positiveQuantitySchema = z
  .string()
  .regex(
    /^(?:0\.[0-9]*[1-9][0-9]*|[1-9][0-9]*(?:\.[0-9]+)?)$/,
    'Количество должно быть положительным десятичным числом.',
  )
  .refine((value) => Number.isFinite(Number(value)), 'Количество слишком велико.');

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

export const productVariantSchema = z
  .strictObject({
    attributes: z.array(attributeSchema),
    availability: availabilitySchema,
    availableQuantity: z.string().nullable(),
    externalId: z.string().nullable(),
    id: z.string(),
    imageId: z.string().nullable(),
    maxOrderQuantity: positiveQuantitySchema.nullable(),
    minOrderQuantity: positiveQuantitySchema,
    name: z.string(),
    oldPrice: moneySchema.nullable(),
    optionValues: z.array(variantOptionValueSchema),
    packageQuantity: positiveQuantitySchema.nullable(),
    price: moneySchema.nullable(),
    priceType: priceTypeSchema,
    quantityStep: positiveQuantitySchema,
    sku: z.string(),
    unit: productUnitSchema,
  })
  .superRefine((variant, context) => {
    if (variant.priceType === 'on_request' && variant.price !== null) {
      context.addIssue({
        code: 'custom',
        message: 'Цена по запросу не должна содержать числовую цену.',
        path: ['price'],
      });
    }

    if (variant.priceType !== 'on_request' && variant.price === null) {
      context.addIssue({
        code: 'custom',
        message: 'Фиксированная цена или цена «от» требует числовую цену.',
        path: ['price'],
      });
    }

    if (variant.price === null && variant.oldPrice !== null) {
      context.addIssue({
        code: 'custom',
        message: 'Старая цена невозможна без текущей цены.',
        path: ['oldPrice'],
      });
    }

    if (
      variant.packageQuantity !== null &&
      (Number(variant.minOrderQuantity) !== Number(variant.packageQuantity) ||
        Number(variant.quantityStep) !== Number(variant.packageQuantity))
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Упакованный вариант должен заказываться минимум и с шагом одной упаковки.',
        path: ['packageQuantity'],
      });
    }
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
  maxOrderQuantity: positiveQuantitySchema.nullable(),
  minOrderQuantity: positiveQuantitySchema,
  quantityStep: positiveQuantitySchema,
});

export const productListItemSchema = z
  .strictObject({
    addToCartTarget: addToCartTargetSchema.nullable(),
    availability: availabilitySchema,
    badges: z.array(z.string()),
    categoryId: z.string(),
    id: z.string(),
    name: z.string(),
    packagePriceFrom: moneySchema.nullable(),
    packageQuantity: positiveQuantitySchema.nullable(),
    priceFrom: moneySchema.nullable(),
    priceType: priceTypeSchema,
    priceTo: moneySchema.nullable(),
    primaryUnit: productUnitSchema,
    purchaseAction: productPurchaseActionSchema,
    shortAttributes: z.array(attributeSchema),
    slug: z.string(),
    thumbnail: imageSchema.nullable(),
    variantCount: z.number().int().positive(),
    variantSummary: z.string().min(1).max(160).nullable(),
  })
  .superRefine((product, context) => {
    const hasDirectTarget = product.addToCartTarget !== null;

    if (product.purchaseAction === 'direct' && (!hasDirectTarget || product.variantCount !== 1)) {
      context.addIssue({
        code: 'custom',
        message: 'Прямая покупка допустима только для одного однозначного варианта.',
        path: ['purchaseAction'],
      });
    }

    if (product.purchaseAction !== 'direct' && hasDirectTarget) {
      context.addIssue({
        code: 'custom',
        message: 'Цель добавления в корзину допустима только для прямой покупки.',
        path: ['addToCartTarget'],
      });
    }

    if (product.purchaseAction === 'select_variant' && product.variantCount < 2) {
      context.addIssue({
        code: 'custom',
        message: 'Выбор варианта требует как минимум двух вариантов.',
        path: ['variantCount'],
      });
    }

    const isUnavailable = product.purchaseAction === 'unavailable';
    const hasUnavailableStatus = product.availability.status === 'out_of_stock';

    if (isUnavailable !== hasUnavailableStatus) {
      context.addIssue({
        code: 'custom',
        message: 'Действие покупки должно соответствовать агрегированному наличию.',
        path: ['purchaseAction'],
      });
    }

    if (product.variantCount > 1 !== (product.variantSummary !== null)) {
      context.addIssue({
        code: 'custom',
        message: 'Сводка вариантов обязательна только для товаров с несколькими вариантами.',
        path: ['variantSummary'],
      });
    }

    if (product.packagePriceFrom !== null && product.packageQuantity === null) {
      context.addIssue({
        code: 'custom',
        message: 'Цена упаковки требует указанного количества единиц.',
        path: ['packagePriceFrom'],
      });
    }

    if (product.priceType === 'on_request') {
      if (
        product.priceFrom !== null ||
        product.priceTo !== null ||
        product.packagePriceFrom !== null
      ) {
        context.addIssue({
          code: 'custom',
          message: 'Цена по запросу не должна содержать числовые границы.',
          path: ['priceType'],
        });
      }
    } else if (product.priceFrom === null) {
      context.addIssue({
        code: 'custom',
        message: 'Фиксированная цена или цена «от» требует нижней границы.',
        path: ['priceFrom'],
      });
    }

    if (product.priceType === 'fixed' && product.priceTo !== null) {
      context.addIssue({
        code: 'custom',
        message: 'Фиксированная цена не должна содержать верхнюю границу.',
        path: ['priceTo'],
      });
    }

    if (
      product.priceFrom !== null &&
      product.priceTo !== null &&
      product.priceTo.amountMinor < product.priceFrom.amountMinor
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Верхняя граница цены не может быть ниже нижней.',
        path: ['priceTo'],
      });
    }

    if (
      product.packagePriceFrom !== null &&
      product.packageQuantity !== null &&
      product.priceFrom !== null &&
      product.packagePriceFrom.amountMinor !==
        product.priceFrom.amountMinor * Number(product.packageQuantity)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Цена упаковки должна соответствовать цене единицы и размеру упаковки.',
        path: ['packagePriceFrom'],
      });
    }

    if (
      product.purchaseAction !== 'direct' &&
      (product.packageQuantity !== null || product.packagePriceFrom !== null)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Данные упаковки требуют однозначно выбранного варианта.',
        path: ['packageQuantity'],
      });
    }

    if (
      product.packageQuantity !== null &&
      (product.addToCartTarget === null ||
        Number(product.addToCartTarget.minOrderQuantity) !== Number(product.packageQuantity) ||
        Number(product.addToCartTarget.quantityStep) !== Number(product.packageQuantity))
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Товар в упаковке должен добавляться минимально и с шагом одной упаковки.',
        path: ['packageQuantity'],
      });
    }
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
export type ProductPurchaseAction = z.infer<typeof productPurchaseActionSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
export type ProductUnitCode = z.infer<typeof productUnitCodeSchema>;
export type ProductUnit = z.infer<typeof productUnitSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type VariantOptionGroup = z.infer<typeof variantOptionGroupSchema>;
export type VariantOptionValue = z.infer<typeof variantOptionValueSchema>;
