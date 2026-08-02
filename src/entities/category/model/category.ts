import { z } from 'zod';

import { imageSchema, seoDataSchema } from '@/shared/model';

export const categorySchema = z.strictObject({
  childrenCount: z.number(),
  description: z.string().nullable(),
  externalId: z.string().nullable(),
  id: z.string(),
  image: imageSchema.nullable(),
  name: z.string(),
  parentId: z.string().nullable(),
  path: z.string(),
  seo: seoDataSchema,
  slug: z.string(),
  sortOrder: z.number(),
});

export type Category = z.infer<typeof categorySchema>;
