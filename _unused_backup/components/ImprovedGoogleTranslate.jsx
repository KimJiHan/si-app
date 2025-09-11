import React, { useState, useEffect, useRef, useCallback } from 'react';

// 개선된 Google Translate 컴포넌트 - 완전한 번역 지원
function ImprovedGoogleTranslate({ currentView = 'gallery' }) {
  const [currentLang, setCurrentLang] = useState('ko');
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  
  const translationCache = useRef(new Map());
  const originalTextsMap = useRef(new Map());
  const abortControllerRef = useRef(null);
  const observerRef = useRef(null);
  
  // API 키 가져오기
  const API_KEY = import.meta.env.VITE_TRANSLATE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];
  
  // 개선된 텍스트 노드 수집 - 모든 텍스트 요소 포함
  const getTranslatableElements = useCallback(() => {
    const elements = [];
    const processedNodes = new Set();
    
    // 번역 대상 선택자 확장
    const selectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'span', 'div', 'button', 'a', 'label',
      'li', 'td', 'th', 'strong', 'em', 'b', 'i',
      '.text-xs', '.text-sm', '.text-base', '.text-lg', '.text-xl',
      '.text-2xl', '.text-3xl', '.text-4xl', '.text-5xl',
      '[class*="text-"]'
    ];
    
    // 제외할 요소들
    const excludeSelectors = [
      'script', 'style', 'noscript', 'meta', 'code', 'pre',
      '.notranslate', '[data-no-translate]', 'svg'
    ];
    
    // 모든 선택자에 대해 요소 수집
    selectors.forEach(selector => {
      const nodes = document.querySelectorAll(selector);
      nodes.forEach(node => {
        // 제외 대상 확인
        if (excludeSelectors.some(exc => node.matches(exc))) return;
        if (processedNodes.has(node)) return;
        
        // 텍스트 노드 찾기
        const walker = document.createTreeWalker(
          node,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (textNode) => {
              const text = textNode.textContent.trim();
              if (!text) return NodeFilter.FILTER_REJECT;
              if (text.length < 1) return NodeFilter.FILTER_REJECT;
              
              // 부모 요소 확인
              const parent = textNode.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              
              // 제외할 부모 태그
              const excludeTags = ['SCRIPT', 'STYLE', 'CODE', 'PRE', 'SVG'];
              if (excludeTags.includes(parent.tagName)) {
                return NodeFilter.FILTER_REJECT;
              }
              
              // 이미 처리된 노드는 건너뛰기
              if (processedNodes.has(textNode)) {
                return NodeFilter.FILTER_REJECT;
              }
              
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );
        
        let textNode;
        while (textNode = walker.nextNode()) {
          if (!processedNodes.has(textNode)) {
            elements.push({
              node: textNode,
              text: textNode.textContent.trim(),
              type: 'text'
            });
            processedNodes.add(textNode);
          }
        }
      });
    });
    
    // placeholder, title, alt 속성도 번역
    const attributeElements = document.querySelectorAll('[placeholder], [title], [alt], [aria-label]');
    attributeElements.forEach(elem => {
      if (elem.placeholder && !processedNodes.has(elem.placeholder)) {
        elements.push({
          node: elem,
          text: elem.placeholder,
          type: 'placeholder',
          attribute: 'placeholder'
        });
      }
      if (elem.title && !processedNodes.has(elem.title)) {
        elements.push({
          node: elem,
          text: elem.title,
          type: 'title',
          attribute: 'title'
        });
      }
      if (elem.alt && !processedNodes.has(elem.alt)) {
        elements.push({
          node: elem,
          text: elem.alt,
          type: 'alt',
          attribute: 'alt'
        });
      }
      if (elem.getAttribute('aria-label') && !processedNodes.has(elem['aria-label'])) {
        elements.push({
          node: elem,
          text: elem.getAttribute('aria-label'),
          type: 'aria-label',
          attribute: 'aria-label'
        });
      }
    });
    
    return elements;
  }, []);
  
  // 번역 API 호출 (개선된 버전)
  const translateBatch = useCallback(async (texts, targetLang, signal) => {
    if (!API_KEY || API_KEY === 'your_translation_api_key_here') {
      console.warn('Translation API key not configured');
      return texts;
    }
    
    if (texts.length === 0) return [];
    
    // 캐시 확인
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
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
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
          throw new Error(`Translation API failed: ${response.status}`);
        }

        const data = await response.json();
        const translations = data.data.translations;
        
        // 캐시에 저장
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
        return texts;
      }
    }
    
    // 원래 순서대로 정렬
    return texts.map((_, index) => cachedResults.get(index) || texts[index]);
  }, [API_KEY]);
  
  // 페이지 번역 (개선된 버전)
  const translatePage = useCallback(async (targetLang) => {
    // 이전 번역 작업 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 한국어로 복원
    if (targetLang === 'ko') {
      restoreOriginal();
      setTranslationProgress(0);
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setIsTranslating(true);
    setTranslationProgress(0);
    
    try {
      // 번역 대상 요소 수집
      const elements = getTranslatableElements();
      console.log(`Found ${elements.length} elements to translate`);
      
      if (elements.length === 0) {
        setIsTranslating(false);
        return;
      }
      
      // 원본 텍스트 저장
      elements.forEach(elem => {
        const key = elem.type === 'text' ? elem.node : `${elem.node}_${elem.attribute}`;
        if (!originalTextsMap.current.has(key)) {
          originalTextsMap.current.set(key, elem.text);
        }
      });
      
      // 배치 처리 (25개씩)
      const batchSize = 25;
      const totalBatches = Math.ceil(elements.length / batchSize);
      
      for (let i = 0; i < elements.length; i += batchSize) {
        if (signal.aborted) break;
        
        const batch = elements.slice(i, i + batchSize);
        const texts = batch.map(elem => elem.text);
        const translations = await translateBatch(texts, targetLang, signal);
        
        // DOM 업데이트
        requestAnimationFrame(() => {
          batch.forEach((elem, idx) => {
            const translatedText = translations[idx];
            if (!translatedText) return;
            
            if (elem.type === 'text') {
              // 텍스트 노드 업데이트
              if (elem.node && elem.node.parentNode) {
                elem.node.textContent = translatedText;
              }
            } else {
              // 속성 업데이트
              if (elem.node) {
                elem.node.setAttribute(elem.attribute, translatedText);
              }
            }
          });
        });
        
        // 진행률 업데이트
        const progress = Math.round(((i + batchSize) / elements.length) * 100);
        setTranslationProgress(Math.min(progress, 100));
      }
      
      // 번역 완료
      setTranslationProgress(100);
      setTimeout(() => setTranslationProgress(0), 1000);
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Translation error:', error);
      }
    } finally {
      setIsTranslating(false);
      abortControllerRef.current = null;
    }
  }, [getTranslatableElements, translateBatch]);
  
  // 원본 텍스트 복원
  const restoreOriginal = useCallback(() => {
    originalTextsMap.current.forEach((originalText, key) => {
      if (typeof key === 'string' && key.includes('_')) {
        // 속성 복원
        const [node, attribute] = key.split('_');
        if (node && attribute) {
          node.setAttribute(attribute, originalText);
        }
      } else if (key && key.parentNode) {
        // 텍스트 노드 복원
        key.textContent = originalText;
      }
    });
  }, []);
  
  // DOM 변경 감지 및 자동 번역
  useEffect(() => {
    if (currentLang === 'ko') return;
    
    // MutationObserver 설정
    const observer = new MutationObserver((mutations) => {
      // 새로 추가된 요소가 있을 때만 번역
      const hasNewNodes = mutations.some(mutation => 
        mutation.addedNodes.length > 0
      );
      
      if (hasNewNodes && !isTranslating) {
        // 디바운스를 위한 타이머
        clearTimeout(observerRef.current);
        observerRef.current = setTimeout(() => {
          translatePage(currentLang);
        }, 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    return () => {
      observer.disconnect();
      if (observerRef.current) {
        clearTimeout(observerRef.current);
      }
    };
  }, [currentLang, isTranslating, translatePage]);
  
  // 언어 변경 처리
  const handleLanguageChange = useCallback((langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }
    
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // URL 파라미터 업데이트
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
      setTimeout(() => translatePage(langParam), 500);
    }
  }, []);
  
  // 뷰 변경 시 재번역
  useEffect(() => {
    if (currentLang !== 'ko') {
      const timer = setTimeout(() => translatePage(currentLang), 500);
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
          <div className="flex items-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full" />
            {translationProgress > 0 && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {translationProgress}%
              </span>
            )}
          </div>
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
      
      {/* 번역 진행 표시 */}
      {isTranslating && translationProgress > 0 && (
        <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            번역 진행중... {translationProgress}%
          </div>
          <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${translationProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ImprovedGoogleTranslate;