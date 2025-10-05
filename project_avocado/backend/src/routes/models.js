const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

// --- Multer 설정 ---
// 1. 파일 저장 위치와 파일명 지정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/voices/';
        // uploads/voices 폴더가 없으면 생성
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // 파일명 형식: "user_{userId}_{timestamp}.wav"
        const userId = req.user.id; // authMiddleware에서 온 사용자 ID
        const uniqueSuffix = Date.now();
        cb(null, `user_${userId}_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });
// --- /Multer 설정 ---


// POST /api/models/custom - 커스텀 목소리 모델 생성을 위한 음성 파일 업로드
router.post(
    '/models/custom', 
    authMiddleware, 
    upload.single('voiceSample'), // 'voiceSample'이라는 이름으로 단일 파일 업로드를 처리
    async (req, res) => {
        // 파일이 없으면 에러 처리
        if (!req.file) {
            return res.status(400).json({ message: '음성 파일을 업로드해주세요.' });
        }

        console.log('Uploaded file info:', req.file);

        // TODO: 다음 단계에서 이 파일 경로를 Python AI 서버에 전달하여 임베딩 추출
        const filePath = req.file.path;

        // 우선 업로드 성공 응답만 반환
        res.status(201).json({
            message: '음성 파일이 성공적으로 업로드되었습니다.',
            filePath: filePath
        });
    }
);

module.exports = router;