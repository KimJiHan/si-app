# Future Seoul App - AI 이미지 생성 애플리케이션

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.0.4-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Google_Gemini-2.0-4285F4?style=flat-square&logo=google&logoColor=white" alt="Google Gemini">
</p>

서울연구원의 서울 미래상을 다양한 예술 스타일로 AI가 재해석하여 생성하는 인터랙티브 웹 애플리케이션입니다. 사용자는 서울의 주요 랜드마크를 선택하고 원하는 예술 스타일을 적용하여 개인만의 서울 미래상을 창조할 수 있습니다.

🔗 **라이브 데모**: [https://kimjihan.github.io/si-app/](https://kimjihan.github.io/si-app/)

## ✨ 주요 기능

### 🏛️ 서울 랜드마크 갤러리
- **미래 서울**: 서울링, 노들 글로벌 예술섬, 용산국제업무지구
- **서울 랜드마크**: 동대문디자인플라자, 남산서울타워, 북촌한옥마을

### 🎨 AI 스타일 변환
- **아티스트 스타일** (10종): 반 고흐, 모네, 피카소, 클림트, 에곤 쉴레, 앤디 워홀, 쿠사마 야요이, 김홍도, 정선, 신윤복
- **자연 스타일** (3종): 벚꽃이 흩날리는 봄, 화려한 가을 단풍, 멋진 야경
- **애니메이션 스타일** (5종): 스튜디오 지브리, 픽사, 신카이 마코토, 디즈니, 드래곤볼

### 🌐 다국어 지원
- 한국어 (기본)
- English
- 中文
- 日本語

### 🎯 추가 기능
- 🌓 다크/라이트 테마 전환
- 📱 QR 코드 생성 및 공유
- 💾 이미지 다운로드
- 📱 반응형 디자인

## 🛠️ 기술 스택

### Frontend
- **React** 19.1.0 - 최신 버전의 React 프레임워크
- **Vite** 7.0.4 - 고속 번들러 및 개발 서버
- **Tailwind CSS** 3.4.17 - 유틸리티 우선 CSS 프레임워크

### AI & APIs
- **Google Gemini 2.0 Flash** - AI 이미지 생성
- **Google Cloud Translation API** - 다국어 번역 지원

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
│       ├── page1/          # 갤러리 이미지
│       └── page2/          # AI 에디터 참조 이미지
├── src/
│   ├── App.jsx             # 메인 애플리케이션
│   ├── components/         # React 컴포넌트
│   │   └── GoogleTranslateAPI.jsx
│   ├── translations/       # 번역 리소스
│   └── main.jsx           # 진입점
├── .github/
│   └── workflows/         # GitHub Actions
├── package.json           # 프로젝트 설정
└── vite.config.js        # Vite 설정
```

## 🔐 보안

이 프로젝트는 환경 변수를 통해 API 키를 안전하게 관리합니다:
- API 키는 절대 소스 코드에 포함되지 않습니다
- GitHub Secrets를 통한 안전한 배포
- `.env` 파일은 `.gitignore`에 포함되어 있습니다

자세한 내용은 [SECURITY.md](./SECURITY.md)를 참조하세요.

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

## 👏 감사의 말

- 서울연구원 - 서울 미래상 제공
- Google Gemini Team - AI 이미지 생성 API
- React & Vite Community - 훌륭한 개발 도구

## 📞 문의

프로젝트 관련 문의사항이 있으시면 [Issues](https://github.com/KimJiHan/si-app/issues)를 통해 연락주세요.

---

<p align="center">Made with ❤️ for Seoul's Future</p>
