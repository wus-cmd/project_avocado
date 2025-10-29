const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const userRoutes = require('./routes/users');
const ttsRoutes = require('./routes/tts');
const modelRoutes = require('./routes/models');
const historyRoutes = require('./routes/history');
const shareRouter = require('./routes/share');

const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// 미들웨어 설정
// ========================================
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱

// ========================================
// 정적 파일 제공
// ========================================
// AI가 생성한 음성 파일 제공 (ai/outputs/)
// 예: http://localhost:3001/storage/user_1_conan_1234567890.wav
app.use('/storage', express.static(path.join(__dirname, '../../ai/outputs')));

// 사용자가 업로드한 음성 파일 제공 (backend/uploads/voices/)
// 예: http://localhost:3001/uploads/user_1_1234567890.wav
app.use('/uploads', express.static(path.join(__dirname, '../uploads/voices')));

// ========================================
// 기본 라우트
// ========================================
app.get('/', (req, res) => {
    res.send('🥑 Avocado Backend Server is running!');
});

// ========================================
// API 라우터 연결
// ========================================
app.use('/api', userRoutes);      // 사용자 관련 API (회원가입, 로그인 등)
app.use('/api', ttsRoutes);       // TTS 변환 관련 API
app.use('/api', modelRoutes);     // 음성 모델 관련 API
app.use('/api', historyRoutes);   // 변환 기록 관련 API
app.use('/api/share', shareRouter); // 공유/다운로드 관련 API

// ========================================
// 404 에러 처리 (라우트를 찾을 수 없는 경우)
// ========================================
app.use((req, res) => {
    res.status(404).json({ 
        message: '요청하신 API를 찾을 수 없습니다.',
        path: req.path 
    });
});

// ========================================
// 전역 에러 핸들러
// ========================================
app.use((err, req, res, next) => {
    console.error('서버 오류:', err);
    res.status(err.status || 500).json({ 
        message: err.message || '서버 내부 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// ========================================
// 서버 시작
// ========================================
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📁 Static files: http://localhost:${PORT}/storage/`);
    console.log(`📁 Uploaded files: http://localhost:${PORT}/uploads/`);
});

module.exports = app;