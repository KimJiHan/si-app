// 운영체제 및 폰트 감지 유틸리티
export const detectOS = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  
  if (platform.includes('mac')) return 'macos';
  if (platform.includes('win')) return 'windows';
  if (platform.includes('linux')) return 'linux';
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  
  return 'unknown';
};

// 시스템 폰트 체크
export const hasSystemFont = (fontName) => {
  // Canvas를 사용한 폰트 감지
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const text = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
  // 기본 폰트로 텍스트 너비 측정
  context.font = '72px monospace';
  const baselineWidth = context.measureText(text).width;
  
  // 테스트할 폰트로 텍스트 너비 측정
  context.font = `72px '${fontName}', monospace`;
  const testWidth = context.measureText(text).width;
  
  // 너비가 다르면 폰트가 존재함
  return baselineWidth !== testWidth;
};

// 최적화된 폰트 스택 생성
export const getOptimizedFontStack = () => {
  const os = detectOS();
  
  // macOS: 시스템 폰트 우선
  if (os === 'macos') {
    return `
      -apple-system,
      BlinkMacSystemFont,
      'Apple SD Gothic Neo',
      'Noto Sans KR',
      'Pretendard',
      sans-serif
    `;
  }
  
  // Windows: Noto Sans KR 우선
  if (os === 'windows') {
    return `
      'Noto Sans KR',
      'Malgun Gothic',
      'Pretendard',
      'Segoe UI',
      sans-serif
    `;
  }
  
  // Linux: Noto Sans KR 우선
  if (os === 'linux') {
    return `
      'Noto Sans KR',
      'Noto Sans CJK KR',
      'Pretendard',
      'Ubuntu',
      sans-serif
    `;
  }
  
  // Android: Noto Sans KR 우선
  if (os === 'android') {
    return `
      'Noto Sans KR',
      'Roboto',
      'Pretendard',
      sans-serif
    `;
  }
  
  // iOS: 시스템 폰트 우선
  if (os === 'ios') {
    return `
      -apple-system,
      'SF Pro Text',
      'Apple SD Gothic Neo',
      'Noto Sans KR',
      'Pretendard',
      sans-serif
    `;
  }
  
  // 기본값: Noto Sans KR 우선
  return `
    'Noto Sans KR',
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif
  `;
};

// 폰트 로딩 상태 관리
export const loadFonts = async () => {
  if (!document.fonts) return;
  
  const os = detectOS();
  
  // macOS가 아닌 환경에서는 Noto Sans KR 우선 로드
  if (os !== 'macos' && os !== 'ios') {
    try {
      // Noto Sans KR 로드 확인
      await document.fonts.load('400 16px "Noto Sans KR"');
      await document.fonts.load('500 16px "Noto Sans KR"');
      await document.fonts.load('700 16px "Noto Sans KR"');
      
      // 폰트 로드 완료 클래스 추가
      document.documentElement.classList.add('fonts-loaded');
      
      // 로컬 스토리지에 폰트 로드 상태 저장 (캐싱)
      localStorage.setItem('fontsLoaded', 'true');
      localStorage.setItem('fontsLoadedTime', Date.now().toString());
    } catch (error) {
      console.warn('Noto Sans KR 폰트 로딩 실패, Pretendard로 폴백', error);
    }
  }
};

// 폰트 캐시 확인
export const checkFontCache = () => {
  const fontsLoaded = localStorage.getItem('fontsLoaded');
  const loadedTime = localStorage.getItem('fontsLoadedTime');
  
  if (fontsLoaded && loadedTime) {
    const now = Date.now();
    const cacheTime = parseInt(loadedTime);
    const oneDay = 24 * 60 * 60 * 1000;
    
    // 24시간 이내 로드된 경우 캐시 사용
    if (now - cacheTime < oneDay) {
      document.documentElement.classList.add('fonts-loaded');
      return true;
    }
  }
  
  return false;
};