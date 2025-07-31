# 배포 가이드

이 문서는 **서울의 미래를 그리다** 애플리케이션의 배포 방법과 운영 가이드를 제공합니다.

## 📋 목차

- [배포 전 준비사항](#배포-전-준비사항)
- [로컬 빌드](#로컬-빌드)
- [정적 호스팅 배포](#정적-호스팅-배포)
- [클라우드 플랫폼 배포](#클라우드-플랫폼-배포)
- [도커 배포](#도커-배포)
- [환경 변수 설정](#환경-변수-설정)
- [성능 최적화](#성능-최적화)
- [모니터링 및 로깅](#모니터링-및-로깅)
- [문제 해결](#문제-해결)

## 🔧 배포 전 준비사항

### 시스템 요구사항
- **Node.js**: 18.0 이상
- **npm**: 9.0 이상
- **Git**: 최신 버전

### 의존성 확인
```bash
# Node.js 버전 확인
node --version

# npm 버전 확인
npm --version

# 의존성 보안 취약점 검사
npm audit

# 의존성 업데이트 확인
npm outdated
```

### 코드 품질 검사
```bash
# ESLint 검사
npm run lint

# 타입 검사 (TypeScript 프로젝트의 경우)
npm run type-check

# 테스트 실행 (테스트가 있는 경우)
npm test
```

## 🏗️ 로컬 빌드

### 프로덕션 빌드 생성
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
ls -la dist/

# 빌드 크기 분석
npx vite-bundle-analyzer dist/
```

### 빌드 결과 미리보기
```bash
# 로컬 프리뷰 서버 실행
npm run preview

# 또는 정적 파일 서버 사용
npx serve dist/
```

### 빌드 최적화 설정
`vite.config.js` 파일에서 빌드 최적화:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 빌드 최적화 설정
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 콘솔 로그 제거
        drop_debugger: true // 디버거 제거
      }
    },
    rollupOptions: {
      output: {
        // 청크 분할
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['qrcode']
        }
      }
    },
    // 압축 설정
    assetsDir: 'assets',
    sourcemap: false // 프로덕션에서 소스맵 비활성화
  }
})
```

## 🌐 정적 호스팅 배포

### Netlify 배포

1. **저장소 연결**
   - Netlify 대시보드에서 "New site from Git" 선택
   - GitHub/GitLab 저장소 연결

2. **빌드 설정**
   ```yaml
   # netlify.toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **환경 변수 설정**
   - Site settings > Environment variables
   - `VITE_GEMINI_API_KEY` 추가

### Vercel 배포

1. **Vercel CLI 설치 및 배포**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **설정 파일**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ]
   }
   ```

### GitHub Pages 배포

1. **GitHub Actions 워크플로우**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Build
           run: npm run build
           env:
             VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
         
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Base URL 설정**
   ```javascript
   // vite.config.js
   export default defineConfig({
     base: '/repository-name/', // GitHub Pages의 경우
     // ... 기타 설정
   })
   ```

## ☁️ 클라우드 플랫폼 배포

### AWS S3 + CloudFront 배포

1. **S3 버킷 생성 및 설정**
   ```bash
   # AWS CLI 설정
   aws configure
   
   # S3 버킷 생성
   aws s3 mb s3://future-seoul-app-bucket
   
   # 정적 웹사이트 호스팅 활성화
   aws s3 website s3://future-seoul-app-bucket \
     --index-document index.html \
     --error-document index.html
   ```

2. **빌드 및 업로드**
   ```bash
   # 빌드
   npm run build
   
   # S3에 업로드
   aws s3 sync dist/ s3://future-seoul-app-bucket --delete
   ```

3. **CloudFront 배포**
   ```bash
   # CloudFront 배포 생성 (AWS CLI 또는 콘솔)
   aws cloudfront create-distribution \
     --distribution-config file://cloudfront-config.json
   ```

### Azure Static Web Apps 배포

1. **Azure CLI 배포**
   ```bash
   # Azure CLI 로그인
   az login
   
   # 정적 웹앱 생성
   az staticwebapp create \
     --name future-seoul-app \
     --resource-group myResourceGroup \
     --source https://github.com/username/future-seoul-app \
     --location "East Asia" \
     --branch main \
     --app-location "/" \
     --output-location "dist"
   ```

2. **설정 파일**
   ```json
   {
     "routes": [
       {
         "route": "/*",
         "serve": "/index.html",
         "statusCode": 200
       }
     ]
   }
   ```

## 🐳 도커 배포

### Dockerfile
```dockerfile
# 멀티 스테이지 빌드
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 프로덕션 이미지
FROM nginx:alpine

# 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 설정
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss;

    server {
        listen 80;
        server_name localhost;
        
        root /usr/share/nginx/html;
        index index.html;
        
        # SPA 라우팅 지원
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # 캐시 설정
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # 보안 헤더
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  future-seoul-app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  # 리버스 프록시 (선택사항)
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl:ro
      - ./proxy.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - future-seoul-app
```

### Docker 명령어
```bash
# 이미지 빌드
docker build -t future-seoul-app .

# 컨테이너 실행
docker run -d -p 80:80 --name seoul-app future-seoul-app

# Docker Compose 실행
docker-compose up -d

# 로그 확인
docker logs future-seoul-app
```

## 🔐 환경 변수 설정

### 환경 변수 목록
```bash
# .env.production
VITE_GEMINI_API_KEY=your_production_api_key
VITE_APP_TITLE=서울의 미래를 그리다
VITE_API_BASE_URL=https://api.example.com
VITE_ENVIRONMENT=production
```

### 플랫폼별 환경 변수 설정

**Netlify:**
- Site settings > Environment variables

**Vercel:**
- Project settings > Environment Variables

**AWS:**
```bash
# Lambda 환경 변수 (서버리스 함수 사용 시)
aws lambda update-function-configuration \
  --function-name seoul-app-function \
  --environment Variables='{GEMINI_API_KEY=your_key}'
```

**Docker:**
```bash
# 환경 변수 파일 사용
docker run --env-file .env.production -p 80:80 future-seoul-app
```

## ⚡ 성능 최적화

### 빌드 최적화
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ai-utils': ['qrcode'],
        }
      }
    }
  }
})
```

### 이미지 최적화
```bash
# 이미지 압축 (빌드 전)
npm install -g imagemin-cli
imagemin public/image/**/*.{jpg,png} --out-dir=public/image/optimized/
```

### 캐싱 전략
```nginx
# Nginx 캐시 설정
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /index.html {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### CDN 설정
```javascript
// 정적 자산 CDN 사용
const CDN_BASE_URL = 'https://cdn.example.com';
const imageUrl = `${CDN_BASE_URL}/images/${filename}`;
```

## 📊 모니터링 및 로깅

### 애플리케이션 모니터링
```javascript
// 에러 추적 (Sentry 예시)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.VITE_ENVIRONMENT,
});

// 성능 모니터링
const trackPerformance = () => {
  if ('performance' in window) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log('Page load time:', loadTime);
  }
};
```

### 로그 수집
```javascript
// 커스텀 로깅 함수
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data);
    // 프로덕션에서는 외부 로깅 서비스로 전송
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
    // 에러 추적 서비스로 전송
  }
};
```

### 헬스 체크 엔드포인트
```javascript
// 간단한 헬스 체크 (서버 사이드 렌더링 시)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

## 🔍 문제 해결

### 일반적인 배포 문제

**1. 라우팅 문제 (404 에러)**
```nginx
# Nginx 설정에서 SPA 라우팅 지원
location / {
    try_files $uri $uri/ /index.html;
}
```

**2. 환경 변수 접근 불가**
```javascript
// Vite에서는 VITE_ 접두사 필요
console.log(import.meta.env.VITE_API_KEY); // ✅ 작동
console.log(process.env.API_KEY);          // ❌ 작동하지 않음
```

**3. 이미지 로딩 실패**
```javascript
// 절대 경로 사용
const imageUrl = new URL('/image/landmark.jpg', import.meta.url).href;
```

**4. API 호출 실패 (CORS)**
```javascript
// 프록시 설정 또는 서버에서 CORS 헤더 설정
const proxyUrl = 'https://images.weserv.nl/?url=';
const imageUrl = proxyUrl + encodeURIComponent(originalUrl);
```

### 성능 문제 진단
```bash
# 번들 크기 분석
npx vite-bundle-analyzer dist/

# Lighthouse 성능 테스트
npx lighthouse https://your-domain.com --output=html

# 로드 시간 측정
curl -w "@formats/time.txt" -o /dev/null -s https://your-domain.com
```

### 로그 분석
```bash
# Nginx 액세스 로그 분석
tail -f /var/log/nginx/access.log

# 에러 로그 확인
tail -f /var/log/nginx/error.log

# Docker 컨테이너 로그
docker logs -f future-seoul-app
```

## 🔄 CI/CD 파이프라인

### GitHub Actions 완전한 예시
```yaml
# .github/workflows/deploy.yml
name: Deploy Future Seoul App

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

## 📋 배포 체크리스트

### 배포 전 확인사항
- [ ] 코드 품질 검사 통과 (ESLint)
- [ ] 프로덕션 빌드 정상 작동
- [ ] 환경 변수 설정 완료
- [ ] API 키 및 보안 정보 확인
- [ ] 이미지 및 자산 최적화
- [ ] 브라우저 호환성 테스트

### 배포 후 확인사항
- [ ] 웹사이트 정상 접속
- [ ] 모든 페이지 라우팅 작동
- [ ] AI 이미지 생성 기능 테스트
- [ ] QR 코드 생성 기능 테스트
- [ ] 모바일 반응형 확인
- [ ] 성능 지표 측정 (Lighthouse)
- [ ] 에러 모니터링 활성화

이 가이드를 따라 안정적이고 성능이 우수한 배포를 구현할 수 있습니다.