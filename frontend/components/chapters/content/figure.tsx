'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { ZoomIn, X } from 'lucide-react';

interface FigureProps {
  children: ReactNode;
  className?: string;
}

export function Figure({ children, className }: FigureProps) {
  return (
    <figure className={cn('my-6', className)}>
      {children}
    </figure>
  );
}

interface FigureImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function FigureImage({ src, alt, className }: FigureImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  // Prefix relative URLs with API base URL
  const imageUrl = src.startsWith('/')
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${src}`
    : src;

  return (
    <>
      {/* Image principale */}
      <div className="relative group max-w-2xl w-full">
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          className={cn(
            'w-full h-auto rounded-lg shadow-md',
            'border border-border',
            'object-contain max-h-[400px]',
            'cursor-zoom-in',
            className
          )}
          onClick={() => setIsZoomed(true)}
        />
        {/* Bouton zoom qui apparaît au survol */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Agrandir l'image"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* Modal plein écran pour l'image zoomée */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2 bg-background rounded-md shadow-md hover:bg-accent transition-colors"
            aria-label="Fermer l'image agrandie"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
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
        'mt-3 text-sm text-muted-foreground italic',
        className
      )}
    >
      {children}
    </figcaption>
  );
}
