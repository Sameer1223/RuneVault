import React from 'react';
import { getCardImagePath, getCardImageFallback } from '@/utils/imageUtils';

interface CardImageProps {
  cardId: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Card image component that tries AVIF first, falls back to PNG.
 */
export default function CardImage({ cardId, alt, className, style }: CardImageProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Only try fallback once to avoid infinite loop
    if (!img.hasAttribute('data-fallback-attempted')) {
      img.setAttribute('data-fallback-attempted', 'true');
      img.src = getCardImageFallback(cardId);
    }
  };
  
  return (
    <img
      key={cardId}
      src={getCardImagePath(cardId)}
      alt={alt || cardId}
      className={className}
      style={style}
      onError={handleError}
    />
  );
}
