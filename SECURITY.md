# 보안 설정 가이드

## API 키 보안 관리

### 환경 변수 설정 방법

1. **개발 환경 설정**
   ```bash
   # 프로젝트 루트에 .env 파일 생성
   cp .env.example .env
   
   # .env 파일을 열어 실제 API 키 입력
   # 예시:
   # VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   # VITE_TRANSLATE_API_KEY=your_actual_translation_api_key_here
   ```

2. **API 키 발급 방법**
   - Gemini API: https://makersuite.google.com/app/apikey
   - Translation API: https://console.cloud.google.com/apis/credentials

3. **API 키 보안 설정**
   - API 키에 IP 제한 설정
   - 필요한 API만 활성화
   - 정기적으로 키 순환

### 배포 환경 설정

**GitHub Pages (현재 사용 중)**
- GitHub Secrets에 환경 변수 설정
- Settings → Secrets and variables → Actions
- `VITE_GEMINI_API_KEY`와 `VITE_TRANSLATE_API_KEY` 추가

**Vercel/Netlify**
- 프로젝트 설정에서 환경 변수 추가
- 빌드 시 자동으로 환경 변수 주입

### 보안 체크리스트

- [ ] API 키가 코드에 하드코딩되지 않았는지 확인
- [ ] .env 파일이 .gitignore에 포함되어 있는지 확인
- [ ] 정기적으로 API 키 순환
- [ ] API 키에 적절한 권한 제한 설정
- [ ] 프로덕션 환경에서는 서버 사이드 프록시 사용 고려

## 프로덕션 권장사항

현재 클라이언트 사이드에서 직접 API를 호출하고 있어 API 키가 노출될 수 있습니다.
프로덕션 환경에서는 다음을 권장합니다:

1. **백엔드 프록시 서버 구축**
   - API 키를 서버에만 보관
   - 클라이언트는 프록시 서버를 통해 API 호출

2. **Firebase Functions 또는 Vercel Functions 활용**
   - 서버리스 함수로 API 호출 중계
   - API 키를 환경 변수로 안전하게 관리

3. **CORS 및 도메인 제한**
   - API 키에 도메인 제한 설정
   - 특정 도메인에서만 API 사용 가능하도록 제한