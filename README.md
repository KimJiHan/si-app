# 서울의 미래를 그리다 (Future Seoul App)

서울연구원에서 개발한 인터랙티브 AI 이미지 생성 웹 애플리케이션입니다. 사용자가 서울의 미래 랜드마크를 선택하고, 다양한 옵션을 조합하여 AI가 나만의 서울 미래상을 창조할 수 있습니다.

**전략실_광복80주년 전시 지원**

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

## 🚀 GitHub Pages 배포

이 앱은 GitHub Pages에 배포되어 있습니다: **https://kimjihan.github.io/si-app**

### 로컬 개발

1. **저장소 클론**
   ```bash
   git clone https://github.com/KimJiHan/si-app.git
   cd si-app
   ```

2. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일을 열어서 VITE_GEMINI_API_KEY에 실제 API 키를 입력하세요
   ```
   
   Google Gemini API 키는 [Google AI Studio](https://makersuite.google.com/app/apikey)에서 발급받을 수 있습니다.

3. **의존성 설치**
   ```bash
   npm install
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

### 배포 명령어

```bash
# GitHub Pages에 배포
npm run deploy
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

## 📄 라이선스

Copyright 2025 The Seoul Institute. All Rights Reserved.
