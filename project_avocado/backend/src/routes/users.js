const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();

// POST /api/register - 회원가입
router.post('/register', async (req, res) => {
    const { email, pw, name, age, gender } = req.body;
    if (!email || !pw) {
        return res.status(400).json({ message: '이메일과 비밀번호를 모두 입력해주세요.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(pw, 10);
        const [result] = await db.query(
            'INSERT INTO User (email, pw, name, age, gender) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, name, age, gender]
        );
        res.status(201).json({ message: '회원가입이 완료되었습니다.', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
        }
        console.error(error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// POST /api/login - 로그인 및 JWT 발급
router.post('/login', async (req, res) => {
    const { email, pw } = req.body;
    if (!email || !pw) {
        return res.status(400).json({ message: '이메일과 비밀번호를 모두 입력해주세요.' });
    }
    try {
        const [rows] = await db.query('SELECT * FROM User WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }
        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(pw, user.pw);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }
        const payload = { id: user.id, email: user.email, name: user.name };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ message: '로그인 성공!', token: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// GET /api/user/:id - 사용자 정보 조회 (인증 필요)
router.get('/user/:id', authMiddleware, async (req, res) => {
    const requestedUserId = parseInt(req.params.id, 10);
    if (req.user.id !== requestedUserId) {
        return res.status(403).json({ message: '권한이 없습니다.' });
    }
    res.json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name
    });
});

// GET /api/user/profile - 현재 로그인한 사용자 프로필 조회
router.get('/user/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [rows] = await db.query(
            'SELECT id, email, name, age, gender FROM User WHERE id = ?',
            [userId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('프로필 조회 오류:', error);
        res.status(500).json({ message: '프로필 조회에 실패했습니다.' });
    }
});

module.exports = router;