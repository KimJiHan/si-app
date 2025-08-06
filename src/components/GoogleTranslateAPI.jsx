import React, { useState, useEffect, useCallback } from 'react';

// ⚠️ 주의: 클라이언트 사이드에서 API 키를 노출하는 것은 보안상 위험합니다.
// 프로덕션 환경에서는 백엔드 서버를 통해 API를 호출하는 것을 권장합니다.

function GoogleTranslateAPI({ currentView = 'gallery' }) {
  const [currentLang, setCurrentLang] = useState('ko');
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedTexts, setTranslatedTexts] = useState(new Map());
  
  // Google Cloud Translation API 키 (환경 변수에서 가져오기)
  const API_KEY = import.meta.env.VITE_TRANSLATE_API_KEY;
  
  if (!API_KEY) {
    console.warn('Translation API key is not configured. Please set VITE_TRANSLATE_API_KEY in your .env file.');
  }

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  // 텍스트 노드 수집
  const getTextNodes = (element) => {
    const textNodes = [];
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      },
      false
    );

    let node;
    while (node = walk.nextNode()) {
      textNodes.push(node);
    }
    return textNodes;
  };

  // Google Translate API 호출
  const translateText = async (texts, targetLang) => {
    if (!API_KEY || targetLang === 'ko') return texts;

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: texts,
            source: 'ko',
            target: targetLang,
            format: 'text'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Translation API failed');
      }

      const data = await response.json();
      return data.data.translations.map(t => t.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      return texts;
    }
  };

  // 페이지 번역
  const translatePage = async (targetLang) => {
    // 항상 먼저 원본으로 복원
    restoreOriginal();
    
    if (targetLang === 'ko') {
      // 한국어는 원본이므로 추가 작업 불필요
      return;
    }

    // 약간의 지연을 두어 DOM이 완전히 복원되도록 함
    await new Promise(resolve => setTimeout(resolve, 100));

    setIsTranslating(true);
    const textNodes = getTextNodes(document.body);
    const textsToTranslate = [];
    const nodeMap = new Map();

    // 텍스트 수집
    textNodes.forEach((node, index) => {
      const text = node.textContent.trim();
      if (text) {
        // 항상 새로 번역하도록 캐시 확인 제거
        textsToTranslate.push(text);
        nodeMap.set(index, node);
      }
    });

    if (textsToTranslate.length > 0) {
      // 배치로 번역 (최대 100개씩)
      const batchSize = 100;
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);
        const translations = await translateText(batch, targetLang);
        
        // 번역 결과 저장 및 적용
        batch.forEach((originalText, batchIndex) => {
          const translation = translations[batchIndex];
          if (translation) {
            translatedTexts.set(`${originalText}_${targetLang}`, translation);
            
            // DOM 업데이트
            const nodeIndex = i + batchIndex;
            const node = Array.from(nodeMap.values())[nodeIndex];
            if (node) {
              node.parentElement.setAttribute('data-original-text', originalText);
              node.textContent = translation;
            }
          }
        });
      }
    }

    setIsTranslating(false);
  };

  // 원래 텍스트로 복원
  const restoreOriginal = () => {
    const elements = document.querySelectorAll('[data-original-text]');
    elements.forEach(element => {
      const originalText = element.getAttribute('data-original-text');
      if (originalText) {
        // 모든 텍스트 노드를 찾아서 복원
        const textNodes = getTextNodes(element);
        if (textNodes.length > 0) {
          textNodes[0].textContent = originalText;
        } else {
          // 텍스트 노드가 없으면 직접 텍스트 설정
          element.textContent = originalText;
        }
        element.removeAttribute('data-original-text');
      }
    });
    
    // 번역 캐시 초기화
    setTranslatedTexts(new Map());
  };

  const handleLanguageChange = (langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }
    
    // 에디터 화면에서 언어 변경 시 특별 처리
    if (currentView === 'editor' && langCode !== 'ko') {
      // 먼저 한국어로 새로고침
      const koUrl = new URL(window.location.href);
      koUrl.searchParams.delete('lang');
      koUrl.searchParams.set('temp_lang', langCode); // 임시로 선택한 언어 저장
      window.location.href = koUrl.toString();
      return;
    }
    
    // URL 파라미터에 언어 코드 추가하고 페이지 새로고침
    const url = new URL(window.location.href);
    if (langCode === 'ko') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', langCode);
    }
    
    // 페이지 새로고침
    window.location.href = url.toString();
  };

  // 페이지 로드 시 URL 파라미터 확인 및 초기 언어 설정
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    const tempLangParam = urlParams.get('temp_lang');
    
    // 임시 언어 파라미터가 있으면 처리
    if (tempLangParam && ['en', 'zh', 'ja'].includes(tempLangParam)) {
      // 임시 파라미터 제거하고 정식 언어 파라미터로 대체
      const url = new URL(window.location.href);
      url.searchParams.delete('temp_lang');
      url.searchParams.set('lang', tempLangParam);
      // 한국어로 페이지가 로드된 후 선택한 언어로 다시 새로고침
      window.location.href = url.toString();
      return;
    }
    
    if (langParam && ['en', 'zh', 'ja'].includes(langParam)) {
      // URL에 언어 파라미터가 있으면 해당 언어로 설정
      setCurrentLang(langParam);
    } else {
      // 언어 파라미터가 없으면 한국어로 초기화
      setCurrentLang('ko');
    }
  }, []);
  
  // 언어 설정 후 초기 번역 실행
  useEffect(() => {
    if (currentLang && currentLang !== 'ko') {
      const timer = setTimeout(() => {
        translatePage(currentLang);
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (currentLang === 'ko') {
      restoreOriginal();
    }
  }, [currentLang]);
  
  // 뷰가 변경될 때 현재 언어로 다시 번역
  useEffect(() => {
    // currentView가 'editor'로 변경되고 현재 언어가 한국어가 아닌 경우만 번역
    if (currentView === 'editor' && currentLang && currentLang !== 'ko') {
      // 약간의 지연을 두어 DOM이 완전히 렌더링되도록 함
      const timer = setTimeout(() => {
        translatePage(currentLang);
      }, 700);
      
      // cleanup 함수로 타이머 정리
      return () => clearTimeout(timer);
    }
  }, [currentView]); // currentLang을 의존성에서 제거하여 무한 루프 방지

  const currentLanguage = languages.find(lang => lang.code === currentLang);

  return (
    <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
          disabled={isTranslating}
        >
          {isTranslating ? (
            <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full" />
          ) : (
            <span className="text-xl">{currentLanguage.flag}</span>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {isTranslating ? '번역중...' : currentLanguage.name}
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
                disabled={isTranslating}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  currentLang === lang.code ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      {/* API 키 경고 메시지 */}
      {!API_KEY && (
        <div className="absolute top-full mt-2 right-0 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 rounded text-xs max-w-xs">
          ⚠️ Google Translate API 키가 설정되지 않았습니다.
        </div>
      )}
    </div>
  );
}

export default GoogleTranslateAPI;