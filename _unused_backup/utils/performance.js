// Core Web Vitals 측정 유틸리티
export const measureWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);  // Cumulative Layout Shift
      getFID(onPerfEntry);  // First Input Delay
      getFCP(onPerfEntry);  // First Contentful Paint
      getLCP(onPerfEntry);  // Largest Contentful Paint
      getTTFB(onPerfEntry); // Time to First Byte
    });
  }
};

// 성능 모니터링 헬퍼
export const performanceMonitor = {
  // 마크 생성
  mark: (name) => {
    if (performance && performance.mark) {
      performance.mark(name);
    }
  },
  
  // 측정
  measure: (name, startMark, endMark) => {
    if (performance && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name);
        const lastEntry = entries[entries.length - 1];
        console.log(`⚡ Performance: ${name} took ${lastEntry.duration.toFixed(2)}ms`);
        return lastEntry.duration;
      } catch (e) {
        console.error('Performance measurement error:', e);
      }
    }
  },
  
  // 리소스 타이밍 분석
  analyzeResources: () => {
    if (performance && performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      const analysis = {
        images: [],
        scripts: [],
        stylesheets: [],
        total: 0
      };
      
      resources.forEach(resource => {
        const info = {
          name: resource.name,
          duration: resource.duration,
          size: resource.transferSize || 0
        };
        
        if (resource.name.includes('.jpg') || resource.name.includes('.png') || resource.name.includes('.webp')) {
          analysis.images.push(info);
        } else if (resource.name.includes('.js')) {
          analysis.scripts.push(info);
        } else if (resource.name.includes('.css')) {
          analysis.stylesheets.push(info);
        }
        
        analysis.total += resource.duration;
      });
      
      return analysis;
    }
  },
  
  // 메모리 사용량 체크
  checkMemory: () => {
    if (performance && performance.memory) {
      const memory = performance.memory;
      return {
        used: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        total: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
        percentage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2) + '%'
      };
    }
  },
  
  // 네비게이션 타이밍 분석
  analyzeNavigation: () => {
    if (performance && performance.timing) {
      const timing = performance.timing;
      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        request: timing.responseStart - timing.requestStart,
        response: timing.responseEnd - timing.responseStart,
        dom: timing.domComplete - timing.domLoading,
        load: timing.loadEventEnd - timing.loadEventStart,
        total: timing.loadEventEnd - timing.navigationStart
      };
    }
  }
};

// 이미지 최적화 헬퍼
export const optimizeImage = (url, options = {}) => {
  const {
    width = 'auto',
    quality = 85,
    format = 'webp'
  } = options;
  
  // Weserv 프록시를 통한 이미지 최적화
  if (url.startsWith('http')) {
    const params = new URLSearchParams({
      url,
      w: width,
      q: quality,
      output: format
    });
    return `https://images.weserv.nl/?${params}`;
  }
  
  return url;
};

// 디바운스 헬퍼
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 쓰로틀 헬퍼
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 프리페치 헬퍼
export const prefetchImage = (url) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  }
};

// 프리로드 헬퍼
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};