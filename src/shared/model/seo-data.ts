import { z } from 'zod';

export const seoDataSchema = z.strictObject({
  canonicalUrl: z.string().nullable(),
  description: z.string().nullable(),
  indexable: z.boolean(),
  title: z.string().nullable(),
});

export type SeoData = z.infer<typeof seoDataSchema>;
