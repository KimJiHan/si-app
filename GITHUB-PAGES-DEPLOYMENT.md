# GitHub Pages 배포 가이드

## 🚀 배포 준비 완료!

Future Seoul 앱을 GitHub Pages로 배포할 준비가 완료되었습니다.  
저장소: `https://github.com/KimJiHan/si-app`

## 📋 완료된 설정

### 1. Vite 설정 업데이트 ✅
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/si-app/', // GitHub repository name
})
```

### 2. Package.json 스크립트 추가 ✅
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

### 3. GitHub Actions 워크플로우 생성 ✅
- 파일 위치: `.github/workflows/deploy.yml`
- 자동 배포 설정 완료

### 4. gh-pages 패키지 설치 ✅
```bash
npm install --save-dev gh-pages
```

## 🔧 배포 방법

### 방법 1: 수동 배포 (gh-pages 사용)
```bash
# 빌드 및 배포
npm run deploy
```

### 방법 2: GitHub Actions 자동 배포
1. 코드를 GitHub에 푸시
2. main 브랜치에 푸시하면 자동으로 배포됨

## 📦 GitHub 저장소 설정

### 1. 저장소 생성/연결
```bash
# 새 저장소인 경우
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KimJiHan/si-app.git
git push -u origin main

# 기존 저장소가 있는 경우
git remote set-url origin https://github.com/KimJiHan/si-app.git
git push origin main
```

### 2. GitHub Pages 활성화
1. GitHub 저장소로 이동: https://github.com/KimJiHan/si-app
2. Settings → Pages 메뉴로 이동
3. Source를 "GitHub Actions"로 설정

## 🌐 배포 후 접속 URL
```
https://kimjihan.github.io/si-app/
```

## ⚠️ 주의사항

### 1. 이미지 경로
현재 이미지들이 로컬 경로를 사용하고 있어 배포 시 수정이 필요할 수 있습니다:
- `/image/` 경로의 이미지들은 `public` 폴더에 있어야 함
- 모든 이미지가 정상적으로 로드되는지 확인 필요

### 2. API 키 보안
- 현재 API 키가 하드코딩되어 있음
- 프로덕션 배포 전에 환경 변수로 이동 권장
- GitHub Secrets를 사용하여 안전하게 관리

### 3. CORS 설정
- 외부 이미지 URL 사용 시 CORS 문제 발생 가능
- 필요 시 프록시 서비스 활용

## 🔄 업데이트 프로세스

### 코드 변경 후 재배포
```bash
# 변경사항 커밋
git add .
git commit -m "Update features"
git push origin main

# GitHub Actions가 자동으로 배포하거나
# 수동으로 배포
npm run deploy
```

## ✅ 배포 전 체크리스트

- [ ] 모든 변경사항 저장 및 테스트
- [ ] 로컬에서 빌드 테스트 (`npm run build`)
- [ ] 이미지 경로 확인
- [ ] API 키 보안 검토
- [ ] GitHub 저장소 연결 확인

## 🎯 다음 단계

1. GitHub에 코드 푸시
2. GitHub Pages 설정 확인
3. 배포된 사이트 테스트
4. 필요 시 이미지 경로 수정

배포 준비가 완료되었습니다! 🎉