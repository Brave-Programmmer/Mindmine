/**
 * Image Optimization Utility
 * Provides helper functions for optimized image loading in Astro
 */

interface ImageProps {
  src: string;
  alt: string;
  title?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  width?: number;
  height?: number;
  quality?: number;
  format?: 'avif' | 'webp' | 'jpg' | 'png';
}

/**
 * Generates optimized image attributes for SEO and performance
 * Usage in Astro components:
 * <img {...getOptimizedImageProps({ src: '/image.jpg', alt: 'Description' })} />
 */
export function getOptimizedImageProps({
  src,
  alt,
  title,
  loading = 'lazy',
  decoding = 'async',
  width,
  height,
}: ImageProps) {
  return {
    src,
    alt,
    title: title || alt,
    loading,
    decoding,
    ...(width && { width }),
    ...(height && { height }),
    // Attributes for better performance
    fetchpriority: loading === 'eager' ? 'high' : 'low',
  };
}

/**
 * Generates WebP image with fallback
 * Usage: <img {...getWebPImage(src, alt)} />
 */
export function getWebPImage(src: string, alt: string, width?: number, height?: number) {
  const baseUrl = src.replace(/\.[^.]+$/, '');
  const format = src.split('.').pop();

  return {
    srcSet: `${baseUrl}.webp 1x, ${baseUrl}@2x.webp 2x`,
    src: src,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    ...(width && { width }),
    ...(height && { height }),
  };
}

/**
 * Generates responsive image source
 * Usage in Astro with <picture> tag
 */
export function getResponsiveImageSources(baseSrc: string) {
  const baseUrl = baseSrc.replace(/\.[^.]+$/, '');

  return [
    {
      srcSet: `${baseUrl}.avif 1x, ${baseUrl}@2x.avif 2x`,
      type: 'image/avif',
    },
    {
      srcSet: `${baseUrl}.webp 1x, ${baseUrl}@2x.webp 2x`,
      type: 'image/webp',
    },
  ];
}

/**
 * LCP (Largest Contentful Paint) image optimization
 * Use this for above-the-fold hero/banner images
 */
export function getLCPImageProps(src: string, alt: string, width: number, height: number) {
  return {
    src,
    alt,
    width,
    height,
    loading: 'eager' as const,
    fetchpriority: 'high' as const,
    decoding: 'sync' as const,
  };
}

/**
 * Generate srcset for responsive images
 * Usage: <img {...getResponsiveImage(src, alt, widths)} />
 */
export function getResponsiveImage(src: string, alt: string, widths: number[] = [320, 640, 1024]) {
  const baseUrl = src.replace(/\.[^.]+$/, '');
  const ext = src.split('.').pop();

  const srcSet = widths.map((w) => `${baseUrl}-${w}w.${ext} ${w}w`).join(', ');

  return {
    src: `${baseUrl}-1024w.${ext}`,
    srcSet,
    alt,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw',
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
}
