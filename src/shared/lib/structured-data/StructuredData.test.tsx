import { renderToStaticMarkup } from 'react-dom/server';

import { StructuredData } from './StructuredData';

describe('StructuredData', () => {
  it('renders valid JSON-LD and escapes markup characters', () => {
    const markup = renderToStaticMarkup(
      <StructuredData
        data={{ '@context': 'https://schema.org', '@type': 'Organization', name: '<BELT>' }}
      />,
    );

    expect(markup).toContain('type="application/ld+json"');
    expect(markup).toContain('\\u003cBELT>');
    expect(markup).not.toContain('<BELT>');
  });
});
