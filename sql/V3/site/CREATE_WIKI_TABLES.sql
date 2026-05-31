-- ============================================================
-- WIKI TABLES (V3)
-- ENC-5/6 (PITCHER / HITTER game-info) + admin CRUD 백킹
-- 실행: ops 트랙 또는 사용자가 직접 운영 DB 에 적용
-- ============================================================

CREATE TABLE IF NOT EXISTS wiki_pitch (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    code          VARCHAR(30)  NOT NULL UNIQUE,
    name          VARCHAR(50)  NOT NULL,
    pitch_type    ENUM('FASTBALL', 'BREAKING', 'OFFSPEED') NOT NULL,
    description   TEXT,
    display_order INT          DEFAULT 0,
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pitch_type_active (pitch_type, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wiki_pitch_grade (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    pitch_code    VARCHAR(30)  NOT NULL,
    grade         CHAR(1)      NOT NULL,
    velocity_min  INT,
    velocity_max  INT,
    break_amount  INT,
    description   VARCHAR(255),
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_pitch_grade (pitch_code, grade),
    CONSTRAINT fk_wiki_pitch_grade_code FOREIGN KEY (pitch_code) REFERENCES wiki_pitch (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wiki_stat_influence (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    target           ENUM('PITCHER', 'HITTER') NOT NULL,
    stat_code        VARCHAR(30)  NOT NULL,
    influence_type   ENUM('PITCH', 'SKILL', 'GENERAL') NOT NULL,
    influence_target VARCHAR(50)  NOT NULL,
    weight           INT          DEFAULT 1,
    description      TEXT,
    display_order    INT          DEFAULT 0,
    is_active        BOOLEAN      DEFAULT TRUE,
    created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_target_active (target, is_active),
    INDEX idx_stat_code (stat_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
