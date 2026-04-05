import { useState } from 'react';

export default function OptimizedImage({ 
  src, 
  alt, 
  className, 
  style, 
  fallbackSrc = 'https://placehold.co/500x500/png',
  loading = 'lazy'
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? fallbackSrc : (src || fallbackSrc)}
      alt={alt}
      loading={loading}
      className={className}
      style={{
        ...style,
        filter: loaded || error ? 'blur(0)' : 'blur(10px)',
        opacity: loaded || error ? 1 : 0.6,
        transition: 'filter 0.4s ease-out, opacity 0.4s ease-out',
        backgroundColor: 'var(--bg-secondary)'
      }}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (!error) setError(true);
      }}
    />
  );
}
