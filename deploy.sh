#!/bin/bash

# 배포 스크립트 - API 키와 함께 빌드 후 GitHub Pages 배포

echo "🚀 GitHub Pages 배포 시작..."

# API 키 설정 (Gemini와 Translation API 동일한 키 사용)
export VITE_GEMINI_API_KEY="AIzaSyA_sS1_XoYuoiejIOn275SDU0gyhcunPYo"
export VITE_TRANSLATE_API_KEY="AIzaSyA_sS1_XoYuoiejIOn275SDU0gyhcunPYo"

echo "🔑 API 키 설정 완료"
echo "  - Image Generation API: ✅"
echo "  - Translation API: ✅"

# 빌드
echo "📦 빌드 시작..."
npm run build

# 빌드 성공 확인
if [ $? -eq 0 ]; then
    echo "✅ 빌드 성공!"
else
    echo "❌ 빌드 실패!"
    exit 1
fi

# 배포
echo "🌐 GitHub Pages로 배포 중..."
npx gh-pages -d dist

if [ $? -eq 0 ]; then
    echo "✅ 배포 완료!"
    echo "📍 URL: https://kimjihan.github.io/si-app/"
    echo "⏰ 2-5분 후 사이트에서 확인 가능합니다."
    echo ""
    echo "🔧 기능 확인:"
    echo "  - 이미지 생성: AI 이미지 생성 기능 테스트"
    echo "  - 다국어 번역: 언어 선택 버튼으로 번역 테스트"
else
    echo "❌ 배포 실패!"
    exit 1
fi