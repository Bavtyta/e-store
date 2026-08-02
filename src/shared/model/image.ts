import { z } from 'zod';

export const imageSchema = z.strictObject({
  alt: z.string(),
  height: z.number().nullable(),
  id: z.string(),
  sortOrder: z.number(),
  url: z.string(),
  width: z.number().nullable(),
});

export type Image = z.infer<typeof imageSchema>;
