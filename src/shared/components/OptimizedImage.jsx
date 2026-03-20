import { useState, useRef, useEffect } from 'react';
import { getTransformedUrl, buildSrcSet } from '../imageUtils';

/**
 * OptimizedImage — A robust, performance-optimized image component.
 *
 * Features:
 * - Lazy loading with IntersectionObserver (loads when near viewport)
 * - Skeleton shimmer placeholder while loading
 * - Smooth fade-in on load
 * - Error fallback with emoji + retry
 * - Supabase image transforms (srcSet for responsive sizes)
 * - Proper decoding="async" for non-blocking rendering
 *
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text (required for a11y)
 * @param {string} fallbackEmoji - Emoji to show on error (default: '🌿')
 * @param {number} width - Desired display width (for srcSet generation)
 * @param {React.CSSProperties} style - Container styles
 * @param {React.CSSProperties} imgStyle - Image element styles
 * @param {string} className - Additional class for the container
 * @param {string} sizes - Responsive sizes attribute (e.g., '(max-width: 768px) 50vw, 33vw')
 * @param {function} onClick - Click handler
 * @param {boolean} eager - Skip lazy loading (for above-the-fold images)
 */
export const OptimizedImage = ({
  src,
  alt,
  fallbackEmoji = '🌿',
  width,
  style = {},
  imgStyle = {},
  className = '',
  sizes,
  onClick,
  eager = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(eager);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef(null);

  // IntersectionObserver for true lazy loading
  useEffect(() => {
    if (eager || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [eager]);

  // Reset state when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
    setRetryCount(0);
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    setError(false);
  };

  const handleError = () => {
    if (retryCount < 2) {
      // Auto-retry once with cache bust
      setRetryCount(prev => prev + 1);
    } else {
      setError(true);
    }
  };

  const handleRetry = (e) => {
    e?.stopPropagation();
    setError(false);
    setRetryCount(0);
    setLoaded(false);
  };

  // Generate optimized src and srcSet
  const optimizedSrc = width && src
    ? getTransformedUrl(src, { width: width * 2, quality: 75 }) // 2x for retina
    : src;
  const srcSet = src ? buildSrcSet(src) : '';

  // Add retry cache bust
  const finalSrc = retryCount > 0 && optimizedSrc
    ? `${optimizedSrc}${optimizedSrc.includes('?') ? '&' : '?'}retry=${retryCount}`
    : optimizedSrc;

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    ...style,
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle} onClick={onClick}>
      {/* Skeleton shimmer placeholder */}
      {!loaded && !error && src && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(45,125,70,0.08) 25%, rgba(45,125,70,0.04) 50%, rgba(45,125,70,0.08) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonPulse 1.5s infinite',
          }}
        />
      )}

      {/* Actual image (only rendered when in view) */}
      {inView && src && !error && (
        <img
          src={finalSrc}
          srcSet={srcSet || undefined}
          sizes={sizes || undefined}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            ...imgStyle,
          }}
        />
      )}

      {/* Error state with retry */}
      {(error || !src) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(45,125,70,0.15), rgba(242,169,0,0.1))',
            gap: 4,
          }}
        >
          <span style={{ fontSize: Math.min(parseInt(style.height) || 80, 80) * 0.5 || 40 }} aria-hidden="true">
            {fallbackEmoji}
          </span>
          {error && src && (
            <button
              onClick={handleRetry}
              style={{
                background: 'rgba(0,0,0,0.4)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '4px 10px',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};
