// backend/src/routes/share.js
// 음성 파일 다운로드 및 공유 기능을 제공하는 라우터

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

// ========================================
// 1. WAV 파일 다운로드
// ========================================
router.get('/download/wav', authMiddleware, async (req, res) => {
    try {
        const { fileUrl } = req.query;
        
        if (!fileUrl) {
            return res.status(400).json({ message: '파일 URL이 필요합니다.' });
        }

        // URL에서 파일명 추출
        const fileName = path.basename(fileUrl);
        
        // AI 서버가 생성한 파일은 ai/outputs/에 있음
        let filePath = path.join(__dirname, '../../../ai/outputs/', fileName);
        
        // ai/outputs/에 없으면 backend/uploads/voices/에서 찾기
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, '../../uploads/voices/', fileName);
        }
        
        // 파일 존재 여부 확인
        if (!fs.existsSync(filePath)) {
            console.error('파일을 찾을 수 없음:', fileName);
            console.error('시도한 경로 1:', path.join(__dirname, '../../../ai/outputs/', fileName));
            console.error('시도한 경로 2:', path.join(__dirname, '../../uploads/voices/', fileName));
            return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });
        }

        // 파일 다운로드 응답
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('파일 다운로드 오류:', err);
                res.status(500).json({ message: '파일 다운로드 중 오류가 발생했습니다.' });
            }
        });

    } catch (error) {
        console.error('다운로드 처리 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// ========================================
// 2. MP3 파일 다운로드 (WAV → MP3 변환)
// ========================================
router.get('/download/mp3', authMiddleware, async (req, res) => {
    try {
        const { fileUrl } = req.query;
        
        if (!fileUrl) {
            return res.status(400).json({ message: '파일 URL이 필요합니다.' });
        }

        // URL에서 파일명 추출
        const fileName = path.basename(fileUrl);
        
        // AI 서버가 생성한 파일은 ai/outputs/에 있음
        let wavFilePath = path.join(__dirname, '../../../ai/outputs/', fileName);
        
        // ai/outputs/에 없으면 backend/uploads/voices/에서 찾기
        if (!fs.existsSync(wavFilePath)) {
            wavFilePath = path.join(__dirname, '../../uploads/voices/', fileName);
        }
        
        const mp3FileName = fileName.replace('.wav', '.mp3');
        const mp3FilePath = path.join(path.dirname(wavFilePath), mp3FileName);

        // WAV 파일 존재 여부 확인
        if (!fs.existsSync(wavFilePath)) {
            console.error('원본 WAV 파일을 찾을 수 없음:', fileName);
            return res.status(404).json({ message: '원본 파일을 찾을 수 없습니다.' });
        }

        // MP3 파일이 이미 존재하면 바로 전송
        if (fs.existsSync(mp3FilePath)) {
            return res.download(mp3FilePath, mp3FileName, (err) => {
                if (err) {
                    console.error('MP3 파일 다운로드 오류:', err);
                    res.status(500).json({ message: '파일 다운로드 중 오류가 발생했습니다.' });
                }
            });
        }

        // MP3 파일이 없으면 변환 필요
        // ffmpeg를 사용한 변환 (설치 필요: npm install fluent-ffmpeg)
        const ffmpeg = require('fluent-ffmpeg');
        
        ffmpeg(wavFilePath)
            .toFormat('mp3')
            .audioBitrate(128)
            .on('end', () => {
                console.log('MP3 변환 완료:', mp3FileName);
                res.download(mp3FilePath, mp3FileName, (err) => {
                    if (err) {
                        console.error('MP3 파일 다운로드 오류:', err);
                        res.status(500).json({ message: '파일 다운로드 중 오류가 발생했습니다.' });
                    }
                });
            })
            .on('error', (err) => {
                console.error('MP3 변환 오류:', err);
                res.status(500).json({ message: 'MP3 변환 중 오류가 발생했습니다.' });
            })
            .save(mp3FilePath);

    } catch (error) {
        console.error('MP3 다운로드 처리 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// ========================================
// 3. 이메일로 음성 파일 전송
// ========================================
router.post('/send-email', authMiddleware, async (req, res) => {
    try {
        const { recipientEmail, text, fileUrl, senderName } = req.body;
        const senderEmail = req.user.email; // JWT에서 발신자 이메일 가져오기

        // 입력 검증
        if (!recipientEmail || !fileUrl) {
            return res.status(400).json({ 
                message: '받는 사람 이메일과 파일 URL이 필요합니다.' 
            });
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            return res.status(400).json({ message: '올바른 이메일 형식이 아닙니다.' });
        }

        // 파일 경로 확인
        const fileName = path.basename(fileUrl);
        
        // AI 서버가 생성한 파일은 ai/outputs/에 있음
        let filePath = path.join(__dirname, '../../../ai/outputs/', fileName);
        
        // ai/outputs/에 없으면 backend/uploads/voices/에서 찾기
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, '../../uploads/voices/', fileName);
        }

        if (!fs.existsSync(filePath)) {
            console.error('전송할 파일을 찾을 수 없음:', fileName);
            return res.status(404).json({ message: '전송할 파일을 찾을 수 없습니다.' });
        }

        // Nodemailer 설정 (.env 파일에서 환경 변수로 관리)
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail', // 예: 'gmail', 'naver'
            auth: {
                user: process.env.EMAIL_USER, // 발신 이메일 주소
                pass: process.env.EMAIL_PASSWORD // 발신 이메일 비밀번호 또는 앱 비밀번호
            }
        });

        // 발신자 표시명 (이름이 있으면 이름, 없으면 이메일)
        const displaySender = senderName || senderEmail;

        // 이메일 내용 구성
        const mailOptions = {
            from: `"아보카도 🥑" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: `[아보카도] ${displaySender}님이 음성 파일을 공유했습니다`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fffbeb;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #166534; margin: 0; font-size: 32px;">🥑 아보카도</h1>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">AI 음성 변환 서비스</p>
                    </div>
                    
                    <div style="background-color: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="border-bottom: 2px solid #166534; padding-bottom: 15px; margin-bottom: 20px;">
                            <h2 style="color: #166534; font-size: 20px; margin: 0;">음성 파일 공유</h2>
                        </div>
                        
                        <div style="background-color: #f0fdf4; border-left: 4px solid #166534; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="color: #374151; margin: 0; font-size: 15px;">
                                <strong>${displaySender}</strong>님께서<br>
                                아보카도를 통해 음성 파일을 보내셨습니다.
                            </p>
                            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 13px;">
                                발신자: ${senderEmail}
                            </p>
                        </div>
                        
                        ${text ? `
                        <div style="background-color: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 8px;">
                            <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 13px; font-weight: bold;">📝 변환된 텍스트:</p>
                            <p style="color: #374151; margin: 0; line-height: 1.6; white-space: pre-wrap;">"${text}"</p>
                        </div>
                        ` : ''}
                        
                        <div style="background-color: #eff6ff; padding: 15px; margin-top: 20px; border-radius: 8px; text-align: center;">
                            <p style="color: #1e40af; margin: 0; font-size: 14px;">
                                🎵 첨부된 음성 파일을 다운로드하여 들어보세요!
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 5px 0;">이 메일은 아보카도 서비스에서 자동으로 발송되었습니다.</p>
                        <p style="margin: 5px 0;">이 메일에 회신하지 마세요.</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: fileName,
                    path: filePath
                }
            ]
        };

        // 이메일 전송
        const info = await transporter.sendMail(mailOptions);
        
        console.log('이메일 전송 성공:', info.messageId);
        console.log(`발신자: ${displaySender} (${senderEmail}) → 수신자: ${recipientEmail}`);
        
        res.status(200).json({ 
            success: true, 
            message: '이메일이 성공적으로 전송되었습니다.',
            messageId: info.messageId,
            sender: displaySender,
            recipient: recipientEmail
        });

    } catch (error) {
        console.error('이메일 전송 오류:', error);
        
        // 인증 오류 처리
        if (error.code === 'EAUTH') {
            return res.status(500).json({ 
                message: '이메일 서버 인증에 실패했습니다. 관리자에게 문의하세요.' 
            });
        }
        
        res.status(500).json({ 
            message: '이메일 전송 중 오류가 발생했습니다.',
            error: error.message 
        });
    }
});

module.exports = router;