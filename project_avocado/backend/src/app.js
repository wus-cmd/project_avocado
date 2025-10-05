const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const userRoutes = require('./routes/users');
const ttsRoutes = require('./routes/tts');
const modelRoutes = require('./routes/models');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true }));

// 정적 파일(생성된 음성 파일) 제공을 위한 설정
// http://localhost:3001/storage/output_file.wav 와 같이 접근 가능
app.use('/storage', express.static(path.join(__dirname, '../../ai/outputs')));


// API 라우터 연결
app.get('/', (req, res) => {
    res.send('🥑 Avocado Backend Server is running!');
});

app.use('/api', userRoutes); // 사용자 관련 API
app.use('/api', ttsRoutes);  // TTS 관련 API
app.use('/api', modelRoutes);
app.use('/api', historyRoutes); 

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});