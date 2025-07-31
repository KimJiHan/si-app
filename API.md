# API 및 컴포넌트 문서

이 문서는 **서울의 미래를 그리다** 애플리케이션의 주요 컴포넌트와 기능에 대한 상세한 설명을 제공합니다.

## 📋 목차

- [주요 컴포넌트](#주요-컴포넌트)
- [데이터 구조](#데이터-구조)
- [유틸리티 함수](#유틸리티-함수)
- [AI 통합](#ai-통합)
- [QR 코드 생성](#qr-코드-생성)
- [상태 관리](#상태-관리)

## 🧩 주요 컴포넌트

### App 컴포넌트
애플리케이션의 메인 루트 컴포넌트입니다.

```javascript
export default function App()
```

**주요 기능:**
- 전역 상태 관리 (선택된 랜드마크, 현재 뷰, 테마)
- 라우팅 (갤러리 ↔ 에디터 전환)
- 테마 토글 (다크/라이트 모드)
- QR 코드 라이브러리 동적 로딩
- 스크롤바 숨김 CSS 동적 적용

**상태:**
```javascript
const [selectedLandmark, setSelectedLandmark] = useState(null);
const [view, setView] = useState('gallery');
const [theme, setTheme] = useState('dark');
```

### LandmarkGallery 컴포넌트
랜드마크 갤러리 화면을 담당하는 컴포넌트입니다.

```javascript
function LandmarkGallery({ onSelect })
```

**Props:**
- `onSelect`: 랜드마크 선택 시 호출되는 콜백 함수

**주요 기능:**
- 자동 슬라이드 재생 (5초 간격)
- 수동 네비게이션 (이전/다음 버튼)
- 마우스 호버 시 자동 재생 일시정지
- 반응형 가로 스크롤
- 스크롤 위치 기반 현재 인덱스 추적

**상태:**
```javascript
const [currentIndex, setCurrentIndex] = useState(0);
const scrollContainerRef = useRef(null);
const autoPlayRef = useRef(null);
```

### MediaCard 컴포넌트
개별 랜드마크 카드를 렌더링하는 컴포넌트입니다.

```javascript
function MediaCard({ landmark, onSelect })
```

**Props:**
- `landmark`: 랜드마크 데이터 객체
- `onSelect`: 카드 클릭 시 호출되는 콜백

**주요 기능:**
- 이미지 지연 로딩 및 최적화
- 호버 효과 (스케일 확대)
- 그라디언트 오버레이
- 로딩 상태 표시

### Editor 컴포넌트
AI 이미지 생성 편집기 컴포넌트입니다.

```javascript
function Editor({ landmark, onBack })
```

**Props:**
- `landmark`: 선택된 랜드마크 객체
- `onBack`: 뒤로가기 콜백 함수

**주요 기능:**
- AI 프롬프트 옵션 선택
- Gemini AI API 호출
- 이미지 생성 및 표시
- 로딩 상태 관리
- 에러 처리
- QR 코드 생성 트리거

**상태:**
```javascript
const [options, setOptions] = useState({
  weatherSeason: 'none',
  time: 'none',
  cityscape: 'none',
  artStyle: 'none',
  cameraPosition: 'none',
});
const [generatedImage, setGeneratedImage] = useState(editorReferenceImage);
const [isBaseImage, setIsBaseImage] = useState(true);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
```

### QrModal 컴포넌트
QR 코드 생성 결과를 표시하는 모달 컴포넌트입니다.

```javascript
function QrModal({ qrCodeUrl, qrError, onClose })
```

**Props:**
- `qrCodeUrl`: 생성된 QR 코드의 데이터 URL
- `qrError`: QR 코드 생성 오류 메시지
- `onClose`: 모달 닫기 콜백

### ThemeToggler 컴포넌트
테마 전환 버튼 컴포넌트입니다.

```javascript
function ThemeToggler({ theme, toggleTheme })
```

**Props:**
- `theme`: 현재 테마 ('dark' | 'light')
- `toggleTheme`: 테마 전환 함수

## 📊 데이터 구조

### 랜드마크 데이터
```javascript
const landmarks = [
  {
    id: 'nodeul-island',           // 고유 식별자
    title: '노들 글로벌 예술섬',     // 표시 제목
    description: '한강의 중심...',  // 설명
    imageUrl: '/image/path.jpg',   // 갤러리용 이미지
    editorImageUrl: 'https://...'  // AI 편집용 참조 이미지
  }
  // ... 추가 랜드마크
];
```

**포함된 랜드마크:**
1. `nodeul-island` - 노들 글로벌 예술섬
2. `ddp-seoul-light` - DDP 서울라이트
3. `seoul-ring` - 서울링
4. `seoul-arena` - 서울 아레나
5. `digital-bio-city` - 창동상계 디지털 바이오 시티
6. `han-river-bus` - 한강 리버버스

### AI 프롬프트 옵션
```javascript
const promptOptions = {
  weatherSeason: {
    title: '날씨/계절',
    options: [
      { label: '없음', value: 'none' },
      { label: '맑은 날', value: 'a clear sunny day' },
      // ... 추가 옵션
    ]
  },
  time: {
    title: '시간대',
    options: [
      { label: '없음', value: 'none' },
      { label: '아침', value: 'morning with soft light' },
      // ... 추가 옵션
    ]
  },
  cityscape: {
    title: '도시배경',
    options: [
      { label: '없음', value: 'none' },
      { label: '고층빌딩 중심의 스마트시티', value: 'a futuristic smart city...' },
      // ... 추가 옵션
    ]
  },
  artStyle: {
    title: '그림 스타일',
    options: [
      { label: '없음', value: 'none' },
      { label: '실사풍', value: 'photorealistic' },
      { label: '빈센트 반 고흐', value: 'in the style of Vincent van Gogh' },
      // ... 추가 옵션
    ]
  },
  cameraPosition: {
    title: '카메라 위치',
    options: [
      { label: '없음', value: 'none' },
      { label: '아래에서 찍은', value: 'dramatic low-angle shot...' },
      // ... 추가 옵션
    ]
  }
};
```

## 🔧 유틸리티 함수

### toBase64 함수
이미지를 Base64 형식으로 변환합니다.

```javascript
async function toBase64(url)
```

**매개변수:**
- `url`: 변환할 이미지의 URL (로컬 또는 외부)

**반환값:**
- `Promise<string>`: Base64 인코딩된 데이터 URL

**기능:**
- 로컬 이미지와 외부 URL 구분 처리
- Weserv 프록시 서비스 활용 (외부 이미지)
- CORS 문제 해결
- 에러 처리 및 로깅

**사용 예시:**
```javascript
try {
  const base64 = await toBase64('/image/landmark.jpg');
  console.log('Base64 conversion successful');
} catch (error) {
  console.error('Image conversion failed:', error);
}
```

## 🤖 AI 통합

### Gemini AI API 연동
Google Gemini 2.0 Flash 모델을 사용한 이미지 생성 기능입니다.

**API 엔드포인트:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent
```

**요청 구조:**
```javascript
const geminiPayload = {
  contents: [{
    parts: [
      { text: textPrompt },      // 텍스트 프롬프트
      imagePart                  // 참조 이미지 (Base64)
    ]
  }],
  generationConfig: {
    "responseModalities": ["TEXT", "IMAGE"]
  }
};
```

**프롬프트 생성 로직:**
```javascript
let textPrompt = `Reimagine this landmark, '${landmark.title}', with the following characteristics, while strictly preserving its original architectural shape and structure. Generate the image in a 3:4 portrait aspect ratio.`;

// 조건부 프롬프트 추가
if (options.weatherSeason !== 'none') {
  textPrompt += `\nAtmosphere: ${options.weatherSeason}.`;
}
// ... 다른 옵션들 처리
```

**에러 처리:**
- API 과부하 상태 감지
- 네트워크 오류 처리
- 프록시 서비스 오류 대응
- 사용자 친화적 오류 메시지 제공

## 📱 QR 코드 생성

### QR 코드 생성 프로세스

1. **라이브러리 동적 로딩**
   ```javascript
   const script = document.createElement('script');
   script.src = "https://cdn.jsdelivr.net/npm/qrcode@1/build/qrcode.min.js";
   ```

2. **이미지 압축**
   ```javascript
   const MAX_DIMENSION = 300;
   const QUALITY = 0.6;
   // Canvas를 이용한 이미지 리사이징 및 압축
   ```

3. **QR 코드 생성**
   ```javascript
   const dataUrl = await window.QRCode.toDataURL(
     compressedDataUrl,
     { errorCorrectionLevel: 'L', width: 256 }
   );
   ```

**기능:**
- 이미지 자동 압축 (300x300px, JPEG 60% 품질)
- QR 코드 크기 최적화 (256x256px)
- 에러 복구 레벨 설정 (Low)
- 크로스 오리진 이미지 처리

## 🔄 상태 관리

### 전역 상태
애플리케이션 레벨에서 관리되는 상태들:

```javascript
// App 컴포넌트
const [selectedLandmark, setSelectedLandmark] = useState(null);
const [view, setView] = useState('gallery');          // 'gallery' | 'editor'
const [theme, setTheme] = useState('dark');           // 'dark' | 'light'
```

### 갤러리 상태
랜드마크 갤러리에서 관리되는 상태들:

```javascript
// LandmarkGallery 컴포넌트
const [currentIndex, setCurrentIndex] = useState(0);
const scrollContainerRef = useRef(null);
const autoPlayRef = useRef(null);
```

### 에디터 상태
AI 이미지 생성 에디터에서 관리되는 상태들:

```javascript
// Editor 컴포넌트
const [options, setOptions] = useState({
  weatherSeason: 'none',
  time: 'none',
  cityscape: 'none',
  artStyle: 'none',
  cameraPosition: 'none',
});

const [generatedImage, setGeneratedImage] = useState(editorReferenceImage);
const [isBaseImage, setIsBaseImage] = useState(true);
const [isLoading, setIsLoading] = useState(false);
const [loadingStep, setLoadingStep] = useState('');
const [error, setError] = useState(null);

// QR 관련 상태
const [showQrModal, setShowQrModal] = useState(false);
const [qrCodeUrl, setQrCodeUrl] = useState('');
const [qrError, setQrError] = useState('');
```

## 🎨 스타일링 시스템

### Tailwind CSS 클래스 사용
주요 스타일링 패턴:

```javascript
// 그라디언트 텍스트
"bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400"

// 다크 모드 지원
"bg-white dark:bg-black text-gray-900 dark:text-gray-100"

// 호버 효과
"group-hover:scale-105 group-hover:opacity-100"

// 반응형 디자인
"w-[65vw] max-w-sm text-xl md:text-2xl"
```

### 커스텀 CSS
```css
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

## 🔗 외부 서비스 통합

### Weserv Images 프록시
```javascript
const optimizedImageUrl = landmark.imageUrl.startsWith('/') 
  ? landmark.imageUrl 
  : `https://images.weserv.nl/?url=${encodeURIComponent(landmark.imageUrl)}&w=600&h=800&fit=cover&q=90&output=webp`;
```

**기능:**
- 이미지 리사이징 및 최적화
- WebP 형식 변환
- CORS 문제 해결
- 캐싱 지원

### Google Gemini API
현재 하드코딩된 API 키 사용 (프로덕션에서는 환경 변수 권장):
```javascript
const apiKey = "AIzaSyB6bBtaaopSbL5lf0gi8zSnKx2vzQlVMP8";
```

## 📱 반응형 디자인

### 브레이크포인트
- `sm`: 640px 이상
- `md`: 768px 이상  
- `lg`: 1024px 이상
- `xl`: 1280px 이상

### 주요 반응형 패턴
```javascript
// 헤더 텍스트 크기
"text-4xl sm:text-5xl md:text-6xl"

// 그리드 레이아웃
"grid-cols-1 lg:grid-cols-2"

// 카드 크기
"w-[65vw] max-w-sm"

// 패딩/마진
"py-12 md:py-20"
"px-4 sm:px-6 lg:px-8"
```