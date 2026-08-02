import { z } from 'zod';

import { categorySchema } from '../model/category';

export const categoryListSchema = z.array(categorySchema);

export type CategoryList = z.infer<typeof categoryListSchema>;

export function mapCategoryListDto(dto: unknown) {
  return categoryListSchema.safeParse(dto);
}
