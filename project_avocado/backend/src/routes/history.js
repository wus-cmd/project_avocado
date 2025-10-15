const express = require('express');
const router = express.Router();
const fs = require('fs'); // 파일 시스템 모듈
const path = require('path'); // 경로 모듈
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

// GET /api/history - 현재 로그인된 사용자의 변환 기록 조회 (모델 이름 포함)
router.get('/history', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        // VoiceModel 테이블을 JOIN하여 모델 이름(modelName)까지 함께 조회
        const [rows] = await db.query(
            `SELECT
                ov.id,
                ov.text,
                ov.fileUrl,
                ov.createdAt,
                vm.name AS modelName 
             FROM OutputVoice AS ov
             LEFT JOIN VoiceModel AS vm ON ov.modelId = vm.id
             WHERE ov.userId = ?
             ORDER BY ov.createdAt DESC`,
            [userId]
        );
        
        res.status(200).json(rows);

    } catch (error) {
        console.error('DB 조회 중 오류 발생:', error);
        res.status(500).json({ message: '기록을 불러오는 중 서버 오류가 발생했습니다.' });
    }
});


// DELETE /api/history/:id - 특정 변환 기록 삭제
router.delete('/history/:id', authMiddleware, async (req, res) => {
    const recordId = req.params.id;
    const userId = req.user.id;

    try {
        // 1. DB에서 삭제할 기록의 정보를 가져옴 (파일 경로 확인 및 본인 확인용)
        const [rows] = await db.query(
            'SELECT * FROM OutputVoice WHERE id = ? AND userId = ?',
            [recordId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '기록을 찾을 수 없거나 권한이 없습니다.' });
        }

        const record = rows[0];

        // 2. 실제 음성 파일(.wav) 삭제
        if (record.fileUrl) {
            const fileName = path.basename(record.fileUrl); // URL에서 파일명만 추출
            const filePath = path.join(__dirname, '../../../ai/outputs', fileName); // 실제 파일 경로 조합

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`[Backend] 파일 삭제 성공: ${filePath}`);
            }
        }

        // 3. DB에서 기록 삭제
        await db.query('DELETE FROM OutputVoice WHERE id = ?', [recordId]);

        res.status(200).json({ message: '기록이 삭제되었습니다.' });

    } catch (error) {
        console.error('기록 삭제 오류:', error);
        res.status(500).json({ message: '기록 삭제 중 오류가 발생했습니다.' });
    }
});
module.exports = router;