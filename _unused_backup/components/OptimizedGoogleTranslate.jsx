import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// 성능 최적화된 Google Translate 컴포넌트
function OptimizedGoogleTranslate({ currentView = 'gallery' }) {
  const [currentLang, setCurrentLang] = useState('ko');
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // 번역 캐시를 useRef로 관리하여 리렌더링 방지
  const translationCache = useRef(new Map());
  const originalTextsMap = useRef(new Map());
  const abortControllerRef = useRef(null);
  
  // 환경 변수에서 API 키 가져오기 (Gemini API 키와 동일)
  const API_KEY = import.meta.env.VITE_TRANSLATE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  // 언어 데이터를 useMemo로 메모이제이션
  const languages = useMemo(() => [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ], []);
  
  // 텍스트 노드 수집 최적화
  const getTextNodes = useCallback((element) => {
    const textNodes = [];
    const excludeTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'META']);
    
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent || excludeTags.has(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          const text = node.textContent.trim();
          if (!text || text.length < 2) { // 2글자 미만은 무시
            return NodeFilter.FILTER_REJECT;
          }
          
          // 숫자나 특수문자만 있는 경우 무시
          if (/^[\d\s\W]+$/.test(text)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walk.nextNode()) {
      textNodes.push(node);
    }
    return textNodes;
  }, []);
  
  // 번역 API 호출 최적화 (배치 처리 및 캐싱)
  const translateBatch = useCallback(async (texts, targetLang, signal) => {
    if (!API_KEY || API_KEY === 'your_translation_api_key_here' || API_KEY === 'your_gemini_api_key_here') {
      console.warn('Translation API key not configured');
      return texts; // 원본 텍스트 반환
    }
    
    if (texts.length === 0) return [];

    // 캐시에서 이미 번역된 텍스트 확인
    const cacheKey = (text) => `${text}_${targetLang}`;
    const uncachedTexts = [];
    const cachedResults = new Map();
    
    texts.forEach((text, index) => {
      const key = cacheKey(text);
      if (translationCache.current.has(key)) {
        cachedResults.set(index, translationCache.current.get(key));
      } else {
        uncachedTexts.push({ text, originalIndex: index });
      }
    });

    // 캐시되지 않은 텍스트만 번역
    if (uncachedTexts.length > 0) {
      try {
        const response = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal,
            body: JSON.stringify({
              q: uncachedTexts.map(item => item.text),
              source: 'ko',
              target: targetLang,
              format: 'text'
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Translation API error:', response.status, errorData);
          throw new Error(`Translation API failed: ${response.status}`);
        }

        const data = await response.json();
        const translations = data.data.translations;
        
        // 결과를 캐시에 저장
        uncachedTexts.forEach((item, idx) => {
          const translation = translations[idx].translatedText;
          const key = cacheKey(item.text);
          translationCache.current.set(key, translation);
          cachedResults.set(item.originalIndex, translation);
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Translation error:', error);
        }
        return texts; // 오류 시 원본 텍스트 반환
      }
    }

    // 결과를 원래 순서대로 정렬
    return texts.map((_, index) => cachedResults.get(index) || texts[index]);
  }, [API_KEY]);

  // 페이지 번역 최적화
  const translatePage = useCallback(async (targetLang) => {
    // 이전 번역 작업 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 한국어로 복원
    if (targetLang === 'ko') {
      restoreOriginal();
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setIsTranslating(true);
    
    // requestIdleCallback을 사용하여 유휴 시간에 처리
    const processTranslation = async () => {
      try {
        const textNodes = getTextNodes(document.body);
        const textsToTranslate = [];
        const nodeIndices = [];

        // 원본 텍스트 저장 및 수집
        textNodes.forEach((node, index) => {
          const text = node.textContent.trim();
          if (text) {
            // 원본 텍스트 저장
            if (!originalTextsMap.current.has(node)) {
              originalTextsMap.current.set(node, text);
            }
            textsToTranslate.push(text);
            nodeIndices.push(index);
          }
        });

        // 배치 크기 최적화 (50개씩 처리)
        const batchSize = 50;
        for (let i = 0; i < textsToTranslate.length; i += batchSize) {
          if (signal.aborted) break;
          
          const batch = textsToTranslate.slice(i, i + batchSize);
          const translations = await translateBatch(batch, targetLang, signal);
          
          // DOM 업데이트 최적화 (requestAnimationFrame 사용)
          requestAnimationFrame(() => {
            batch.forEach((_, batchIndex) => {
              const nodeIndex = nodeIndices[i + batchIndex];
              const node = textNodes[nodeIndex];
              if (node && translations[batchIndex]) {
                node.textContent = translations[batchIndex];
              }
            });
          });
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Translation error:', error);
        }
      } finally {
        setIsTranslating(false);
        abortControllerRef.current = null;
      }
    };

    // requestIdleCallback이 지원되면 사용, 아니면 setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(processTranslation);
    } else {
      setTimeout(processTranslation, 0);
    }
  }, [getTextNodes, translateBatch]);

  // 원래 텍스트로 복원 최적화
  const restoreOriginal = useCallback(() => {
    originalTextsMap.current.forEach((originalText, node) => {
      if (node && node.textContent !== originalText) {
        node.textContent = originalText;
      }
    });
  }, []);

  // 언어 변경 핸들러
  const handleLanguageChange = useCallback((langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }
    
    // 페이지 새로고침 대신 번역만 수행 (성능 최적화)
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // URL 파라미터 업데이트 (새로고침 없이)
    const url = new URL(window.location.href);
    if (langCode === 'ko') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', langCode);
    }
    window.history.replaceState({}, '', url.toString());
    
    // 번역 실행
    translatePage(langCode);
  }, [currentLang, translatePage]);

  // 초기 언어 설정
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    
    if (langParam && ['en', 'zh', 'ja'].includes(langParam)) {
      setCurrentLang(langParam);
      // 초기 로드 시 약간의 지연 후 번역
      const timer = setTimeout(() => translatePage(langParam), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  // 뷰 변경 시 번역 유지
  useEffect(() => {
    if (currentView === 'editor' && currentLang !== 'ko') {
      const timer = setTimeout(() => translatePage(currentLang), 500);
      return () => clearTimeout(timer);
    }
  }, [currentView, currentLang, translatePage]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const currentLanguage = useMemo(
    () => languages.find(lang => lang.code === currentLang),
    [languages, currentLang]
  );
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
        disabled={isTranslating}
        aria-label="언어 선택"
        aria-expanded={isOpen}
      >
        {isTranslating ? (
          <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full" />
        ) : (
          <span className="text-xl" role="img" aria-label={currentLanguage.name}>
            {currentLanguage.flag}
          </span>
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {isTranslating ? '번역중...' : currentLanguage.name}
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
              disabled={isTranslating}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                currentLang === lang.code ? 'bg-gray-50 dark:bg-gray-700/50' : ''
              } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      
      {/* API 키 미설정 경고 (프로덕션에서는 숨김) */}
      {!API_KEY && import.meta.env.DEV && (
        <div className="absolute top-full mt-2 right-0 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-2 rounded text-xs max-w-xs">
          ⚠️ Translation API key not configured
        </div>
      )}
    </div>
  );
}

export default OptimizedGoogleTranslate;