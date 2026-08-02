import type { PageMetadataDescriptor } from './pageMetadata';

export interface PageMetadataProps {
  metadata: PageMetadataDescriptor;
}

export function PageMetadata({ metadata }: PageMetadataProps) {
  return (
    <>
      <title>{metadata.title}</title>
      <meta content={metadata.description} name="description" />
      <link href={metadata.canonicalUrl} rel="canonical" />
      <meta content={metadata.robots} name="robots" />

      <meta content={metadata.openGraph.title} property="og:title" />
      <meta content={metadata.openGraph.description} property="og:description" />
      <meta content={metadata.openGraph.type} property="og:type" />
      <meta content={metadata.openGraph.url} property="og:url" />
      {metadata.openGraph.imageUrl === null ? null : (
        <meta content={metadata.openGraph.imageUrl} property="og:image" />
      )}

      <meta content={metadata.twitter.card} name="twitter:card" />
      <meta content={metadata.twitter.title} name="twitter:title" />
      <meta content={metadata.twitter.description} name="twitter:description" />
      {metadata.twitter.imageUrl === null ? null : (
        <meta content={metadata.twitter.imageUrl} name="twitter:image" />
      )}
    </>
  );
}
