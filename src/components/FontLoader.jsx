import { useEffect } from 'react';
import { detectOS } from '../utils/fontDetector';

// 폰트 로더 컴포넌트
function FontLoader() {
  useEffect(() => {
    const os = detectOS();
    
    // macOS가 아닌 환경에서 추가 폰트 최적화
    if (os !== 'macos' && os !== 'ios') {
      // CSS 변수로 폰트 스택 설정
      const root = document.documentElement;
      
      // 운영체제별 최적화
      switch(os) {
        case 'windows':
          root.style.setProperty('--font-korean', '"Noto Sans KR", "Malgun Gothic", "맑은 고딕"');
          break;
        case 'linux':
          root.style.setProperty('--font-korean', '"Noto Sans KR", "Noto Sans CJK KR"');
          break;
        case 'android':
          root.style.setProperty('--font-korean', '"Noto Sans KR", "Roboto"');
          break;
        default:
          root.style.setProperty('--font-korean', '"Noto Sans KR"');
      }
      
      // 폰트 로드 완료 감지
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          // 모든 폰트 로드 완료
          console.log('✅ 폰트 로드 완료');
          
          // 폰트 로드 성능 측정
          if (performance && performance.mark) {
            performance.mark('fonts-loaded');
            if (performance.getEntriesByName('fonts-start').length > 0) {
              performance.measure('font-loading', 'fonts-start', 'fonts-loaded');
              const measure = performance.getEntriesByName('font-loading')[0];
              console.log(`📊 폰트 로딩 시간: ${measure.duration.toFixed(2)}ms`);
            }
          }
        });
      }
    }
  }, []);
  
  return null;
}

export default FontLoader;