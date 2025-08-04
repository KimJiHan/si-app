# Future Seoul App - AI 이미지 생성 애플리케이션

## 프로젝트 개요

서울연구원의 서울 미래상을 다양한 예술 스타일로 AI가 재해석하여 생성하는 인터랙티브 웹 애플리케이션입니다. 사용자는 서울의 주요 랜드마크를 선택하고 원하는 예술 스타일을 적용하여 개인만의 서울 미래상을 창조할 수 있습니다.

## 기술 스택

- **Frontend**: React 19.1.0 + Vite 7.0.4
- **Styling**: Tailwind CSS 3.4.17
- **AI Integration**: Google Gemini 2.0 Flash (이미지 생성)
- **Deployment**: GitHub Pages
- **Development**: ESLint, PostCSS, Autoprefixer

## 애플리케이션 아키텍처

### 핵심 컴포넌트
```
App.jsx
├── LandmarkGallery (메인 갤러리)
│   └── MediaCard (개별 랜드마크 카드)
├── Editor (AI 이미지 생성 인터페이스)
└── QrModal (QR 코드 생성 모달)
```

### 주요 기능
1. **갤러리 뷰**: 6개 랜드마크를 1행 6열 그리드로 표시
2. **AI 이미지 생성**: 3가지 스타일 카테고리 (아티스트, 자연, 애니메이션)
3. **QR 코드 생성**: 생성된 이미지를 QR 코드로 공유
4. **다크/라이트 테마**: 사용자 환경에 맞는 테마 전환

## 최근 주요 작업 내용 (2025-08-04)

### ✅ UI/UX 대폭 개선
1. **갤러리 레이아웃 변경**
   - 기존: 스크롤 방식 슬라이더
   - 변경: 1행 6열 정적 그리드 레이아웃
   - 모든 랜드마크가 한 화면에 동시 표시
   - 전체화면 활용을 위한 마진 및 패딩 최소화
   - 갤러리 높이를 90%로 설정하여 화면 공간 최대 활용

2. **이미지 리소스 최적화** 
   - 한글 파일명 → 영문 파일명으로 복사 생성
   - 파일 호환성 및 웹 표준 준수 향상
   - 에디터 참조 이미지 로딩 문제 해결

3. **콘텐츠 구조 재정렬**
   ```
   미래 서울:
   1. 서울링
   2. 노들 글로벌 예술섬
   3. 용산국제업무지구
   
   서울 랜드마크:
   4. 동대문디자인플라자
   5. 남산서울타워
   6. 북촌한옥마을
   ```

4. **헤딩 및 설명 텍스트 개선**
   - 메인 헤딩: "나만의 스타일로 서울을 그려보세요!"
   - 상세 설명에 강조 표시(`<strong>`) 및 줄바꿈 추가
   - 사용자 친화적 문구로 전면 개편
   - 제목과 설명 사이에 줄바꿈 추가로 가독성 향상

### 🎨 디자인 시스템 개선
- 전체화면 좌우 마진 최소화 (`px-1 sm:px-2`)
- 갤러리 그리드 간격 축소 (`gap-0.5 sm:gap-1`)
- 상단 패딩 축소 (`pt-4 sm:pt-6`)
- 헤더 크기 조정 (`text-2xl sm:text-3xl md:text-4xl`)
- 설명 텍스트 크기 조정 (`text-xs sm:text-sm md:text-base`)
- 푸터 패딩 최소화 (`pt-2 pb-2`)
- 갤러리와 설명 사이 여백 확보 (`py-6 sm:py-8`)

## 파일 구조

```
future-seoul-app/
├── public/
│   └── image/
│       ├── page1/               # 갤러리용 이미지
│       └── page2/               # AI 에디터용 참조 이미지
├── src/
│   ├── App.jsx                  # 메인 애플리케이션 컴포넌트
│   ├── main.jsx                 # React 진입점
│   ├── index.css                # 글로벌 스타일 (Tailwind)
│   └── App.css                  # 앱 스타일
├── package.json                 # 프로젝트 의존성 및 스크립트
├── vite.config.js              # Vite 빌드 설정
├── tailwind.config.js          # Tailwind CSS 설정
└── CLAUDE.md                   # 이 문서
```

## 이미지 리소스 관리

### 디렉토리 구조
```
public/image/
├── page1/                       # 갤러리용 이미지
│   ├── seoul-ring.png          # 서울링
│   ├── namsan-tower.png        # 남산타워
│   ├── dongdaemun-design-plaza.png  # 동대문DDP
│   ├── bukchon-hanok.png       # 북촌한옥마을
│   ├── yongsan-business-district.png  # 용산국제업무지구
│   ├── nodeul-arts-island.png  # 노들예술섬
│   └── [한글명 파일들]         # 기존 파일 유지
└── page2/                       # AI 에디터용 참조 이미지
    ├── seoul-ring.jpg          # 서울링 참조
    ├── namsan-tower.jpg        # 남산타워 참조
    ├── ddp.jpg                 # DDP 참조
    ├── bukchon-hanok.jpg       # 북촌한옥마을 참조
    ├── yongsan-ibd.png         # 용산 IBD 참조
    ├── nodeul-island.jpg       # 노들섬 참조
    └── [한글명 파일들]         # 기존 파일 유지
```

