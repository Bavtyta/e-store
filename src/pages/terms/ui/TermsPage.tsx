import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Placeholder } from '@/shared/ui/placeholder';

const termsMetadata = createPageMetadata(
  {
    canonicalPath: '/terms',
    description: 'Пользовательское соглашение магазина ПромМатериалы.',
    indexable: false,
    title: 'Пользовательское соглашение',
  },
  appConfig.publicSiteUrl,
);

export function TermsPage() {
  return (
    <>
      <PageMetadata metadata={termsMetadata} />
      <Placeholder title="Пользовательское соглашение" />
    </>
  );
}
