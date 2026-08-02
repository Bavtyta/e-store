import type { Attribute } from '../model/product';

import styles from './product-attributes.module.css';

export interface ProductAttributesProps {
  attributes: readonly Attribute[];
}

function formatAttributeValue(attribute: Attribute): string {
  const value =
    attribute.value === true ? 'Да' : attribute.value === false ? 'Нет' : String(attribute.value);

  return attribute.unit === null ? value : `${value} ${attribute.unit}`;
}

export function ProductAttributes({ attributes }: ProductAttributesProps) {
  if (attributes.length === 0) {
    return <p className={styles.empty}>Характеристики не указаны.</p>;
  }

  return (
    <dl className={styles.root}>
      {attributes.map((attribute) => (
        <div className={styles.row} key={attribute.code}>
          <dt>{attribute.name}</dt>
          <dd>{formatAttributeValue(attribute)}</dd>
        </div>
      ))}
    </dl>
  );
}
