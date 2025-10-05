# 아보카도 백엔드 설치 및 실행 가이드

## 📋 필요한 소프트웨어

1. **Node.js** (버전 14 이상)
2. **MySQL** (버전 8.0 이상)
3. **Git** (선택사항)

## 🚀 설치 단계

### 1. 프로젝트 설정

```bash
# backend 폴더로 이동
cd backend

# 패키지 설치
npm install
```

### 2. 데이터베이스 설정

MySQL에 접속하여 데이터베이스를 생성합니다:

```sql
CREATE DATABASE avocado_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 환경 변수 설정

`.env` 파일을 수정하여 실제 데이터베이스 정보를 입력합니다:

```env
# 서버 설정
PORT=3001
NODE_ENV=development

# 데이터베이스 설정 (실제 정보로 변경)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=avocado_db

# JWT 설정 (보안을 위해 복잡한 문자열로 변경)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=24h

# 이메일 설정 (Gmail 예시)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 4. 서버 실행

```bash
# 개발 모드로 실행 (파일 변경 시 자동 재시작)
npm run dev

# 또는 일반 실행
npm start
```

서버가 성공적으로 시작되면 다음과 같은 메시지가 표시됩니다:

```
🥑 아보카도 서버가 포트 3001에서 실행 중입니다.
📡 API 엔드포인트: http://localhost:3001/api
📁 저장소 경로: http://localhost:3001/storage
✅ 데이터베이스 연결 성공
✅ 데이터베이스 테이블 초기화 완료
```

## 🧪 API 테스트

### 서버 상태 확인

브라우저나 Postman에서 다음 URL로 접속:

```
http://localhost:3001
```

정상 응답:
```json
{
  "success": true,
  "message": "아보카도 API 서버가 정상적으로 실행 중입니다.",
  "version": "1.0.0"
}
```

### 회원가입 테스트

```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "테스트사용자",
    "age": 25,
    "gender": "male"
  }'
```

## 📁 디렉토리 구조

설정 완료 후 backend 폴더 구조:

```
backend/
├── .env                    # 환경 변수 파일
├── server.js              # 메인 서버 파일
├── package.json           # 의존성 패키지
├── config/
│   └── database.js        # DB 설정
├── src/
│   ├── api/
│   │   ├── auth.js        # 인증 API
│   │   ├── models.js      # 음성 모델 API
│   │   └── convert.js     # TTS 변환 API
│   └── middleware/
│       └── auth.js        # 인증 미들웨어
├── storage/               # 생성된 음성 파일 저장소
└── uploads/               # 업로드된 파일 임시 저장소
```

## 🔧 프론트엔드 연결

프론트엔드에서 백엔드 API를 호출할 때 다음 URL을 사용합니다:

- **기본 URL**: `http://localhost:3001`
- **API 엔드포인트**: `http://localhost:3001/api`

현재 프론트엔드 코드는 이미 올바른 API 호출을 하고 있으므로, 백엔드만 실행하면 바로 연동됩니다.

## ❗ 문제 해결

### 데이터베이스 연결 오류

```
❌ 데이터베이스 연결 실패: Access denied for user 'root'@'localhost'
```

**해결방법**: `.env` 파일의 DB_PASSWORD를 실제 MySQL 비밀번호로 변경

### 포트 충돌 오류

```
Error: listen EADDRINUSE: address already in use :::3001
```

**해결방법**: 
1. 다른 프로세스가 3001 포트를 사용 중인지 확인
2. `.env` 파일에서 PORT를 다른 번호로 변경 (예: 3002)

### 패키지 설치 오류

```
npm ERR! code ENOTFOUND
```

**해결방법**: 
1. 인터넷 연결 확인
2. npm 캐시 정리: `npm cache clean --force`
3. 다시 설치: `npm install`

## 📝 추가 설정

### HTTPS 설정 (프로덕션 환경)

프로덕션 환경에서는 HTTPS를 사용하는 것이 좋습니다. 추후 배포 시에는 다음을 고려하세요:

1. SSL 인증서 설정
2. 환경 변수의 NODE_ENV를 'production'으로 변경
3. 데이터베이스 보안 설정

### 이메일 서비스 설정

이메일 공유 기능을 사용하려면:

1. Gmail 앱 비밀번호 생성
2. `.env` 파일의 EMAIL_USER와 EMAIL_PASSWORD 설정

이제 백엔드가 완전히 설정되었습니다! 🎉