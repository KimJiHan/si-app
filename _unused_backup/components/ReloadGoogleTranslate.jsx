import React, { useState, useEffect } from 'react';

// 페이지 새로고침 기반 Google Translate 컴포넌트
function ReloadGoogleTranslate() {
  const [currentLang, setCurrentLang] = useState('ko');
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];
  
  // 초기 언어 설정 (URL 파라미터에서 읽기)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') || 'ko';
    
    if (['ko', 'en', 'zh', 'ja'].includes(langParam)) {
      setCurrentLang(langParam);
      
      // 언어가 한국어가 아닌 경우 번역 실행
      if (langParam !== 'ko') {
        // Google Translate 스크립트 로드
        loadGoogleTranslate(langParam);
      }
    }
  }, []);
  
  // Google Translate 스크립트 로드
  const loadGoogleTranslate = (targetLang) => {
    // Google Translate 기본 스크립트
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function() {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'ko',
            includedLanguages: 'ko,en,zh-CN,ja',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
      };
    }
    
    // 스크립트가 이미 로드되지 않은 경우에만 로드
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
    
    // 자동으로 번역 실행
    setTimeout(() => {
      const langMap = {
        'en': 'en',
        'zh': 'zh-CN',
        'ja': 'ja'
      };
      
      // Google Translate 쿠키 설정
      document.cookie = `googtrans=/ko/${langMap[targetLang]}; path=/`;
      
      // 번역 트리거
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        selectElement.value = langMap[targetLang];
        selectElement.dispatchEvent(new Event('change'));
      }
    }, 1000);
  };
  
  // 언어 변경 처리 (페이지 새로고침)
  const handleLanguageChange = (langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }
    
    // URL 파라미터 업데이트
    const url = new URL(window.location.href);
    
    if (langCode === 'ko') {
      // 한국어로 변경 시 파라미터 제거 및 쿠키 초기화
      url.searchParams.delete('lang');
      // Google Translate 쿠키 제거
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    } else {
      url.searchParams.set('lang', langCode);
    }
    
    // 페이지 새로고침
    window.location.href = url.toString();
  };
  
  const currentLanguage = languages.find(lang => lang.code === currentLang);
  
  return (
    <>
      {/* 숨겨진 Google Translate 요소 */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      
      {/* 커스텀 언어 선택 버튼 */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
          aria-label="언어 선택"
          aria-expanded={isOpen}
        >
          <span className="text-xl" role="img" aria-label={currentLanguage.name}>
            {currentLanguage.flag}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {currentLanguage.name}
          </span>
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div 
            className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            role="menu"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  currentLang === lang.code ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                }`}
                role="menuitem"
                aria-current={currentLang === lang.code}
              >
                <span className="text-xl" role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {lang.name}
                </span>
                {currentLang === lang.code && (
                  <svg className="w-4 h-4 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Google Translate 바 숨기기 스타일 */}
      <style jsx global>{`
        .goog-te-banner-frame,
        .goog-te-menu-frame,
        .goog-logo-link,
        .goog-te-gadget {
          display: none !important;
        }
        
        body {
          top: 0 !important;
        }
        
        .skiptranslate {
          display: none !important;
        }
      `}</style>
    </>
  );
}

export default ReloadGoogleTranslate;