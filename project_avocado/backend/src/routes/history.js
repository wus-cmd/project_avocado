const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

// GET /api/history - 현재 로그인된 사용자의 변환 기록 조회
router.get('/history', authMiddleware, async (req, res) => {
    const userId = req.user.id; // 인증 미들웨어를 통해 얻은 사용자 ID

    try {
        // OutputVoice 테이블에서 현재 사용자의 기록을 최신순으로 조회
        const [rows] = await db.query(
            'SELECT * FROM OutputVoice WHERE userId = ? ORDER BY createdAt DESC',
            [userId]
        );
        
        res.status(200).json(rows); // 조회된 기록들을 JSON 형태로 반환

    } catch (error) {
        console.error('DB 조회 중 오류 발생:', error);
        res.status(500).json({ message: '기록을 불러오는 중 서버 오류가 발생했습니다.' });
    }
});

module.exports = router;