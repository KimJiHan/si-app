// Google Translate Widget 모니터링 유틸리티

class TranslationMonitor {
  constructor() {
    this.isInitialized = false;
    this.currentLanguage = 'ko';
    this.translationStatus = 'idle';
    this.observers = [];
    this.debugMode = true; // 디버그 모드 활성화
  }

  // 초기화 상태 확인
  checkInitialization() {
    const hasGoogleTranslate = !!(window.google && window.google.translate);
    const hasTranslateElement = !!document.getElementById('google_translate_element');
    const hasTranslateScript = !!document.querySelector('script[src*="translate.google.com"]');
    
    this.isInitialized = hasGoogleTranslate;
    
    const status = {
      hasGoogleTranslate,
      hasTranslateElement,
      hasTranslateScript,
      isInitialized: this.isInitialized,
      timestamp: new Date().toISOString()
    };
    
    if (this.debugMode) {
      console.log('[Translation Monitor] Initialization Status:', status);
    }
    
    return status;
  }

  // 현재 번역 언어 확인
  getCurrentLanguage() {
    try {
      // Google Translate 쿠키에서 언어 정보 추출
      const googTransCookie = this.getCookie('googtrans');
      if (googTransCookie) {
        const match = googTransCookie.match(/\/ko\/([a-z-]+)/i);
        if (match) {
          this.currentLanguage = match[1];
        }
      }
      
      // 선택된 언어 요소에서 확인
      const selectedLang = document.querySelector('.goog-te-combo');
      if (selectedLang && selectedLang.value) {
        this.currentLanguage = selectedLang.value || 'ko';
      }
      
      if (this.debugMode) {
        console.log('[Translation Monitor] Current Language:', this.currentLanguage);
      }
      
      return this.currentLanguage;
    } catch (error) {
      console.error('[Translation Monitor] Error getting current language:', error);
      return 'ko';
    }
  }

  // 번역 상태 모니터링
  monitorTranslationStatus() {
    const bodyElement = document.body;
    const hasTranslateClass = bodyElement.classList.contains('translated-ltr') || 
                             bodyElement.classList.contains('translated-rtl');
    
    const translateFrame = document.querySelector('.goog-te-banner-frame');
    const isTranslating = translateFrame && translateFrame.style.display !== 'none';
    
    if (isTranslating) {
      this.translationStatus = 'translating';
    } else if (hasTranslateClass) {
      this.translationStatus = 'translated';
    } else {
      this.translationStatus = 'idle';
    }
    
    const status = {
      status: this.translationStatus,
      hasTranslateClass,
      isTranslating,
      currentLanguage: this.getCurrentLanguage(),
      timestamp: new Date().toISOString()
    };
    
    if (this.debugMode) {
      console.log('[Translation Monitor] Translation Status:', status);
    }
    
    return status;
  }

  // DOM 변경 감지
  observeTranslationChanges(callback) {
    const observer = new MutationObserver((mutations) => {
      const hasTextChanges = mutations.some(mutation => 
        mutation.type === 'characterData' || 
        (mutation.type === 'childList' && mutation.addedNodes.length > 0)
      );
      
      if (hasTextChanges) {
        const status = this.monitorTranslationStatus();
        if (callback) {
          callback(status);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true
    });

    this.observers.push(observer);
    
    if (this.debugMode) {
      console.log('[Translation Monitor] Started observing DOM changes');
    }
    
    return observer;
  }

  // 번역 이벤트 리스너
  addTranslationEventListeners() {
    // 언어 변경 감지
    document.addEventListener('change', (event) => {
      if (event.target && event.target.className && 
          event.target.className.includes('goog-te-combo')) {
        const newLang = event.target.value;
        if (this.debugMode) {
          console.log('[Translation Monitor] Language changed to:', newLang);
        }
        this.currentLanguage = newLang || 'ko';
      }
    });

    // 번역 완료 감지 (간접적)
    let lastBodyClass = document.body.className;
    setInterval(() => {
      const currentBodyClass = document.body.className;
      if (currentBodyClass !== lastBodyClass) {
        lastBodyClass = currentBodyClass;
        const status = this.monitorTranslationStatus();
        if (this.debugMode) {
          console.log('[Translation Monitor] Body class changed:', status);
        }
      }
    }, 1000);
  }

  // 번역 성능 측정
  measureTranslationPerformance() {
    const startTime = performance.now();
    
    // 번역 요소들 카운트
    const translatedElements = document.querySelectorAll('[class*="translated"]').length;
    const totalTextNodes = this.countTextNodes(document.body);
    
    const endTime = performance.now();
    
    const metrics = {
      measurementTime: endTime - startTime,
      translatedElements,
      totalTextNodes,
      translationRatio: totalTextNodes > 0 ? translatedElements / totalTextNodes : 0,
      timestamp: new Date().toISOString()
    };
    
    if (this.debugMode) {
      console.log('[Translation Monitor] Performance Metrics:', metrics);
    }
    
    return metrics;
  }

  // 텍스트 노드 카운트
  countTextNodes(element) {
    let count = 0;
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    while (walk.nextNode()) {
      if (walk.currentNode.textContent.trim()) {
        count++;
      }
    }
    
    return count;
  }

  // 쿠키 읽기 유틸리티
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }

  // 전체 상태 리포트
  getFullReport() {
    const initialization = this.checkInitialization();
    const translationStatus = this.monitorTranslationStatus();
    const performance = this.measureTranslationPerformance();
    
    const report = {
      initialization,
      translationStatus,
      performance,
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages
      },
      timestamp: new Date().toISOString()
    };
    
    if (this.debugMode) {
      console.log('[Translation Monitor] Full Report:', report);
    }
    
    return report;
  }

  // 정리
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    if (this.debugMode) {
      console.log('[Translation Monitor] Cleaned up observers');
    }
  }
}

// 싱글톤 인스턴스
const translationMonitor = new TranslationMonitor();

export default translationMonitor;