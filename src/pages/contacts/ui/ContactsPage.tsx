import { appConfig } from '@/shared/config';
import { createPageMetadata, PageMetadata } from '@/shared/lib';
import { Placeholder } from '@/shared/ui/placeholder';

const contactsMetadata = createPageMetadata(
  {
    canonicalPath: '/contacts',
    description: 'Контактная информация магазина ПромМатериалы.',
    indexable: false,
    title: 'Контакты',
  },
  appConfig.publicSiteUrl,
);

export function ContactsPage() {
  return (
    <>
      <PageMetadata metadata={contactsMetadata} />
      <Placeholder title="Контакты" />
    </>
  );
}
