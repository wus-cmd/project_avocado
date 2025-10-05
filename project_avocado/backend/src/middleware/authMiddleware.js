const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    // 1. 요청 헤더에서 토큰 추출
    // 보통 'Authorization': 'Bearer TOKEN_VALUE' 형태로 전달됨
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. 검증 성공 시, 요청 객체에 사용자 정보 추가
        // 이렇게 하면 이 미들웨어를 통과한 모든 API에서 req.user로 사용자 정보에 접근 가능
        req.user = decoded;
        next(); // 다음 미들웨어나 API 로직으로 제어를 넘김

    } catch (error) {
        // 4. 토큰이 유효하지 않은 경우 (만료 등)
        if (error.name === 'TokenExpiredError') {
            return res.status(419).json({ message: '토큰이 만료되었습니다.' });
        }
        return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
};

module.exports = authMiddleware;