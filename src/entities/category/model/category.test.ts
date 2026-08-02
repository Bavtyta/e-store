import { categorySchema, mapCategoryDto } from '@/entities/category';
import type { Category } from '@/entities/category';

function createCategoryDto(): Category {
  return {
    childrenCount: 0,
    description: null,
    externalId: null,
    id: 'category-1',
    image: null,
    name: 'Тестовая категория',
    parentId: null,
    path: '/catalog/test-category',
    seo: {
      canonicalUrl: null,
      description: null,
      indexable: true,
      title: null,
    },
    slug: 'test-category',
    sortOrder: 0,
  };
}

describe('Category model', () => {
  it('validates and maps a correct category DTO', () => {
    const dto = createCategoryDto();

    expect(categorySchema.safeParse(dto).success).toBe(true);

    const result = mapCategoryDto(dto);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(dto);
    }
  });

  it('rejects an unknown field without throwing', () => {
    const invalidDto = {
      ...createCategoryDto(),
      unexpectedField: true,
    };

    expect(() => mapCategoryDto(invalidDto)).not.toThrow();
    expect(mapCategoryDto(invalidDto).success).toBe(false);
  });
});
