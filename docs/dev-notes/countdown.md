# 터치스크린 환경을 위한 사용자 세션 자동 초기화 기능 구현 가이드

## 1. 기능 개요

### 1.1 목적
- 공공 터치스크린 키오스크에서 여러 사용자가 순차적으로 사용
- 이전 사용자의 세션이 다음 사용자에게 노출되지 않도록 자동 초기화
- 사용자가 중간에 이탈해도 시스템이 자동으로 처음 상태로 복구

### 1.2 동작 시나리오
1. 사용자가 일정 시간 동안 아무런 조작을 하지 않음
2. 경고 모달 표시 (예: "30초 후 처음 화면으로 돌아갑니다")
3. 카운트다운 표시 (30, 29, 28...)
4. 시간 내 터치 시 타이머 리셋
5. 시간 초과 시 자동으로 갤러리(처음) 화면으로 이동

## 2. 구현 전략

### 2.1 현재 애플리케이션 구조 분석
```javascript
// 현재 구조
- App.jsx: 모든 상태와 로직이 하나의 컴포넌트에 집중
- view 상태: 'gallery' | 'editor' | 'qr'
- 이미지 생성 후 상태가 유지됨
```

### 2.2 추천 구현 방법
**유휴 시간 감지 + 경고 모달 + 자동 리셋 방식**

#### 장점
- 사용자에게 충분한 경고 제공
- 실수로 초기화되는 것 방지
- 부드러운 사용자 경험
- 현재 디자인과 일관성 유지

## 3. 상세 구현 방법

### 3.1 필요한 상태 추가
```javascript
// App.jsx에 추가할 상태
const [lastActivityTime, setLastActivityTime] = useState(Date.now());
const [showInactivityModal, setShowInactivityModal] = useState(false);
const [countdown, setCountdown] = useState(30);
const activityTimerRef = useRef(null);
const countdownTimerRef = useRef(null);

// 설정 값 (상수)
const INACTIVITY_TIMEOUT = 60000; // 60초 - 유휴 시간 감지
const COUNTDOWN_SECONDS = 30; // 30초 - 경고 후 카운트다운
```

### 3.2 활동 감지 시스템
```javascript
// 모든 사용자 활동 감지
const updateActivity = useCallback(() => {
  setLastActivityTime(Date.now());
  setShowInactivityModal(false);
  
  // 카운트다운 중이었다면 초기화
  if (countdownTimerRef.current) {
    clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = null;
    setCountdown(COUNTDOWN_SECONDS);
  }
}, []);

// 전역 이벤트 리스너 설정
useEffect(() => {
  // 에디터 화면에서만 작동
  if (view === 'editor') {
    // 터치 이벤트
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('touchmove', updateActivity);
    
    // 마우스 이벤트 (개발/테스트용)
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('mousemove', updateActivity);
    
    // 키보드 이벤트
    window.addEventListener('keydown', updateActivity);
    
    return () => {
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('touchmove', updateActivity);
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }
}, [view, updateActivity]);
```

### 3.3 유휴 시간 체크 로직
```javascript
// 유휴 시간 체크
useEffect(() => {
  if (view === 'editor') {
    activityTimerRef.current = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityTime;
      
      if (inactiveTime >= INACTIVITY_TIMEOUT && !showInactivityModal) {
        // 경고 모달 표시
        setShowInactivityModal(true);
        startCountdown();
      }
    }, 1000); // 1초마다 체크
    
    return () => {
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
    };
  }
}, [view, lastActivityTime, showInactivityModal]);
```

### 3.4 카운트다운 로직
```javascript
const startCountdown = () => {
  setCountdown(COUNTDOWN_SECONDS);
  
  countdownTimerRef.current = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        // 시간 초과 - 초기화 실행
        clearInterval(countdownTimerRef.current);
        resetToGallery();
        return COUNTDOWN_SECONDS;
      }
      return prev - 1;
    });
  }, 1000);
};

// 갤러리로 리셋
const resetToGallery = () => {
  // 모든 상태 초기화
  setView('gallery');
  setSelectedLandmark(null);
  setSelectedCategory(null);
  setSelectedStyle(null);
  setIsGenerating(false);
  setGeneratedImage(null);
  setShowQrModal(false);
  setQrDataUrl(null);
  setShowInactivityModal(false);
  setCountdown(COUNTDOWN_SECONDS);
  
  // 타이머 정리
  if (activityTimerRef.current) {
    clearInterval(activityTimerRef.current);
  }
  if (countdownTimerRef.current) {
    clearInterval(countdownTimerRef.current);
  }
};
```

