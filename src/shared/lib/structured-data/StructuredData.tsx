export type StructuredDataValue =
  | boolean
  | number
  | string
  | null
  | readonly StructuredDataValue[]
  | { readonly [key: string]: StructuredDataValue };

export interface StructuredDataProps {
  data: StructuredDataValue;
}

function serializeStructuredData(data: StructuredDataValue): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}
      type="application/ld+json"
    />
  );
}
