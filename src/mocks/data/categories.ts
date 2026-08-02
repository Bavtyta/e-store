import type { Category } from '@/entities/category';

interface CategorySeed {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  slug: string;
  sortOrder: number;
}

export const CATEGORY_IDS = {
  adapters: 'category-adapters',
  caps: 'category-caps',
  chambers: 'category-chambers',
  couplings: 'category-couplings',
  elbows: 'category-elbows',
  fittings: 'category-fittings',
  gaskets: 'category-gaskets',
  hoses: 'category-hoses',
  manzhets: 'category-manzhets',
  metalPipes: 'category-metal-pipes',
  pndPipes: 'category-pnd-pipes',
  polypropylenePipes: 'category-polypropylene-pipes',
  pvcPipes: 'category-pvc-pipes',
  related: 'category-related',
  rubber: 'category-rubber',
  seals: 'category-seals',
  tees: 'category-tees',
  pipes: 'category-pipes',
} as const;

const categorySeeds: readonly CategorySeed[] = [
  {
    id: CATEGORY_IDS.pipes,
    name: 'Трубы',
    parentId: null,
    path: '/catalog/truby',
    slug: 'truby',
    sortOrder: 10,
  },
  {
    id: CATEGORY_IDS.pndPipes,
    name: 'ПНД',
    parentId: CATEGORY_IDS.pipes,
    path: '/catalog/truby/pnd',
    slug: 'pnd',
    sortOrder: 10,
  },
  {
    id: CATEGORY_IDS.pvcPipes,
    name: 'ПВХ',
    parentId: CATEGORY_IDS.pipes,
    path: '/catalog/truby/pvh',
    slug: 'pvh',
    sortOrder: 20,
  },
  {
    id: CATEGORY_IDS.polypropylenePipes,
    name: 'Полипропиленовые',
    parentId: CATEGORY_IDS.pipes,
    path: '/catalog/truby/polipropilenovye',
    slug: 'polipropilenovye',
    sortOrder: 30,
  },
  {
    id: CATEGORY_IDS.metalPipes,
    name: 'Металлические',
    parentId: CATEGORY_IDS.pipes,
    path: '/catalog/truby/metallicheskie',
    slug: 'metallicheskie',
    sortOrder: 40,
  },
  {
    id: CATEGORY_IDS.fittings,
    name: 'Фитинги и соединения',
    parentId: null,
    path: '/catalog/fitingi-i-soedineniya',
    slug: 'fitingi-i-soedineniya',
    sortOrder: 20,
  },
  {
    id: CATEGORY_IDS.couplings,
    name: 'Муфты',
    parentId: CATEGORY_IDS.fittings,
    path: '/catalog/fitingi-i-soedineniya/mufty',
    slug: 'mufty',
    sortOrder: 10,
  },
  {
    id: CATEGORY_IDS.elbows,
    name: 'Угольники',
    parentId: CATEGORY_IDS.fittings,
    path: '/catalog/fitingi-i-soedineniya/ugolniki',
    slug: 'ugolniki',
    sortOrder: 20,
  },
  {
    id: CATEGORY_IDS.tees,
    name: 'Тройники',
    parentId: CATEGORY_IDS.fittings,
    path: '/catalog/fitingi-i-soedineniya/troyniki',
    slug: 'troyniki',
    sortOrder: 30,
  },
  {
    id: CATEGORY_IDS.adapters,
    name: 'Переходники',
    parentId: CATEGORY_IDS.fittings,
    path: '/catalog/fitingi-i-soedineniya/perehodniki',
    slug: 'perehodniki',
    sortOrder: 40,
  },
  {
    id: CATEGORY_IDS.caps,
    name: 'Заглушки',
    parentId: CATEGORY_IDS.fittings,
    path: '/catalog/fitingi-i-soedineniya/zaglushki',
    slug: 'zaglushki',
    sortOrder: 50,
  },
  {
    id: CATEGORY_IDS.rubber,
    name: 'Резинотехнические изделия',
    parentId: null,
    path: '/catalog/rezinotehnicheskie-izdeliya',
    slug: 'rezinotehnicheskie-izdeliya',
    sortOrder: 30,
  },
  {
    id: CATEGORY_IDS.seals,
    name: 'Уплотнители',
    parentId: CATEGORY_IDS.rubber,
    path: '/catalog/rezinotehnicheskie-izdeliya/uplotniteli',
    slug: 'uplotniteli',
    sortOrder: 10,
  },
  {
    id: CATEGORY_IDS.manzhets,
    name: 'Манжеты',
    parentId: CATEGORY_IDS.rubber,
    path: '/catalog/rezinotehnicheskie-izdeliya/manzhety',
    slug: 'manzhety',
    sortOrder: 20,
  },
  {
    id: CATEGORY_IDS.gaskets,
    name: 'Прокладки',
    parentId: CATEGORY_IDS.rubber,
    path: '/catalog/rezinotehnicheskie-izdeliya/prokladki',
    slug: 'prokladki',
    sortOrder: 30,
  },
  {
    id: CATEGORY_IDS.hoses,
    name: 'Шланги',
    parentId: CATEGORY_IDS.rubber,
    path: '/catalog/rezinotehnicheskie-izdeliya/shlangi',
    slug: 'shlangi',
    sortOrder: 40,
  },
  {
    id: CATEGORY_IDS.chambers,
    name: 'Камеры',
    parentId: null,
    path: '/catalog/kamery',
    slug: 'kamery',
    sortOrder: 40,
  },
  {
    id: CATEGORY_IDS.related,
    name: 'Сопутствующие товары',
    parentId: null,
    path: '/catalog/soputstvuyushchie-tovary',
    slug: 'soputstvuyushchie-tovary',
    sortOrder: 50,
  },
];

function createCategory(seed: CategorySeed): Category {
  const childrenCount = categorySeeds.filter((candidate) => candidate.parentId === seed.id).length;

  return {
    childrenCount,
    description: null,
    externalId: null,
    id: seed.id,
    image: null,
    name: seed.name,
    parentId: seed.parentId,
    path: seed.path,
    seo: {
      canonicalUrl: seed.path,
      description: null,
      indexable: true,
      title: seed.name,
    },
    slug: seed.slug,
    sortOrder: seed.sortOrder,
  };
}

export const categoryFixtures: readonly Category[] = categorySeeds.map(createCategory);

export function findCategoryFixture(identifier: string): Category | undefined {
  const normalizedPath = identifier.startsWith('/catalog/')
    ? identifier
    : `/catalog/${identifier.replace(/^\/+/, '')}`;

  return categoryFixtures.find(
    (category) =>
      category.id === identifier ||
      category.path === normalizedPath ||
      category.path === identifier ||
      category.slug === identifier,
  );
}

export function getCategoryFixtureIds(identifier: string): ReadonlySet<string> {
  const category = findCategoryFixture(identifier);

  if (category === undefined) {
    return new Set();
  }

  const ids = new Set<string>([category.id]);
  let hasNewChildren = true;

  while (hasNewChildren) {
    hasNewChildren = false;

    for (const candidate of categoryFixtures) {
      if (candidate.parentId !== null && ids.has(candidate.parentId) && !ids.has(candidate.id)) {
        ids.add(candidate.id);
        hasNewChildren = true;
      }
    }
  }

  return ids;
}
