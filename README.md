# Future Seoul App - AI 이미지 생성 애플리케이션

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.0.4-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white" alt="Google Gemini">
</p>

서울연구원의 서울 미래상을 다양한 예술 스타일로 AI가 재해석하여 생성하는 인터랙티브 웹 애플리케이션입니다. 사용자는 서울의 주요 랜드마크를 선택하고 원하는 예술 스타일을 적용하여 개인만의 서울 미래상을 창조할 수 있습니다.

🔗 **라이브 데모**: [https://kimjihan.github.io/si-app/](https://kimjihan.github.io/si-app/)

## ✨ 주요 기능

### 🏛️ 서울 랜드마크 갤러리
- **미래 서울**: 서울링, 노들 글로벌 예술섬, 용산국제업무지구
- **서울 랜드마크**: 동대문디자인플라자, 남산서울타워, 북촌한옥마을
- **동영상 자동 재생**: 각 랜드마크별 MP4 동영상 오버레이

### 🎨 AI 스타일 변환 (39종)
- **아티스트 스타일** (11종): 반 고흐, 모네, 피카소, 클림트, 에곤 쉴레, 앤디 워홀, 쿠사마 야요이, 김홍도, 정선, 신윤복, 한국 전통 병풍
- **애니메이션 스타일** (11종): 스튜디오 지브리, 픽사, 드림웍스, 신카이 마코토, 디즈니, 드래곤볼, K-pop 데몬 헌터스, 미야자키 하야오 스타일, 원신 임팩트, 애니메이션 스타일, 카툰 스타일
- **미래도시 스타일** (7종): 사이버펑크 2077, 블레이드 러너, 인터스텔라, 창밖의 불빛, 네온 빛의 도시, 미래 사회의 인간과 기술, 탄소 제로 미래도시
- **일러스트 스타일** (10종): 수채화 일러스트, 미니멀리스트 라인 아트, 레트로 포스터, 디지털 아트, 스티커 아트, 3D 렌더링, 로우 폴리, 오일 파스텔, 벡터 아트, 기하학적 추상화

### 🌐 다국어 지원
- 한국어 (기본)
- English
- Google Translate 위젯 통합 (100+ 언어 자동 번역)

### 🎯 추가 기능
- 🌓 다크/라이트 테마 전환
- 📱 QR 코드 생성 및 공유
- 💾 이미지 다운로드
- 📱 반응형 디자인 (모바일 최적화)
- ⏱️ 세션 자동 초기화 (키오스크 모드 - 30초 유휴 감지)
- 🔄 이미지 재생성 안내 메시지
- 🎬 갤러리 동영상 자동 재생

## 🛠️ 기술 스택

### Frontend
- **React** 19.1.0 - 최신 버전의 React 프레임워크
- **Vite** 7.0.4 - 고속 번들러 및 개발 서버
- **Tailwind CSS** 3.4.17 - 유틸리티 우선 CSS 프레임워크

### AI & APIs
- **Google Gemini 2.5 Flash** - 최신 AI 이미지 생성 모델
- **Google Cloud Translation API** - 다국어 번역 지원
- **QRCode.js** - QR 코드 생성

### Deployment
- **GitHub Pages** - 정적 웹사이트 호스팅
- **GitHub Actions** - CI/CD 자동화

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.0 이상
- npm 또는 yarn
- Google Cloud API 키 (Gemini & Translation)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/KimJiHan/si-app.git
cd future-seoul-app
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
cp .env.example .env
```

`.env` 파일을 열어 API 키 입력:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_TRANSLATE_API_KEY=your_translation_api_key_here
```

4. **개발 서버 실행**
```bash
npm run dev
```

5. **브라우저에서 확인**
```
http://localhost:5173
```

## 📁 프로젝트 구조

```
future-seoul-app/
├── public/
│   └── image/
│       ├── page1/          # 갤러리 이미지 및 동영상
│       └── page2/          # AI 에디터 참조 이미지
├── src/
│   ├── App.jsx             # 메인 애플리케이션 (39개 스타일 프롬프트)
│   ├── components/         # React 컴포넌트
│   │   └── PersistentGoogleTranslate.jsx
│   ├── index.css          # Tailwind CSS 및 커스텀 애니메이션
│   └── main.jsx           # 진입점
├── docs/
│   └── dev-notes/         # 개발 문서
│       ├── countdown.md   # 세션 자동 초기화 기능
│       ├── translate.md   # 다국어 지원 가이드
│       └── si_app_project.md
├── .env.example           # 환경 변수 템플릿
├── CLAUDE.md             # 프로젝트 상세 문서
├── PROMPTS.md            # 39개 AI 스타일 프롬프트 문서
├── package.json          # 프로젝트 설정
└── vite.config.js       # Vite 설정
```

## 🔐 보안

이 프로젝트는 환경 변수를 통해 API 키를 안전하게 관리합니다:
- API 키는 절대 소스 코드에 포함되지 않습니다
- GitHub Secrets를 통한 안전한 배포
- `.env` 파일은 `.gitignore`에 포함되어 있습니다
- Google Cloud Console에서 도메인 제한 설정 권장
- API 사용량 할당량 설정 권장

## 🚀 배포

### GitHub Pages 자동 배포

main 브랜치에 푸시하면 GitHub Actions가 자동으로 배포합니다:

```bash
git push origin main
```

### GitHub Repository Secrets 설정

1. GitHub 저장소의 Settings → Secrets and variables → Actions 메뉴로 이동
2. 다음 두 개의 Secret을 추가:
   - `VITE_GEMINI_API_KEY`: Gemini API 키
   - `VITE_TRANSLATE_API_KEY`: Translation API 키

### 수동 배포

```bash
npm run build
npm run deploy
```

## 📈 최근 업데이트 (2025-09-04)

### 🎨 AI 프롬프트 엔지니어링 대폭 개선
- **픽사 스타일**: RenderMan 렌더링 엔진, 영화별 특징, Luxo Jr. ball 등 이스터에그 추가
- **드림웍스 스타일**: 대담한 색상, 역동적 카메라 앵글, DreamWorks 'smirk' 시그니처 추가
- **이미지 생성 안정성**: 회전 방지, 텍스트 생성 차단 프롬프트 강화

### 🔒 API 키 보안 강화
- `.env.example` 템플릿 파일 생성
- 환경 변수를 통한 안전한 API 키 관리
- GitHub Secrets를 통한 프로덕션 배포
- Gemini API와 Translation API 키 분리 관리 권장

### 💬 사용자 경험 개선
- 이미지 재생성 안내 메시지 추가
- 2단계 동적 콘텐츠 번역 기능 구현
- 갤러리 동영상 자동 재생 기능 추가

### 📚 문서화
- PROMPTS.md: 39개 스타일 프롬프트 완전 문서화
- CLAUDE.md: 프로젝트 상세 문서 업데이트

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

Copyright 2025 The Seoul Institute. All Rights Reserved.
