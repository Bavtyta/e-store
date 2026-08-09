const INDEXABLE_STATIC_ROUTES = ['/', '/catalog'] as const;
const DISALLOWED_PATHS = ['/cart', '/contacts', '/privacy', '/terms', '/ui-preview'] as const;

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      "'": '&apos;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
    };

    return entities[character] ?? character;
  });
}

export function resolveSiteOrigin(siteUrl: string, fallback = 'http://localhost:5173'): string {
  try {
    return new URL(siteUrl).origin;
  } catch {
    return new URL(fallback).origin;
  }
}

export function createRobotsTxt(siteOrigin: string): string {
  const disallowed = DISALLOWED_PATHS.map((path) => `Disallow: ${path}`).join('\n');

  return [
    'User-agent: *',
    'Allow: /',
    disallowed,
    'Disallow: /*?*',
    `Sitemap: ${siteOrigin}/sitemap.xml`,
    '',
  ].join('\n');
}

export function createSitemapXml(siteOrigin: string): string {
  const urls = INDEXABLE_STATIC_ROUTES.map((route) => {
    const location = escapeXml(new URL(route, `${siteOrigin}/`).toString());

    return `  <url>\n    <loc>${location}</loc>\n  </url>`;
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}
