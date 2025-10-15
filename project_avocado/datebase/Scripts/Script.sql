SELECT * FROM VoiceModel;

USE avocado_db;
SELECT * FROM User;


USE avocado_db;

-- 1. 기존의 기본 모델 데이터 삭제
USE avocado_db;

-- 1. 기존의 VoiceModel 테이블을 삭제합니다. (안의 데이터도 모두 사라집니다)
DROP TABLE OutputVoice; -- VoiceModel을 참조하고 있으므로 먼저 삭제해야 합니다.
DROP TABLE VoiceModel;

-- 2. 보내주신 스크린샷의 새로운 구조로 VoiceModel 테이블을 다시 만듭니다.
CREATE TABLE VoiceModel (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    type VARCHAR(20) NOT NULL, -- '기본' 또는 '커스텀'
    name VARCHAR(100) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- 3. 새로운 구조에 맞게 기본 모델 데이터를 다시 추가합니다.
-- (기본 모델은 특정 사용자에 속하지 않으므로, userId는 첫 번째 사용자인 1번으로 지정하겠습니다.)
INSERT INTO VoiceModel (userId, type, name) VALUES
(1, '기본', '남성'),
(1, '기본', '여성'),
(1, '기본', '캐릭터');

-- 4. 삭제했던 OutputVoice 테이블도 다시 만들어줍니다. (새로운 VoiceModel을 참조하도록)
CREATE TABLE OutputVoice (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    modelId VARCHAR(255), -- 이전에 수정한 VARCHAR 타입 유지
    text TEXT,
    fileUrl VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);