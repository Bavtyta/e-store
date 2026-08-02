import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Placeholder } from '@/shared/ui/placeholder';

const privacyMetadata = createPageMetadata(
  {
    canonicalPath: '/privacy',
    description: 'Политика конфиденциальности магазина ПромМатериалы.',
    indexable: false,
    title: 'Политика конфиденциальности',
  },
  appConfig.publicSiteUrl,
);

export function PrivacyPage() {
  return (
    <>
      <PageMetadata metadata={privacyMetadata} />
      <Placeholder title="Политика конфиденциальности" />
    </>
  );
}
