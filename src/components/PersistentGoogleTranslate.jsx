import React, { useState, useEffect, useRef, useCallback } from 'react';

// 언어 설정이 지속되는 번역 컴포넌트
function PersistentGoogleTranslate({ currentView = 'gallery', triggerTranslation = 0 }) {
  const [currentLang, setCurrentLang] = useState('ko');
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const translationCache = useRef(new Map());
  const originalTextsMap = useRef(new Map());
  const hasTranslatedRef = useRef(false); // useRef로 변경
  const isTranslatingRef = useRef(false); // useRef로 변경하여 재렌더링 방지
  const lastViewRef = useRef(currentView); // 마지막 뷰 추적
  
  const API_KEY = import.meta.env.VITE_TRANSLATE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];
  
  // localStorage 키
  const LANG_STORAGE_KEY = 'si-app-language';
  
  // 언어 설정 저장
  const saveLanguagePreference = (langCode) => {
    localStorage.setItem(LANG_STORAGE_KEY, langCode);
    // URL 파라미터도 업데이트
    const url = new URL(window.location.href);
    if (langCode === 'ko') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', langCode);
    }
    window.history.replaceState({}, '', url.toString());
  };
  
  // 언어 설정 불러오기
  const getLanguagePreference = () => {
    // 1. localStorage 확인
    const storedLang = localStorage.getItem(LANG_STORAGE_KEY);
    if (storedLang) {
      if (['ko', 'en'].includes(storedLang)) {
        return storedLang;
      }
    }
    
    // 2. URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang) {
      if (['en'].includes(urlLang)) {
        return urlLang;
      }
    }
    
    // 3. 기본값
    return 'ko';
  };
  
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
          
          // 제외할 태그 (SVG는 제외하지 않음 - 아이콘 텍스트 포함 가능)
          const excludeTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'CODE'];
          if (excludeTags.includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // 번역 제외 클래스 확인
          if (parent.classList.contains('notranslate') || parent.hasAttribute('data-no-translate')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // 번역 제외 클래스를 가진 부모 요소 확인
          if (parent.closest('.notranslate') || parent.closest('[data-no-translate]')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // 번역 버튼 자체는 제외
          if (parent.closest('[aria-label="언어 선택"]')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          const text = node.textContent.trim();
          if (!text || text.length === 0) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // 숫자만 있는 텍스트는 제외 (연도는 허용)
          if (/^\d+$/.test(text) && text.length < 4) {
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
    
    const apiTargetLang = targetLang;
    
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
              target: apiTargetLang,
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
        } else {
          const errorData = await response.text();
          console.error('Translation API error:', response.status, errorData);
          console.error('Target language was:', apiTargetLang);
        }
      }
      
      return texts.map((_, index) => results.get(index) || texts[index]);
    } catch (error) {
      console.error('Translation error:', error);
      return texts;
    }
  }, [API_KEY]);
  
  // HTML 콘텐츠를 가진 요소들 번역
  const translateHTMLElements = useCallback(async (targetLang) => {
    // h2, h3 요소들 찾기 (랜드마크 타이틀 및 에디터 단계 제목 포함)
    const headingElements = document.querySelectorAll('h2, h3');
    
    for (const element of headingElements) {
      if (element.innerHTML && !element.classList.contains('notranslate')) {
        // 원본 저장
        if (!originalTextsMap.current.has(element)) {
          originalTextsMap.current.set(element, element.innerHTML);
        }
        
        // HTML에서 텍스트 추출 (br 태그는 공백으로 변환)
        const htmlContent = originalTextsMap.current.get(element) || element.innerHTML;
        
        // br 태그로 나눈 각 부분을 개별적으로 번역
        const parts = htmlContent.split(/<br\s*\/?>/gi);
        const textParts = parts.map(part => {
          return part.replace(/<[^>]*>/g, '').trim();
        }).filter(text => text.length > 0);
        
        if (textParts.length > 0 && targetLang !== 'ko') {
          // 각 부분을 개별적으로 번역
          const translations = await translateText(textParts, targetLang);
          
          if (translations && translations.length > 0) {
            // 번역된 텍스트를 br 태그와 함께 재구성
            const translatedHTML = translations.join('<br/>');
            element.innerHTML = translatedHTML;
          }
        }
      }
    }
    
    // placeholder, title, alt 속성도 번역
    const elementsWithAttrs = document.querySelectorAll('[placeholder], [title], [alt]');
    for (const element of elementsWithAttrs) {
      if (!element.classList.contains('notranslate')) {
        const attrs = ['placeholder', 'title', 'alt'];
        for (const attr of attrs) {
          const value = element.getAttribute(attr);
          if (value && value.trim()) {
            const key = `${element}_${attr}`;
            if (!originalTextsMap.current.has(key)) {
              originalTextsMap.current.set(key, value);
            }
            
            if (targetLang !== 'ko') {
              const originalValue = originalTextsMap.current.get(key) || value;
              const translations = await translateText([originalValue], targetLang);
              if (translations[0]) {
                element.setAttribute(attr, translations[0]);
              }
            }
          }
        }
      }
    }
  }, [translateText]);

  // 페이지 번역
  const translatePage = useCallback(async (targetLang) => {
    console.log(`translatePage called with: ${targetLang}`);
    
    if (targetLang === 'ko') {
      // 한국어로 복원
      originalTextsMap.current.forEach((originalContent, element) => {
        if (element && element.parentNode) {
          if (element.nodeType === Node.TEXT_NODE) {
            element.textContent = originalContent;
          } else if (element.innerHTML !== undefined) {
            element.innerHTML = originalContent;
          }
        }
      });
      hasTranslatedRef.current = false;
      isTranslatingRef.current = false;
      setIsTranslating(false);
      return;
    }
    
    // 이미 번역 중이면 중복 실행 방지
    if (isTranslatingRef.current) {
      console.log('Already translating, skipping...');
      return;
    }
    
    isTranslatingRef.current = true;
    setIsTranslating(true);
    
    try {
      // HTML 요소들 먼저 번역
      await translateHTMLElements(targetLang);
      
      // 일반 텍스트 노드 번역
      const textNodes = getAllTextNodes();
      
      // 원본 텍스트 저장 (처음 한 번만)
      textNodes.forEach(node => {
        if (!originalTextsMap.current.has(node)) {
          originalTextsMap.current.set(node, node.textContent);
        }
      });
      
      // 배치로 번역 - 배치 간 적절한 딜레이 추가
      const batchSize = 20; // 배치 크기를 줄여 안정성 향상
      for (let i = 0; i < textNodes.length; i += batchSize) {
        const batch = textNodes.slice(i, i + batchSize);
        const texts = batch.map(node => {
          // 원본 텍스트 사용 (이미 번역된 경우를 대비)
          const original = originalTextsMap.current.get(node);
          return original || node.textContent;
        });
        
        const translations = await translateText(texts, targetLang);
        
        // DOM 업데이트
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            batch.forEach((node, idx) => {
              if (node && node.parentNode && translations[idx]) {
                node.textContent = translations[idx];
              }
            });
            resolve();
          });
        });
        
        // 배치 간 짧은 딜레이 추가 (API 제한 및 안정성을 위해)
        if (i + batchSize < textNodes.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      hasTranslatedRef.current = true;
      console.log('Translation completed');
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      isTranslatingRef.current = false;
      setIsTranslating(false);
    }
  }, [getAllTextNodes, translateText, translateHTMLElements]);
  
  // 언어 변경 처리
  const handleLanguageChange = useCallback((langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }
    
    // 언어 설정 저장
    saveLanguagePreference(langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // 항상 한국어 페이지로 먼저 이동 후 선택한 언어로 새로고침
    // 이렇게 하면 깨끗한 상태에서 번역이 이루어짐
    const url = new URL(window.location.href);
    url.searchParams.delete('lang'); // 먼저 lang 파라미터 제거 (한국어로 리셋)
    
    if (langCode !== 'ko') {
      // 한국어가 아닌 경우 lang 파라미터 추가
      url.searchParams.set('lang', langCode);
    }
    
    window.location.href = url.toString();
  }, [currentLang]);
  
  // 초기 언어 설정 및 번역 (마운트 시 한 번만 실행)
  useEffect(() => {
    const savedLang = getLanguagePreference();
    setCurrentLang(savedLang);
    
    // URL에 lang 파라미터가 있으면 페이지가 한국어로 로드된 후 번역 실행
    const urlParams = new URLSearchParams(window.location.search);
    const hasLangParam = urlParams.has('lang');
    
    if (savedLang !== 'ko' && hasLangParam) {
      // 초기 로드 시에만 번역 - 충분한 대기 시간 확보
      const timer = setTimeout(() => {
        translatePage(savedLang);
      }, 2000); // DOM이 완전히 로드될 때까지 충분히 대기
      return () => clearTimeout(timer);
    }
  }, []); // 빈 의존성 배열로 마운트 시에만 실행
  
  // 뷰 변경 감지 및 번역
  useEffect(() => {
    // 뷰가 실제로 변경되었는지 확인
    if (lastViewRef.current === currentView) {
      return;
    }
    
    console.log(`View changed from ${lastViewRef.current} to ${currentView}`);
    lastViewRef.current = currentView;
    
    const savedLang = getLanguagePreference();
    const urlParams = new URLSearchParams(window.location.search);
    const hasLangParam = urlParams.has('lang');
    
    // 한국어가 아니고 URL에 lang 파라미터가 있을 때만 번역
    if (savedLang !== 'ko' && hasLangParam) {
      // 뷰 변경 시 번역 상태 리셋 (한 번만 번역하도록)
      hasTranslatedRef.current = false;
      originalTextsMap.current.clear();
      
      // 에디터 페이지는 동적 컨텐츠가 많으므로 더 긴 대기 시간 필요
      const delay = currentView === 'editor' ? 2500 : 1500;
      const timer = setTimeout(() => {
        if (!hasTranslatedRef.current && !isTranslatingRef.current) {
          translatePage(savedLang);
        }
      }, delay); // 뷰에 따라 대기 시간 조정
      return () => clearTimeout(timer);
    }
  }, [currentView, translatePage]);
  
  // 동적 컨텐츠 번역 트리거 감지 (카운터 기반)
  useEffect(() => {
    // triggerTranslation이 0이 아니고 변경될 때마다 실행
    if (triggerTranslation > 0) {
      const savedLang = getLanguagePreference();
      const urlParams = new URLSearchParams(window.location.search);
      const hasLangParam = urlParams.has('lang');
      
      // 한국어가 아니고 URL에 lang 파라미터가 있을 때만 번역
      if (savedLang !== 'ko' && hasLangParam) {
        // 동적 컨텐츠가 렌더링될 시간을 기다림
        const timer = setTimeout(() => {
          if (!isTranslatingRef.current) {
            // 새로운 텍스트만 번역 (기존 원본 텍스트 맵은 유지)
            translatePage(savedLang);
          }
        }, 500); // DOM 업데이트 충분히 대기
        return () => clearTimeout(timer);
      }
    }
  }, [triggerTranslation, translatePage]);
  
  const currentLanguage = languages.find(lang => lang.code === currentLang);
  
  return (
    <>
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
            <span className="text-xl" role="img" aria-label={currentLanguage?.name}>
              {currentLanguage?.flag}
            </span>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {isTranslating ? '번역중...' : currentLanguage?.name}
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
      </div>
    </>
  );
}

export default PersistentGoogleTranslate;