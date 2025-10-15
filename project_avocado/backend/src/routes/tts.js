const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db'); // DB 연결 가져오기

const AI_SERVER_URL = 'http://localhost:8000/synthesize';

router.post('/convert', authMiddleware, async (req, res) => {
    const { text, modelId } = req.body;
    const userId = req.user.id;

    if (!text || !modelId) {
        return res.status(400).json({ message: '텍스트와 모델 ID를 모두 입력해주세요.' });
    }

    try {
        // --- 여기가 핵심 수정 부분입니다 ---
        // 1. DB에서 모델 ID로 실제 파일 경로(filePath) 조회
        const [rows] = await db.query(
            'SELECT filePath FROM VoiceModel WHERE id = ? AND (userId = ? OR type = ?)',
            [modelId, userId, 'base'] // 내 커스텀 모델 또는 기본 모델
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '사용할 수 없는 모델 ID입니다.' });
        }

        // 2. DB에 저장된 전체 경로에서 파일 이름만 추출
        const voiceFileName = path.basename(rows[0].filePath); 

        console.log(`[Backend] AI 서버에 TTS 요청: User ${userId}, Model ID ${modelId}, FileName ${voiceFileName}`);

        // 3. AI 서버에 실제 파일명으로 요청
        const aiResponse = await axios.post(AI_SERVER_URL, {
            text: text,
            speaker_wav: voiceFileName, // <--- 조회한 실제 파일명 사용
            user_id: userId
        });
        // ------------------------------------

        console.log('AI Server Response Data:', aiResponse.data);
        const { filename, duration } = aiResponse.data;

        if (!filename) {
            throw new Error('AI 서버로부터 유효한 파일명을 받지 못했습니다.');
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/storage/${filename}`;

        // DB에 변환 결과 기록
        try {
            await db.query(
                'INSERT INTO OutputVoice (userId, modelId, text, fileUrl) VALUES (?, ?, ?, ?)',
                [userId, modelId, text, fileUrl] // 여기 modelId는 DB의 ID 번호
            );
            console.log('[Backend] DB에 변환 기록 저장 성공');
        } catch (dbError) {
            console.error('[Backend] DB 저장 중 오류 발생:', dbError);
        }

        const responseData = {
            id: `output_${Date.now()}`,
            status: "completed",
            filename: filename,
            url: fileUrl,
            duration: duration || "N/A"
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('[Backend] TTS 변환 중 오류 발생:', error.message);
        // AI 서버가 꺼져있거나 응답에 문제가 생긴 경우
        if (error.response) {
            console.error('AI Server Response Error:', error.response.data);
            return res.status(502).json({ message: 'AI 서버 처리 중 오류가 발생했습니다.' });
        } else if (error.request) {
            return res.status(503).json({ message: 'AI 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.' });
        }
        res.status(500).json({ message: '음성 변환 중 서버 오류가 발생했습니다.' });
    }
});

module.exports = router;