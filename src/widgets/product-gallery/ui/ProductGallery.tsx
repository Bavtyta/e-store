import { useId, useState } from 'react';

import type { Image } from '@/shared/model';
import { ImagePlaceholder } from '@/shared/ui';

import styles from './product-gallery.module.css';

export interface ProductGalleryProps {
  images: readonly Image[];
  productName: string;
  selectedImageId?: string | null;
}

export function ProductGallery({
  images,
  productName,
  selectedImageId = null,
}: ProductGalleryProps) {
  const sortedImages = [...images].sort((first, second) => first.sortOrder - second.sortOrder);
  const preferredImage =
    sortedImages.find((image) => image.id === selectedImageId) ?? sortedImages[0] ?? null;
  const [activeImageId, setActiveImageId] = useState<string | null>(preferredImage?.id ?? null);
  const activeImageElementId = useId();

  const activeImage = sortedImages.find((image) => image.id === activeImageId) ?? preferredImage;

  if (activeImage === null) {
    return (
      <section aria-label={`Галерея товара «${productName}»`} className={styles.root}>
        <ImagePlaceholder
          alt={`Изображение товара «${productName}» отсутствует`}
          className={styles.placeholder}
        />
      </section>
    );
  }

  return (
    <section aria-label={`Галерея товара «${productName}»`} className={styles.root}>
      <div className={styles.stage}>
        <img
          alt={activeImage.alt || productName}
          className={styles.mainImage}
          decoding="async"
          fetchPriority="high"
          height={activeImage.height ?? undefined}
          id={activeImageElementId}
          src={activeImage.url}
          width={activeImage.width ?? undefined}
        />
      </div>
      {sortedImages.length > 1 ? (
        <div aria-label="Миниатюры товара" className={styles.thumbnails}>
          {sortedImages.map((image, index) => (
            <button
              aria-controls={activeImageElementId}
              aria-label={`Показать изображение ${String(index + 1)}: ${image.alt || productName}`}
              aria-pressed={image.id === activeImage.id}
              className={styles.thumbnail}
              key={image.id}
              onClick={() => {
                setActiveImageId(image.id);
              }}
              type="button"
            >
              <img
                alt=""
                decoding="async"
                height={image.height ?? undefined}
                loading="lazy"
                src={image.url}
                width={image.width ?? undefined}
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
