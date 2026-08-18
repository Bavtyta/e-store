import { render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';

import { createPageMetadata } from './pageMetadata';
import { PageMetadata } from './MetadataElements';

const PUBLIC_SITE_URL = 'https://shop.example/';

describe('page metadata', () => {
  it('creates absolute canonical and social metadata from a configured site URL', () => {
    const metadata = createPageMetadata(
      {
        canonicalPath: '/product/truba-pnd',
        description: '  Напорная   труба ПНД для водоснабжения. ',
        imageUrl: '/images/truba.webp',
        openGraphType: 'product',
        title: 'Труба ПНД',
      },
      PUBLIC_SITE_URL,
    );

    expect(metadata).toEqual({
      canonicalUrl: 'https://shop.example/product/truba-pnd',
      description: 'Напорная труба ПНД для водоснабжения.',
      openGraph: {
        description: 'Напорная труба ПНД для водоснабжения.',
        imageUrl: 'https://shop.example/images/truba.webp',
        title: 'Труба ПНД — BELT',
        type: 'product',
        url: 'https://shop.example/product/truba-pnd',
      },
      robots: 'index, follow',
      title: 'Труба ПНД — BELT',
      twitter: {
        card: 'summary_large_image',
        description: 'Напорная труба ПНД для водоснабжения.',
        imageUrl: 'https://shop.example/images/truba.webp',
        title: 'Труба ПНД — BELT',
      },
    });
  });

  it('forces canonical URLs onto the configured origin and rejects unsafe image protocols', () => {
    const metadata = createPageMetadata(
      {
        canonicalPath: 'https://untrusted.example/catalog',
        description: 'Каталог материалов',
        imageUrl: 'javascript:alert(1)',
        indexable: false,
        title: 'Каталог',
      },
      PUBLIC_SITE_URL,
    );

    expect(metadata.canonicalUrl).toBe('https://shop.example/catalog');
    expect(metadata.openGraph.imageUrl).toBeNull();
    expect(metadata.robots).toBe('noindex, nofollow');
    expect(metadata.twitter.card).toBe('summary');
  });

  it('normalizes and safely shortens long descriptions', () => {
    const metadata = createPageMetadata(
      {
        canonicalPath: '/',
        description: `${'Описание товара '.repeat(20)}завершение`,
        title: 'Главная',
      },
      PUBLIC_SITE_URL,
    );

    expect(metadata.description.length).toBeLessThanOrEqual(160);
    expect(metadata.description.endsWith('…')).toBe(true);
    expect(metadata.description).not.toMatch(/\s{2,}/);
  });

  it('applies metadata through React and removes optional image tags on update', () => {
    const initialMetadata = createPageMetadata(
      {
        canonicalPath: '/product/truba-pnd',
        description: 'Описание товара',
        imageUrl: '/images/truba.webp',
        title: 'Труба ПНД',
      },
      PUBLIC_SITE_URL,
    );
    const { rerender } = render(<PageMetadata metadata={initialMetadata} />);

    expect(document.title).toBe('Труба ПНД — BELT');
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Описание товара',
    );
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://shop.example/product/truba-pnd',
    );
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://shop.example/images/truba.webp',
    );

    const updatedMetadata = createPageMetadata(
      {
        canonicalPath: '/cart',
        description: 'Корзина',
        indexable: false,
        title: 'Корзина',
      },
      PUBLIC_SITE_URL,
    );
    rerender(<PageMetadata metadata={updatedMetadata} />);

    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(document.head.querySelector('meta[property="og:image"]')).not.toBeInTheDocument();
    expect(document.head.querySelector('meta[name="twitter:image"]')).not.toBeInTheDocument();
  });

  it('renders the prepared descriptor without browser APIs', () => {
    const metadata = createPageMetadata(
      {
        canonicalPath: '/catalog',
        description: 'Каталог материалов',
        title: 'Каталог',
      },
      PUBLIC_SITE_URL,
    );

    const markup = renderToStaticMarkup(<PageMetadata metadata={metadata} />);

    expect(markup).toContain('<title>Каталог — BELT</title>');
    expect(markup).toContain('name="description"');
    expect(markup).toContain('rel="canonical"');
    expect(markup).toContain('name="robots"');
  });
});