### 3.5 경고 모달 컴포넌트
```javascript
// InactivityModal 컴포넌트
const InactivityModal = ({ countdown, onContinue, onReset }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center">
          {/* 경고 아이콘 */}
          <div className="mx-auto w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold mb-4 dark:text-white">
            잠시 사용하지 않으셨네요
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            계속 사용하시려면 화면을 터치해주세요
          </p>
          
          {/* 카운트다운 표시 */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {countdown}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              초 후에 처음 화면으로 돌아갑니다
            </p>
          </div>
          
          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={onReset}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              처음으로
            </button>
            <button
              onClick={onContinue}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              계속하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 3.6 App.jsx에 통합
```javascript
// 모달 렌더링 추가 (return 문 내부)
{showInactivityModal && (
  <InactivityModal
    countdown={countdown}
    onContinue={updateActivity}
    onReset={resetToGallery}
  />
)}
```

## 4. 추가 고려사항

### 4.1 접근성
```javascript
// 스크린 리더를 위한 ARIA 라이브 리전
<div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
  {showInactivityModal && `${countdown}초 후에 처음 화면으로 돌아갑니다`}
</div>
```

### 4.2 시각적 피드백
```javascript
// 프로그레스 바 추가 (선택사항)
<div className="w-full bg-gray-200 rounded-full h-2 mt-4">
  <div 
    className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
    style={{ width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` }}
  />
</div>
```

### 4.3 설정 가능한 옵션
```javascript
// 환경 변수로 관리
const INACTIVITY_TIMEOUT = import.meta.env.VITE_INACTIVITY_TIMEOUT || 60000;
const COUNTDOWN_SECONDS = import.meta.env.VITE_COUNTDOWN_SECONDS || 30;

// 또는 관리자 설정 패널 구현
const [inactivityTimeout, setInactivityTimeout] = useState(60);
const [countdownSeconds, setCountdownSeconds] = useState(30);
```

## 5. 테스트 시나리오

### 5.1 정상 동작 테스트
1. 에디터에서 60초 동안 아무 동작 없음 → 모달 표시
2. 모달에서 30초 카운트다운 → 갤러리로 이동
3. 카운트다운 중 화면 터치 → 타이머 리셋

### 5.2 엣지 케이스
1. 이미지 생성 중 타임아웃 → 생성 완료 후 처리
2. QR 모달 표시 중 타임아웃 → QR 모달도 함께 닫기
3. 네트워크 오류 중 타임아웃 → 안전하게 초기화

## 6. 성능 최적화

### 6.1 이벤트 최적화
```javascript
// 디바운스를 사용한 mousemove 최적화
import { debounce } from 'lodash';

const debouncedUpdateActivity = useCallback(
  debounce(updateActivity, 1000),
  []
);

// mousemove는 디바운스 버전 사용
window.addEventListener('mousemove', debouncedUpdateActivity);
```

### 6.2 메모리 관리
```javascript
// 컴포넌트 언마운트 시 타이머 정리
useEffect(() => {
  return () => {
    if (activityTimerRef.current) clearInterval(activityTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  };
}, []);
```

## 7. 대안적 구현 방법

### 7.1 간단한 버전 (모달 없이)
```javascript
// 60초 후 바로 리셋
useEffect(() => {
  if (view === 'editor') {
    const timer = setTimeout(() => {
      resetToGallery();
    }, 60000);
    
    return () => clearTimeout(timer);
  }
}, [view, lastActivityTime]);
```

### 7.2 프로그레시브 경고
```javascript
// 단계별 경고: 노란색(30초) → 주황색(15초) → 빨간색(5초)
const getWarningColor = () => {
  if (countdown > 15) return 'bg-yellow-100';
  if (countdown > 5) return 'bg-orange-100';
  return 'bg-red-100';
};
```

## 8. 구현 우선순위

### 필수 구현 (1단계)
1. 기본 유휴 시간 감지
2. 경고 모달 표시
3. 카운트다운 기능
4. 갤러리로 리셋

### 선택 구현 (2단계)
1. 프로그레스 바
2. 소리/진동 알림
3. 관리자 설정
4. 사용 통계 수집

## 9. 예상 코드 변경량
- App.jsx: 약 150-200줄 추가
- 새 컴포넌트: InactivityModal (약 80줄)
- 전체 작업 시간: 4-6시간

## 10. 결론

이 구현 방법은 현재 애플리케이션의 구조를 크게 변경하지 않으면서도 효과적으로 자동 초기화 기능을 추가할 수 있습니다. 사용자 경험을 해치지 않으면서도 공공 키오스크 환경에 적합한 보안과 프라이버시를 제공합니다.