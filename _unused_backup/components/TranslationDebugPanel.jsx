import React, { useState, useEffect } from 'react';
import translationMonitor from '../utils/translationMonitor';

function TranslationDebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // 키보드 단축키로 디버그 패널 토글 (Ctrl/Cmd + Shift + D)
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (isVisible) {
      // 초기 상태 로드
      updateDebugInfo();
      
      // 주기적으로 업데이트
      const interval = setInterval(updateDebugInfo, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const updateDebugInfo = () => {
    const report = translationMonitor.getFullReport();
    setDebugInfo(report);
  };

  const forceTranslationCheck = () => {
    console.log('[Debug Panel] Forcing translation check...');
    const report = translationMonitor.getFullReport();
    console.log('[Debug Panel] Full report:', report);
    updateDebugInfo();
  };

  const testTranslation = (lang) => {
    const langMap = {
      'en': 'en',
      'zh': 'zh-CN',
      'ja': 'ja'
    };
    
    const googleTranslateElement = document.querySelector('.goog-te-combo');
    if (googleTranslateElement) {
      googleTranslateElement.value = langMap[lang];
      googleTranslateElement.dispatchEvent(new Event('change'));
      setTimeout(updateDebugInfo, 2000);
    } else {
      alert('Google Translate element not found!');
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 left-4 bg-black bg-opacity-90 text-green-400 font-mono text-xs rounded-lg shadow-2xl ${isMinimized ? 'w-48' : 'w-96'} max-h-96 overflow-hidden z-[9999]`}>
      <div className="flex justify-between items-center p-3 border-b border-green-600 cursor-move">
        <h3 className="font-bold text-sm">Translation Debug Panel</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-green-400 hover:text-green-300"
          >
            {isMinimized ? '□' : '_'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-green-400 hover:text-green-300"
          >
            ✕
          </button>
        </div>
      </div>
      
      {!isMinimized && debugInfo && (
        <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
          {/* 초기화 상태 */}
          <div className="border border-green-800 rounded p-2">
            <h4 className="text-yellow-400 font-bold mb-1">Initialization Status</h4>
            <div className="text-xs space-y-1">
              <div>Google Translate: {debugInfo.initialization.hasGoogleTranslate ? '✅' : '❌'}</div>
              <div>Element Present: {debugInfo.initialization.hasTranslateElement ? '✅' : '❌'}</div>
              <div>Script Loaded: {debugInfo.initialization.hasTranslateScript ? '✅' : '❌'}</div>
            </div>
          </div>

          {/* 번역 상태 */}
          <div className="border border-green-800 rounded p-2">
            <h4 className="text-yellow-400 font-bold mb-1">Translation Status</h4>
            <div className="text-xs space-y-1">
              <div>Status: <span className="text-white">{debugInfo.translationStatus.status}</span></div>
              <div>Current Language: <span className="text-white">{debugInfo.translationStatus.currentLanguage}</span></div>
              <div>Has Translate Class: {debugInfo.translationStatus.hasTranslateClass ? '✅' : '❌'}</div>
            </div>
          </div>

          {/* 성능 메트릭 */}
          <div className="border border-green-800 rounded p-2">
            <h4 className="text-yellow-400 font-bold mb-1">Performance Metrics</h4>
            <div className="text-xs space-y-1">
              <div>Translated Elements: {debugInfo.performance.translatedElements}</div>
              <div>Total Text Nodes: {debugInfo.performance.totalTextNodes}</div>
              <div>Translation Ratio: {(debugInfo.performance.translationRatio * 100).toFixed(1)}%</div>
              <div>Measurement Time: {debugInfo.performance.measurementTime.toFixed(2)}ms</div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="border border-green-800 rounded p-2">
            <h4 className="text-yellow-400 font-bold mb-1">Debug Actions</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={forceTranslationCheck}
                className="px-2 py-1 bg-green-700 hover:bg-green-600 rounded text-xs"
              >
                Force Check
              </button>
              <button
                onClick={() => testTranslation('en')}
                className="px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs"
              >
                Test EN
              </button>
              <button
                onClick={() => testTranslation('zh')}
                className="px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs"
              >
                Test ZH
              </button>
              <button
                onClick={() => testTranslation('ja')}
                className="px-2 py-1 bg-purple-700 hover:bg-purple-600 rounded text-xs"
              >
                Test JA
              </button>
            </div>
          </div>

          {/* 타임스탬프 */}
          <div className="text-xs text-gray-400 text-right">
            Last Update: {new Date(debugInfo.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}

export default TranslationDebugPanel;