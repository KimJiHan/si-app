// Google Translation API 테스트 유틸리티

export async function testTranslationAPI() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  // 1. API 키 확인
  const apiKey = import.meta.env.VITE_TRANSLATE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    results.tests.push({
      test: 'API Key Check',
      status: 'FAILED',
      error: 'No API key found in environment variables'
    });
    results.summary.failed++;
    console.error('❌ Translation API Test Failed: No API key');
    return results;
  }

  if (apiKey === 'your_translation_api_key_here' || apiKey === 'your_gemini_api_key_here') {
    results.tests.push({
      test: 'API Key Validation',
      status: 'WARNING',
      error: 'Default placeholder API key detected'
    });
    results.summary.warnings++;
  } else {
    results.tests.push({
      test: 'API Key Check',
      status: 'PASSED',
      message: 'API key found'
    });
    results.summary.passed++;
  }

  // 2. API 연결 테스트
  try {
    const testText = '안녕하세요';
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          q: [testText],
          source: 'ko',
          target: 'en',
          format: 'text'
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // 상세한 에러 분석
      let errorMessage = `HTTP ${response.status}`;
      let errorDetail = '';
      
      if (response.status === 403) {
        errorDetail = 'API key is invalid or doesn\'t have permission';
      } else if (response.status === 401) {
        errorDetail = 'Authentication failed - check API key';
      } else if (response.status === 400) {
        errorDetail = 'Bad request - check API parameters';
      } else if (response.status === 429) {
        errorDetail = 'Rate limit exceeded';
      }
      
      results.tests.push({
        test: 'API Connection Test',
        status: 'FAILED',
        error: errorMessage,
        detail: errorDetail,
        response: errorData
      });
      results.summary.failed++;
    } else {
      const data = await response.json();
      
      if (data.data && data.data.translations) {
        results.tests.push({
          test: 'API Connection Test',
          status: 'PASSED',
          message: 'Successfully connected to Translation API',
          result: data.data.translations[0].translatedText
        });
        results.summary.passed++;
      } else {
        results.tests.push({
          test: 'API Response Validation',
          status: 'WARNING',
          error: 'Unexpected response format',
          response: data
        });
        results.summary.warnings++;
      }
    }
  } catch (error) {
    results.tests.push({
      test: 'API Connection Test',
      status: 'FAILED',
      error: error.message,
      detail: 'Network error or CORS issue'
    });
    results.summary.failed++;
  }

  // 3. CORS 정책 확인
  try {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      results.tests.push({
        test: 'CORS Policy Check',
        status: 'INFO',
        message: 'Running on localhost - CORS should work'
      });
    } else if (origin.includes('github.io')) {
      results.tests.push({
        test: 'CORS Policy Check',
        status: 'INFO',
        message: 'Running on GitHub Pages - CORS should work'
      });
    }
  } catch (error) {
    results.tests.push({
      test: 'CORS Policy Check',
      status: 'WARNING',
      error: error.message
    });
    results.summary.warnings++;
  }

  // 4. API 할당량 확인
  if (results.summary.passed > 0) {
    try {
      // 여러 번역 요청으로 할당량 테스트
      const testTexts = ['테스트1', '테스트2', '테스트3'];
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: testTexts,
            source: 'ko',
            target: 'en',
            format: 'text'
          })
        }
      );

      if (response.ok) {
        results.tests.push({
          test: 'API Quota Test',
          status: 'PASSED',
          message: 'API quota available'
        });
        results.summary.passed++;
      }
    } catch (error) {
      results.tests.push({
        test: 'API Quota Test',
        status: 'WARNING',
        error: 'Could not verify API quota'
      });
      results.summary.warnings++;
    }
  }

  // 결과 출력
  console.group('🔍 Translation API Test Results');
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`⚠️ Warnings: ${results.summary.warnings}`);
  
  results.tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : 
                 test.status === 'FAILED' ? '❌' : 
                 test.status === 'WARNING' ? '⚠️' : 'ℹ️';
    console.log(`${icon} ${test.test}: ${test.status}`);
    if (test.error) console.error(`   Error: ${test.error}`);
    if (test.detail) console.log(`   Detail: ${test.detail}`);
    if (test.message) console.log(`   Message: ${test.message}`);
  });
  console.groupEnd();

  return results;
}

// 디버그 모드 활성화
export function enableTranslationDebug() {
  window.__TRANSLATION_DEBUG__ = true;
  console.log('🐛 Translation debug mode enabled');
  
  // API 호출 인터셉터
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (url && url.includes('translation.googleapis.com')) {
      console.group('📡 Translation API Call');
      console.log('URL:', url);
      if (args[1]) {
        console.log('Method:', args[1].method);
        if (args[1].body) {
          try {
            console.log('Body:', JSON.parse(args[1].body));
          } catch (e) {
            console.log('Body:', args[1].body);
          }
        }
      }
      console.groupEnd();
    }
    return originalFetch.apply(this, args);
  };
}

// 디버그 모드 비활성화
export function disableTranslationDebug() {
  window.__TRANSLATION_DEBUG__ = false;
  console.log('🐛 Translation debug mode disabled');
}