### 이미지 처리 로직
- 로컬 이미지: Vite의 BASE_URL을 통한 처리
- 외부 이미지: Weserv 프록시를 통한 최적화
- Base64 이미지: AI 생성 이미지 직접 표시
- 한글 파일명 호환성 문제 해결 완료

## 개발 환경

### 실행 방법
```bash
# 개발 서버 시작 (포트 5173)
npm run dev

# 빌드
npm run build

# 배포 (GitHub Pages)
npm run deploy
```

### 현재 실행 상태
- **개발 서버**: ✅ 정상 실행 중
- **포트**: 5173
- **URL**: http://localhost:5173/si-app/

## AI 이미지 생성 시스템

### 지원 스타일 카테고리

#### 1. 아티스트 스타일 (10종)
- **서양 화가**: 반 고흐, 모네, 피카소, 클림트, 에곤 쉴레, 앤디 워홀, 쿠사마 야요이
- **한국 화가**: 김홍도, 정선, 신윤복

#### 2. 자연 스타일 (3종)
- 벚꽃이 흩날리는 봄
- 화려한 가을 단풍
- 멋진 야경

#### 3. 애니메이션 스타일 (5종)
- 스튜디오 지브리
- 픽사
- 신카이 마코토
- 디즈니
- 드래곤볼

### AI 프롬프트 엔지니어링
- 건축물 구조 보존 강조
- 스타일별 특화된 프롬프트 템플릿
- 3:4 세로 비율 고정
- 고품질 이미지 생성 옵션
- Google Gemini 2.0 Flash 모델 사용

## 배포 및 호스팅

### GitHub Pages 설정
- **Repository**: https://github.com/KimJiHan/si-app
- **Base URL**: `/si-app/`
- **빌드 도구**: Vite
- **자동 배포**: `npm run deploy` 명령어

### 환경 변수
```javascript
// Gemini API 키 (환경 변수화 필요)
const VITE_GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
```

## 성능 최적화

### 이미지 최적화
- Weserv 프록시를 통한 외부 이미지 최적화
- 로컬 이미지의 적절한 크기 조정
- 반응형 이미지 로딩

### 로딩 최적화
- 이미지 지연 로딩 구현
- 로딩 상태 표시 (스피너 애니메이션)
- 에러 처리 및 fallback 이미지

## 향후 개선 계획

### 🔒 보안 강화
- [ ] API 키 환경 변수화
- [ ] 클라이언트 사이드 API 키 노출 방지
- [ ] CORS 정책 검토

### 🎯 기능 개선
- [ ] 이미지 다운로드 기능 추가
- [ ] 소셜 미디어 공유 기능
- [ ] 이미지 생성 히스토리 관리
- [ ] 더 많은 예술 스타일 추가

### 📱 사용자 경험
- [ ] 모바일 최적화 강화
- [ ] 접근성 (a11y) 개선
- [ ] 다국어 지원 (영어/한국어)
- [ ] 사용법 가이드 추가

### ⚡ 성능 최적화
- [ ] 이미지 CDN 도입
- [ ] 코드 스플리팅
- [ ] 서비스 워커를 통한 캐싱
- [ ] 번들 크기 최적화

## 문제 해결 가이드

### 개발 서버 문제
```bash
# 포트 충돌 시
lsof -ti:5173 | xargs kill -9

# 캐시 문제 시
rm -rf node_modules/.vite
npm run dev
```

### 이미지 로딩 문제
- 한글 파일명 → 영문 파일명 사용
- Weserv 프록시 타임아웃 시 직접 경로 사용
- 브라우저 캐시 새로고침
- 이미지 경로가 BASE_URL을 포함하는지 확인

## 기술 지원

### 주요 의존성
- React 19.1.0 (최신 버전)
- Vite 7.0.4 (고속 번들러)
- Tailwind CSS 3.4.17 (유틸리티 CSS)
- Google Gemini API (AI 이미지 생성)
- QRCode.js (QR 코드 생성)

### 개발자 도구
- ESLint (코드 품질)
- PostCSS (CSS 처리)
- gh-pages (배포 자동화)

---

**최종 업데이트**: 2025-08-04  
**작성자**: Claude Code SuperClaude Framework  
**프로젝트 상태**: ✅ 정상 운영 중