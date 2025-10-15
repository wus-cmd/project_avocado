const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/voices/';
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user.id;
        const uniqueSuffix = Date.now();
        cb(null, `user_${userId}_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// GET /api/models/my-models - 내 커스텀 모델 목록 조회
router.get('/models/my-models', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [rows] = await db.query(
            'SELECT id, name, createdAt FROM VoiceModel WHERE userId = ? ORDER BY createdAt DESC LIMIT 3',
            [userId]
        );
        
        res.json({
            models: rows,
            count: rows.length,
            maxCount: 3
        });
    } catch (error) {
        console.error('모델 조회 오류:', error);
        res.status(500).json({ message: '모델 조회에 실패했습니다.' });
    }
});

// POST /api/models/custom - 커스텀 모델 생성
router.post('/models/custom', authMiddleware, upload.single('voiceSample'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '음성 파일을 업로드해주세요.' });
    }

    const userId = req.user.id;
    const modelName = req.body.modelName || '내 목소리';

    try {
        // 현재 사용자의 모델 개수 확인
        const [countResult] = await db.query(
            'SELECT COUNT(*) as count FROM VoiceModel WHERE userId = ?',
            [userId]
        );

        if (countResult[0].count >= 3) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: '최대 3개까지만 모델을 생성할 수 있습니다.' });
        }

        // DB에 모델 정보 저장
        const filePath = req.file.path;
        
        const [result] = await db.query(
            'INSERT INTO VoiceModel (userId, name, filePath) VALUES (?, ?, ?)',
            [userId, modelName, filePath]
        );

        res.status(201).json({
            message: '커스텀 모델이 성공적으로 생성되었습니다.',
            modelId: result.insertId,
            name: modelName
        });

    } catch (error) {
        console.error('모델 생성 오류:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: '모델 생성에 실패했습니다.' });
    }
});

// DELETE /api/models/custom/:id - 커스텀 모델 삭제
router.delete('/models/custom/:id', authMiddleware, async (req, res) => {
    const modelId = req.params.id;
    const userId = req.user.id;

    try {
        const [rows] = await db.query(
            'SELECT * FROM VoiceModel WHERE id = ? AND userId = ?',
            [modelId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '모델을 찾을 수 없거나 권한이 없습니다.' });
        }

        const model = rows[0];

        // 파일 삭제
        if (model.filePath && fs.existsSync(model.filePath)) {
            fs.unlinkSync(model.filePath);
        }

        // DB에서 삭제
        await db.query('DELETE FROM VoiceModel WHERE id = ?', [modelId]);

        res.status(200).json({ message: '모델이 삭제되었습니다.' });

    } catch (error) {
        console.error('모델 삭제 오류:', error);
        res.status(500).json({ message: '모델 삭제에 실패했습니다.' });
    }
});

module.exports = router;