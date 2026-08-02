import { categorySchema } from './category';

export function mapCategoryDto(dto: unknown) {
  return categorySchema.safeParse(dto);
}
