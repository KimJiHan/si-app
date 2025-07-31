# 서울의 미래를 그리다 (Future Seoul App)

서울연구원에서 개발한 인터랙티브 AI 이미지 생성 웹 애플리케이션입니다. 사용자가 서울의 미래 랜드마크를 선택하고, 다양한 옵션을 조합하여 AI가 나만의 서울 미래상을 창조할 수 있습니다.

## 📋 프로젝트 개요

**서울의 미래를 그리다**는 React 기반의 웹 애플리케이션으로, Google Gemini AI 모델을 활용하여 서울의 미래 공간을 개인의 취향에 맞게 재해석한 이미지를 생성합니다. 생성된 이미지는 QR 코드로 저장하고 공유할 수 있습니다.

### 주요 기능

- 🏗️ **6개 서울 미래 랜드마크** 갤러리 탐색
- 🎨 **AI 이미지 생성**: Gemini 2.0 Flash를 활용한 실시간 이미지 편집
- ⚙️ **맞춤 설정**: 날씨, 시간대, 도시배경, 그림 스타일, 카메라 위치 선택
- 📱 **QR 코드 생성**: 완성된 이미지를 QR 코드로 저장 및 공유
- 🌓 **다크/라이트 모드** 지원
- 📱 **반응형 디자인**: 모바일부터 데스크톱까지 완벽 지원

### 포함된 서울 미래 랜드마크

1. **노들 글로벌 예술섬** - 한강의 중심 노들섬을 자연과 예술의 공간으로
2. **DDP 서울라이트** - 동대문디자인플라자의 화려한 빛의 축제
3. **서울링** - 상암동 하늘공원의 세계 최대 규모 대관람차
4. **서울 아레나** - 창동역 인근의 K-POP 전문 음악 공연장
5. **창동상계 디지털 바이오 시티** - 바이오·의료 및 디지털 산업 중심지
6. **한강 리버버스** - 친환경 수상교통 시스템

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js** 18.0 이상
- **npm** 9.0 이상

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd future-seoul-app
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   
   브라우저에서 `http://localhost:5173`으로 접속하여 확인할 수 있습니다.

### 추가 명령어

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 코드 검사
npm run lint
```

## 🛠️ 기술 스택

### 프론트엔드
- **React 19.1.0** - 사용자 인터페이스 라이브러리
- **Vite 7.0.4** - 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS 3.4.17** - 유틸리티 기반 CSS 프레임워크

### AI 및 외부 서비스
- **Google Gemini 2.0 Flash** - AI 이미지 생성 모델
- **QRCode.js** - QR 코드 생성 라이브러리
- **Weserv Images** - 이미지 최적화 및 프록시 서비스

### 개발 도구
- **ESLint** - 코드 품질 관리
- **PostCSS** - CSS 후처리
- **Autoprefixer** - CSS 벤더 프리픽스 자동 추가

## 📁 프로젝트 구조

```
future-seoul-app/
├── public/
│   ├── image/                 # 랜드마크 이미지 자산
│   │   ├── Dongdaemun DDP/
│   │   ├── hanriverbus/
│   │   ├── noddle global art island/
│   │   ├── seoul arena/
│   │   └── seoulring/
│   └── vite.svg
├── src/
│   ├── App.jsx               # 메인 애플리케이션 컴포넌트
│   ├── main.jsx              # 애플리케이션 진입점
│   ├── index.css             # 전역 스타일
│   └── assets/
├── dist/                     # 빌드 결과물
├── node_modules/             # 의존성 패키지
├── eslint.config.js          # ESLint 설정
├── postcss.config.js         # PostCSS 설정
├── tailwind.config.js        # Tailwind CSS 설정
├── vite.config.js            # Vite 설정
├── package.json              # 패키지 정보 및 스크립트
└── README.md                 # 프로젝트 문서
```

## 🔧 설정 및 커스터마이징

### 환경 변수

Gemini AI API 키는 현재 소스 코드에 하드코딩되어 있습니다. 프로덕션 환경에서는 환경 변수로 관리하는 것을 권장합니다:

```javascript
// .env 파일 생성 후
VITE_GEMINI_API_KEY=your_api_key_here

// App.jsx에서 사용
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

### Tailwind CSS 커스터마이징

`tailwind.config.js` 파일에서 디자인 시스템을 확장할 수 있습니다:

```javascript
theme: {
  extend: {
    colors: {
      // 사용자 정의 색상 추가
    },
    fontFamily: {
      // 사용자 정의 폰트 추가
    }
  }
}
```

## 🌐 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 라이선스

Copyright 2025 The Seoul Institute. All Rights Reserved.

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📞 지원 및 문의

- **개발사**: 서울연구원 (The Seoul Institute)
- **프로젝트 이슈**: GitHub Issues 페이지를 통해 버그 리포트 및 기능 요청

## 📈 버전 정보

- **현재 버전**: 0.0.0
- **개발 상태**: 초기 개발 단계
- **React**: 19.1.0
- **Vite**: 7.0.4
- **Tailwind CSS**: 3.4.17