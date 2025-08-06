import React, { useState, useEffect, useRef } from 'react';

// 이미지 지연 로딩 컴포넌트
function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThlZiIvPjwvc3ZnPg==',
  onLoad,
  onError,
  loading = 'lazy',
  fetchPriority = 'auto'
}) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Intersection Observer를 사용한 지연 로딩
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 이미지 프리로드
            const img = new Image();
            img.src = src;
            
            img.onload = () => {
              setImageSrc(src);
              setImageLoading(false);
              if (onLoad) onLoad();
            };
            
            img.onerror = () => {
              setError(true);
              setImageLoading(false);
              if (onError) onError();
            };
            
            // 관찰 중지
            if (imgRef.current) {
              observer.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        // 뷰포트에 들어오기 100px 전에 로딩 시작
        rootMargin: '100px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, placeholder, onLoad, onError]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-pulse">
            <div className="h-8 w-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            이미지 로드 실패
          </div>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={loading}
          fetchpriority={fetchPriority}
        />
      )}
    </div>
  );
}

export default LazyImage;