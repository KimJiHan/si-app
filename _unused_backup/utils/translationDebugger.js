// 번역 디버거 - 번역되지 않는 요소 찾기

export function debugTranslation() {
  console.group('🔍 번역 디버깅 시작');
  
  // 한국어 텍스트 찾기
  const koreanRegex = /[가-힣]/;
  const allTextNodes = [];
  const untranslatedNodes = [];
  
  // 모든 텍스트 노드 수집
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const text = node.textContent.trim();
        if (!text) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent.trim();
    if (text) {
      allTextNodes.push({
        node,
        text,
        parent: node.parentElement,
        path: getNodePath(node.parentElement)
      });
      
      // 한국어가 포함된 노드 찾기
      if (koreanRegex.test(text)) {
        untranslatedNodes.push({
          node,
          text,
          parent: node.parentElement,
          path: getNodePath(node.parentElement)
        });
      }
    }
  }
  
  // 속성 확인
  const elementsWithAttrs = document.querySelectorAll('[placeholder], [title], [alt], [aria-label]');
  const untranslatedAttrs = [];
  
  elementsWithAttrs.forEach(elem => {
    ['placeholder', 'title', 'alt', 'aria-label'].forEach(attr => {
      const value = elem.getAttribute(attr);
      if (value && koreanRegex.test(value)) {
        untranslatedAttrs.push({
          element: elem,
          attribute: attr,
          value,
          path: getNodePath(elem)
        });
      }
    });
  });
  
  // 결과 출력
  console.log(`📊 전체 텍스트 노드: ${allTextNodes.length}개`);
  console.log(`❌ 번역되지 않은 텍스트 노드: ${untranslatedNodes.length}개`);
  console.log(`❌ 번역되지 않은 속성: ${untranslatedAttrs.length}개`);
  
  if (untranslatedNodes.length > 0) {
    console.group('번역되지 않은 텍스트:');
    untranslatedNodes.forEach((item, index) => {
      console.log(`${index + 1}. "${item.text}"`);
      console.log(`   위치: ${item.path}`);
      console.log(`   요소:`, item.parent);
    });
    console.groupEnd();
  }
  
  if (untranslatedAttrs.length > 0) {
    console.group('번역되지 않은 속성:');
    untranslatedAttrs.forEach((item, index) => {
      console.log(`${index + 1}. ${item.attribute}="${item.value}"`);
      console.log(`   위치: ${item.path}`);
      console.log(`   요소:`, item.element);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return {
    total: allTextNodes.length,
    untranslatedText: untranslatedNodes,
    untranslatedAttrs: untranslatedAttrs,
    successRate: ((allTextNodes.length - untranslatedNodes.length) / allTextNodes.length * 100).toFixed(2) + '%'
  };
}

// 요소 경로 생성
function getNodePath(element) {
  if (!element) return 'unknown';
  
  const path = [];
  let current = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector += `#${current.id}`;
    } else if (current.className) {
      const classes = current.className.split(' ').filter(c => c).slice(0, 2);
      if (classes.length > 0) {
        selector += `.${classes.join('.')}`;
      }
    }
    
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

// 번역 커버리지 테스트
export function testTranslationCoverage() {
  console.group('📈 번역 커버리지 테스트');
  
  // 페이지의 모든 한국어 텍스트 찾기
  const koreanTexts = findAllKoreanText();
  console.log(`🇰🇷 한국어 텍스트 발견: ${koreanTexts.length}개`);
  
  // 언어 변경 시뮬레이션
  const translateButton = document.querySelector('[aria-label="언어 선택"]');
  if (!translateButton) {
    console.error('❌ 번역 버튼을 찾을 수 없습니다');
    console.groupEnd();
    return;
  }
  
  console.log('✅ 번역 버튼 발견');
  console.log('💡 영어로 번역 후 다시 이 함수를 실행하여 결과를 비교하세요');
  
  // 현재 언어 확인
  const currentLang = getCurrentLanguage();
  console.log(`🌍 현재 언어: ${currentLang}`);
  
  if (currentLang !== 'ko') {
    // 번역 후 상태
    const remainingKorean = findAllKoreanText();
    const translationRate = ((koreanTexts.length - remainingKorean.length) / koreanTexts.length * 100).toFixed(2);
    
    console.log(`✅ 번역된 텍스트: ${koreanTexts.length - remainingKorean.length}개`);
    console.log(`❌ 번역되지 않은 텍스트: ${remainingKorean.length}개`);
    console.log(`📊 번역률: ${translationRate}%`);
    
    if (remainingKorean.length > 0) {
      console.group('번역 누락 항목:');
      remainingKorean.forEach((text, index) => {
        console.log(`${index + 1}. "${text}"`);
      });
      console.groupEnd();
    }
  }
  
  console.groupEnd();
}

// 모든 한국어 텍스트 찾기
function findAllKoreanText() {
  const koreanRegex = /[가-힣]/;
  const koreanTexts = new Set();
  
  // 텍스트 노드
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent.trim();
    if (text && koreanRegex.test(text)) {
      koreanTexts.add(text);
    }
  }
  
  // 속성
  document.querySelectorAll('[placeholder], [title], [alt], [aria-label]').forEach(elem => {
    ['placeholder', 'title', 'alt', 'aria-label'].forEach(attr => {
      const value = elem.getAttribute(attr);
      if (value && koreanRegex.test(value)) {
        koreanTexts.add(value);
      }
    });
  });
  
  return Array.from(koreanTexts);
}

// 현재 언어 확인
function getCurrentLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('lang') || 'ko';
}

// 전역 함수로 노출
if (typeof window !== 'undefined') {
  window.debugTranslation = debugTranslation;
  window.testTranslationCoverage = testTranslationCoverage;
  
  console.log('🛠️ 번역 디버깅 도구 활성화');
  console.log('사용법:');
  console.log('- debugTranslation(): 번역되지 않은 요소 찾기');
  console.log('- testTranslationCoverage(): 번역 커버리지 테스트');
}