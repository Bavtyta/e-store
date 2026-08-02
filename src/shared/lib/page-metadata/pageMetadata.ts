const DEFAULT_BRAND_NAME = 'ПромМатериалы';
const MAX_DESCRIPTION_LENGTH = 160;

export type OpenGraphType = 'product' | 'website';
export type RobotsDirective = 'index, follow' | 'noindex, nofollow';
export type TwitterCardType = 'summary' | 'summary_large_image';

export interface PageMetadataInput {
  brandName?: string;
  canonicalPath: string;
  description: string;
  imageUrl?: string | null;
  indexable?: boolean;
  openGraphType?: OpenGraphType;
  title: string;
}

export interface PageMetadataDescriptor {
  canonicalUrl: string;
  description: string;
  openGraph: {
    description: string;
    imageUrl: string | null;
    title: string;
    type: OpenGraphType;
    url: string;
  };
  robots: RobotsDirective;
  title: string;
  twitter: {
    card: TwitterCardType;
    description: string;
    imageUrl: string | null;
    title: string;
  };
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function formatTitle(title: string, brandName: string): string {
  const normalizedTitle = normalizeText(title);
  const normalizedBrandName = normalizeText(brandName);

  if (
    normalizedTitle.length === 0 ||
    normalizedTitle === normalizedBrandName ||
    normalizedTitle.endsWith(`— ${normalizedBrandName}`)
  ) {
    return normalizedTitle.length === 0 ? normalizedBrandName : normalizedTitle;
  }

  return `${normalizedTitle} — ${normalizedBrandName}`;
}

function formatDescription(description: string): string {
  const normalizedDescription = normalizeText(description);

  if (normalizedDescription.length <= MAX_DESCRIPTION_LENGTH) {
    return normalizedDescription;
  }

  const shortenedDescription = normalizedDescription
    .slice(0, MAX_DESCRIPTION_LENGTH - 1)
    .replace(/\s+\S*$/, '')
    .trimEnd();

  return `${shortenedDescription}…`;
}

function createCanonicalUrl(publicSiteUrl: string, canonicalPath: string): string {
  const publicSite = new URL(publicSiteUrl);

  try {
    const candidate = new URL(canonicalPath, publicSite);

    if (candidate.protocol !== 'http:' && candidate.protocol !== 'https:') {
      return publicSite.toString();
    }

    const canonicalUrl = new URL(candidate.pathname, publicSite.origin);
    canonicalUrl.search = candidate.search;

    return canonicalUrl.toString();
  } catch {
    return publicSite.toString();
  }
}

function createImageUrl(publicSiteUrl: string, imageUrl: string | null | undefined): string | null {
  if (imageUrl === null || imageUrl === undefined || imageUrl.trim().length === 0) {
    return null;
  }

  try {
    const resolvedImageUrl = new URL(imageUrl, publicSiteUrl);

    return resolvedImageUrl.protocol === 'http:' || resolvedImageUrl.protocol === 'https:'
      ? resolvedImageUrl.toString()
      : null;
  } catch {
    return null;
  }
}

export function createPageMetadata(
  input: PageMetadataInput,
  publicSiteUrl: string,
): PageMetadataDescriptor {
  const title = formatTitle(input.title, input.brandName ?? DEFAULT_BRAND_NAME);
  const description = formatDescription(input.description);
  const canonicalUrl = createCanonicalUrl(publicSiteUrl, input.canonicalPath);
  const imageUrl = createImageUrl(publicSiteUrl, input.imageUrl);
  const openGraphType = input.openGraphType ?? 'website';

  return {
    canonicalUrl,
    description,
    openGraph: {
      description,
      imageUrl,
      title,
      type: openGraphType,
      url: canonicalUrl,
    },
    robots: input.indexable === false ? 'noindex, nofollow' : 'index, follow',
    title,
    twitter: {
      card: imageUrl === null ? 'summary' : 'summary_large_image',
      description,
      imageUrl,
      title,
    },
  };
}
