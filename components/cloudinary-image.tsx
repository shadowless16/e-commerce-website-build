'use client';

import { CldImage } from 'next-cloudinary';
import { cn } from '@/lib/utils';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  crop?: string;
  gravity?: string;
  quality?: string | number;
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className,
  crop = 'fill',
  gravity = 'auto',
  quality = 'auto',
}: CloudinaryImageProps) {
  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      crop={crop}
      gravity={gravity}
      quality={quality}
      className={cn('object-cover', className)}
    />
  );
}