const express = require('express');
const router = express.Router();
const axios = require('axios');
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
        console.log(`[Backend] AI 서버에 TTS 요청: User ${userId}, Model ${modelId}`);

        const aiResponse = await axios.post(AI_SERVER_URL, {
            text: text,
            speaker_wav: modelId,
            user_id: userId
        });

        console.log('AI Server Response Data:', aiResponse.data);
        const { filename, duration } = aiResponse.data;

        if (!filename) {
            throw new Error('AI 서버로부터 유효한 파일명을 받지 못했습니다.');
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/storage/${filename}`;
        
        // --- 이 부분이 추가되었습니다 ---
        // DB에 변환 결과 기록
        try {
            // TODO: modelId를 VoiceModel 테이블의 ID와 연결해야 함 (현재는 텍스트로 저장)
            await db.query(
                'INSERT INTO OutputVoice (userId, modelId, text, fileUrl) VALUES (?, ?, ?, ?)',
                [userId, null, text, fileUrl] // 우선 modelId는 null로 저장
            );
            console.log('[Backend] DB에 변환 기록 저장 성공');
        } catch (dbError) {
            console.error('[Backend] DB 저장 중 오류 발생:', dbError);
            // DB 저장에 실패하더라도 사용자에게는 TTS 결과를 반환해주는 것이 좋으므로,
            // 여기서 에러를 던지지 않고 로그만 남깁니다.
        }
        // -----------------------------

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