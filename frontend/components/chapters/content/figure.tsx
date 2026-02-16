'use client';

import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ZoomIn, X } from 'lucide-react';

interface FigureProps {
  children: ReactNode;
  className?: string;
}

export function Figure({ children, className }: FigureProps) {
  return (
    <figure className={cn('my-8 flex flex-col items-center', className)}>
      {children}
    </figure>
  );
}

interface FigureImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function FigureImage({
  src,
  alt,
  width,
  height,
  className,
}: FigureImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const imageUrl = src.startsWith('/')
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${src}`
    : src;

  // Scroll lock sans décalage horizontal
  useEffect(() => {
    if (isZoomed) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isZoomed]);

  // Use provided dimensions or defaults
  const imageWidth = width || 800;
  const imageHeight = height || 600;

  return (
    <>
      {/* Image avec ratio fixe pour éviter le CLS */}
      <div className="relative w-full max-w-3xl">
        <div
          className="relative cursor-zoom-in group overflow-hidden rounded-xl border border-border shadow-md"
          style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
          onClick={() => setIsZoomed(true)}
        >
          <Image
            src={imageUrl}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className={cn('object-contain transition-transform duration-300 group-hover:scale-[1.02]', className)}
            priority={false}
          />

          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-2 bg-background/80 backdrop-blur-sm rounded-md shadow">
              <ZoomIn className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 p-2 bg-background rounded-md shadow hover:bg-accent transition"
            aria-label="Fermer l'image agrandie"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative w-full max-w-6xl h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-contain rounded-lg shadow-2xl"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}

interface FigureCaptionProps {
  children: ReactNode;
  className?: string;
}

export function FigureCaption({ children, className }: FigureCaptionProps) {
  return (
    <figcaption
      className={cn(
        'mt-4 text-sm text-muted-foreground text-center italic max-w-2xl',
        className
      )}
    >
      {children}
    </figcaption>
  );
}
