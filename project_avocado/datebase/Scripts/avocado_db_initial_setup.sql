-- 🥑 프로젝트 아보카도(Avocado) 데이터베이스 최종 설정 스크립트
-- 버전: 3.0 (Final & Bug Fixed)
-- 최종 수정일: 2025-10-20
-- 목적: 기존 백엔드 코드와 완벽하게 호환되도록 데이터베이스 구조를 수정합니다.

-- =================================================================
-- 1. 데이터베이스 생성
-- =================================================================
DROP DATABASE IF EXISTS avocado_db;
CREATE DATABASE avocado_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE avocado_db;

-- =================================================================
-- 2. 테이블 생성 (DDL - Data Definition Language)
-- =================================================================

-- 2.1. user: 사용자 정보 테이블
CREATE TABLE user (
    id          INT             NOT NULL AUTO_INCREMENT,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    pw          VARCHAR(255)    NOT NULL,
    name        VARCHAR(100)    NOT NULL,
    age         INT             NULL,
    gender      VARCHAR(10)     NULL,
    createdAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) COMMENT '사용자 정보 테이블';


-- 2.2. voicemodel: 음성 모델 정보 테이블
CREATE TABLE voicemodel (
    id                  INT             NOT NULL AUTO_INCREMENT,
    userId              INT             NULL,
    type                VARCHAR(20)     NOT NULL,
    name                VARCHAR(100)    NOT NULL,
    filePath            VARCHAR(255)    NOT NULL,
    createdAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
) COMMENT '음성 모델 정보 테이블';


-- 2.3. outputvoice: 음성 변환 결과 기록 테이블
-- [최종 수정] modelId 타입을 백엔드 로직에 맞춰 VARCHAR로 변경하고 외래 키 제약 조건을 제거합니다.
CREATE TABLE outputvoice (
    id          INT             NOT NULL AUTO_INCREMENT,
    userId      INT             NOT NULL,
    modelId     VARCHAR(255)    NOT NULL, -- INT -> VARCHAR(255)로 변경
    text        TEXT            NOT NULL,
    fileUrl     VARCHAR(512)    NOT NULL,
    createdAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    -- modelId에 대한 외래 키(FOREIGN KEY) 제약 조건 제거
) COMMENT '음성 변환 결과 기록 테이블';


-- =================================================================
-- 3. 초기 데이터 삽입 (DML - Data Manipulation Language)
-- =================================================================
INSERT INTO voicemodel (userId, type, name, filePath) VALUES
(NULL, 'base', '남성', 'default_male.wav'),
(NULL, 'base', '여성', 'default_female.wav'),
(NULL, 'base', '캐릭터', 'default_character.wav');


-- =================================================================
-- 4. 스크립트 실행 완료 확인
-- =================================================================
SELECT '✅ [성공] avocado_db 데이터베이스 및 모든 테이블이 정상적으로 생성되었습니다.' AS 'Status';
SELECT '✅ [정보] 백엔드 코드와 완벽하게 호환되는 최종 버전입니다.' AS 'Info';

