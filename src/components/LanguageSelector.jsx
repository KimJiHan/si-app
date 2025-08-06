import React, { useState, useEffect } from 'react';
import translationMonitor from '../utils/translationMonitor';

function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('ko');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Google Translate 스크립트 로드
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function() {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'ko',
            includedLanguages: 'en,zh-CN,ja',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
        
        // 초기화 완료 후 모니터링 시작
        setTimeout(() => {
          translationMonitor.checkInitialization();
          translationMonitor.addTranslationEventListeners();
          translationMonitor.observeTranslationChanges((status) => {
            console.log('[LanguageSelector] Translation status changed:', status);
          });
        }, 1000);
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      
      script.onload = () => {
        console.log('[LanguageSelector] Google Translate script loaded successfully');
      };
      
      script.onerror = (error) => {
        console.error('[LanguageSelector] Failed to load Google Translate script:', error);
      };
      
      document.body.appendChild(script);
    }
    
    return () => {
      // 컴포넌트 언마운트 시 정리
      translationMonitor.cleanup();
    };
  }, []);

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const handleLanguageChange = (langCode) => {
    console.log('[LanguageSelector] Changing language to:', langCode);
    
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // 번역 전 상태 확인
    const beforeStatus = translationMonitor.getFullReport();
    console.log('[LanguageSelector] Status before translation:', beforeStatus);
    
    // Google Translate 쿠키를 사용한 언어 변경
    if (langCode === 'ko') {
      // 원래 언어로 복원
      const googleTranslateElement = document.querySelector('.goog-te-combo');
      if (googleTranslateElement) {
        googleTranslateElement.value = '';
        googleTranslateElement.dispatchEvent(new Event('change'));
      }
    } else {
      // 언어 변경
      const langMap = {
        'en': 'en',
        'zh': 'zh-CN',
        'ja': 'ja'
      };
      
      const googleTranslateElement = document.querySelector('.goog-te-combo');
      if (googleTranslateElement) {
        googleTranslateElement.value = langMap[langCode];
        googleTranslateElement.dispatchEvent(new Event('change'));
        
        // 번역 후 상태 확인 (지연 실행)
        setTimeout(() => {
          const afterStatus = translationMonitor.getFullReport();
          console.log('[LanguageSelector] Status after translation:', afterStatus);
        }, 2000);
      } else {
        console.error('[LanguageSelector] Google Translate element not found');
        alert('번역 기능이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <span className="text-xl">{currentLanguage.flag}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {currentLanguage.name}
          </span>
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  currentLang === lang.code ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {lang.name}
                </span>
                {currentLang === lang.code && (
                  <svg className="w-4 h-4 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 숨겨진 Google Translate 요소 */}
      <div className="hidden">
        <div id="google_translate_element"></div>
      </div>
    </div>
  );
}

export default LanguageSelector;