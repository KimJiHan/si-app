import React, { useState, useEffect } from 'react';
import translations from '../translations/translations.json';

function CustomTranslator() {
  const [currentLang, setCurrentLang] = useState('ko');
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  useEffect(() => {
    // 언어 변경 시 전체 페이지 텍스트 번역
    if (currentLang !== 'ko') {
      translatePage(currentLang);
    } else {
      restoreOriginal();
    }
  }, [currentLang]);

  const translatePage = (targetLang) => {
    const textNodes = getTextNodes(document.body);
    
    textNodes.forEach(node => {
      const originalText = node.textContent.trim();
      if (originalText && translations[originalText] && translations[originalText][targetLang]) {
        node.textContent = translations[originalText][targetLang];
        node.parentElement.setAttribute('data-original-text', originalText);
      }
    });
  };

  const restoreOriginal = () => {
    const elements = document.querySelectorAll('[data-original-text]');
    elements.forEach(element => {
      const textNode = getTextNodes(element)[0];
      if (textNode) {
        textNode.textContent = element.getAttribute('data-original-text');
        element.removeAttribute('data-original-text');
      }
    });
  };

  const getTextNodes = (element) => {
    const textNodes = [];
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // 스크립트나 스타일 태그 내부 텍스트는 제외
          const parent = node.parentElement;
          if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
            return NodeFilter.FILTER_REJECT;
          }
          // 빈 텍스트 노드 제외
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

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // 로컬 스토리지에 선택한 언어 저장
    localStorage.setItem('selectedLanguage', langCode);
  };

  // 페이지 로드 시 저장된 언어 설정 불러오기
  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && savedLang !== 'ko') {
      setCurrentLang(savedLang);
    }
  }, []);

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
    </div>
  );
}

export default CustomTranslator;