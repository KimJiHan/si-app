import React, { useState, useEffect, useRef, useCallback } from 'react';

// 안정적인 번역 컴포넌트 - 페이지 새로고침 방식
function StableGoogleTranslate({ currentView = 'gallery' }) {
  const [currentLang, setCurrentLang] = useState('ko');
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const translationCache = useRef(new Map());
  const originalTextsMap = useRef(new Map());
  const hasTranslated = useRef(false);
  
  const API_KEY = import.meta.env.VITE_TRANSLATE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];
  
  // 모든 텍스트 노드 수집
  const getAllTextNodes = useCallback(() => {
    const textNodes = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          // 제외할 태그
          const excludeTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'SVG'];
          if (excludeTags.includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          const text = node.textContent.trim();
          if (!text || text.length === 0) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    return textNodes;
  }, []);
  
  // 번역 API 호출
  const translateText = useCallback(async (texts, targetLang) => {
    if (!API_KEY || texts.length === 0) return texts;
    
    try {
      // 캐시 확인
      const cacheKey = (text) => `${text}_${targetLang}`;
      const uncachedTexts = [];
      const results = new Map();
      
      texts.forEach((text, index) => {
        const key = cacheKey(text);
        if (translationCache.current.has(key)) {
          results.set(index, translationCache.current.get(key));
        } else {
          uncachedTexts.push({ text, index });
        }
      });
      
      // 캐시되지 않은 텍스트만 번역
      if (uncachedTexts.length > 0) {
        const response = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: uncachedTexts.map(item => item.text),
              source: 'ko',
              target: targetLang,
              format: 'text'
            })
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const translations = data.data.translations;
          
          uncachedTexts.forEach((item, idx) => {
            const translation = translations[idx].translatedText;
            const key = cacheKey(item.text);
            translationCache.current.set(key, translation);
            results.set(item.index, translation);
          });
        }
      }
      
      return texts.map((_, index) => results.get(index) || texts[index]);
    } catch (error) {
      console.error('Translation error:', error);
      return texts;
    }
  }, [API_KEY]);
  
  // 페이지 번역
  const translatePage = useCallback(async (targetLang) => {
    if (targetLang === 'ko') {
      // 한국어로 복원하려면 페이지 새로고침
      const url = new URL(window.location.href);
      url.searchParams.delete('lang');
      window.location.href = url.toString();
      return;
    }
    
    setIsTranslating(true);
    
    try {
      const textNodes = getAllTextNodes();
      
      // 원본 텍스트 저장
      textNodes.forEach(node => {
        if (!originalTextsMap.current.has(node)) {
          originalTextsMap.current.set(node, node.textContent);
        }
      });
      
      // 배치로 번역
      const batchSize = 30;
      for (let i = 0; i < textNodes.length; i += batchSize) {
        const batch = textNodes.slice(i, i + batchSize);
        const texts = batch.map(node => originalTextsMap.current.get(node) || node.textContent);
        const translations = await translateText(texts, targetLang);
        
        // DOM 업데이트
        batch.forEach((node, idx) => {
          if (node && node.parentNode && translations[idx]) {
            node.textContent = translations[idx];
          }
        });
      }
      
      hasTranslated.current = true;
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  }, [getAllTextNodes, translateText]);
  
  // 언어 변경 처리
  const handleLanguageChange = useCallback((langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }
    
    // URL 업데이트하고 페이지 새로고침
    const url = new URL(window.location.href);
    
    if (langCode === 'ko') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', langCode);
    }
    
    // 페이지 새로고침으로 깨끗한 상태에서 번역
    window.location.href = url.toString();
  }, [currentLang]);
  
  // 초기 언어 설정 및 번역
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    
    if (langParam && ['en', 'zh', 'ja'].includes(langParam)) {
      setCurrentLang(langParam);
      
      // 페이지 로드 후 번역 실행
      if (!hasTranslated.current) {
        const timer = setTimeout(() => {
          translatePage(langParam);
        }, 500);
        return () => clearTimeout(timer);
      }
    } else {
      setCurrentLang('ko');
    }
  }, [translatePage]);
  
  // 뷰 변경 시 재번역
  useEffect(() => {
    if (currentLang !== 'ko' && currentView && !hasTranslated.current) {
      const timer = setTimeout(() => {
        translatePage(currentLang);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentView, currentLang, translatePage]);
  
  const currentLanguage = languages.find(lang => lang.code === currentLang);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
        disabled={isTranslating}
        aria-label="언어 선택"
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
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
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
      
      {/* 언어 변경 안내 메시지 */}
      {isTranslating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  언어를 변경하는 중입니다...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  잠시만 기다려주세요
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StableGoogleTranslate;