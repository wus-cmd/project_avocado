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

// DELETE /api/history/:id - 특정 변환 기록 삭제
router.delete('/history/:id', authMiddleware, async (req, res) => {
    const recordIdToDelete = req.params.id;
    const userId = req.user.id; // 로그인한 사용자 본인인지 확인하기 위함

    try {
        // DB에서 id와 userId가 모두 일치하는 기록만 삭제 (보안)
        const [result] = await db.query(
            'DELETE FROM OutputVoice WHERE id = ? AND userId = ?',
            [recordIdToDelete, userId]
        );

        // 삭제된 행이 없으면 (기록이 없거나, 다른 사람의 기록을 삭제하려 할 때)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '해당 기록을 찾을 수 없거나 삭제할 권한이 없습니다.' });
        }

        res.status(200).json({ message: '기록이 성공적으로 삭제되었습니다.' });

    } catch (error) {
        console.error('DB 삭제 중 오류 발생:', error);
        res.status(500).json({ message: '기록 삭제 중 서버 오류가 발생했습니다.' });
    }
});

module.exports = router;