-- 등급·칭호·포인트 (gamification) 초안 — 실행 금지 (test = prod 동일 DB. 사용자 재승인 후 ops 트랙에서 실행)
-- FK 없음. 원장은 append-only (회수는 음수 행). 같은 reward_key 는 UNIQUE 로 한 번만 들어간다.

CREATE TABLE site_reward_rules
(
    activity_type    VARCHAR(30) PRIMARY KEY COMMENT '활동 종류 (CHECKIN / SAVE / FIRST_SAVE / STREAK7)',
    xp               INT NOT NULL DEFAULT 0 COMMENT '1회 XP',
    point            INT NOT NULL DEFAULT 0 COMMENT '1회 포인트',
    daily_limit      INT NULL COMMENT '하루 인정 횟수. NULL = 무제한',
    once_per_account TINYINT(1) NOT NULL DEFAULT 0 COMMENT '계정당 1회만'
) COMMENT '활동별 배점·한도';

CREATE TABLE site_reward_levels
(
    level               INT PRIMARY KEY COMMENT '등급 번호 1~10',
    name                VARCHAR(30) NOT NULL COMMENT '등급명',
    required_xp         INT NOT NULL COMMENT '도달에 필요한 누적 XP',
    levelup_bonus_point INT NOT NULL DEFAULT 0 COMMENT '이 등급에 오를 때 보너스 포인트'
) COMMENT '등급 정의';

CREATE TABLE site_reward_ledger
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL COMMENT 'site_users.id',
    reward_key  VARCHAR(100) NOT NULL COMMENT '중복 방지 키 (예: CHECKIN:12:2026-10-08)',
    source_type VARCHAR(30) NOT NULL COMMENT 'CHECKIN / SAVE / FIRST_SAVE / STREAK7 / LEVELUP / TITLE / ADMIN',
    xp_delta    INT NOT NULL DEFAULT 0,
    point_delta INT NOT NULL DEFAULT 0,
    reward_date DATE NOT NULL COMMENT '한국 시간(KST) 기준 날짜',
    ref_code    VARCHAR(50) NULL COMMENT '칭호 코드 등 관련 값',
    reason      VARCHAR(200) NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_reward_key (reward_key),
    KEY idx_ledger_user_date (user_id, reward_date)
) COMMENT '경험치·포인트 원장';

CREATE TABLE site_reward_activity
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT NOT NULL,
    activity_type VARCHAR(30) NOT NULL COMMENT 'SAVE',
    reward_date   DATE NOT NULL COMMENT 'KST 날짜',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_activity_user_type (user_id, activity_type)
) COMMENT '활동 기록 (저장 횟수 집계용)';

CREATE TABLE site_titles
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(30) NOT NULL,
    name        VARCHAR(30) NOT NULL,
    category    ENUM ('EARLY','ACTIVITY','MANUAL') NOT NULL,
    bonus_point INT NOT NULL DEFAULT 0,
    signup_from DATE NULL COMMENT '얼리어답터: 가입일 시작',
    signup_to   DATE NULL COMMENT '얼리어답터: 가입일 끝',
    grant_end   DATE NULL COMMENT '지급 마감일. NULL = 무기한',
    UNIQUE KEY uq_title_code (code)
) COMMENT '칭호 정의';

CREATE TABLE site_user_titles
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    title_id   BIGINT NOT NULL,
    equipped   TINYINT(1) NOT NULL DEFAULT 0 COMMENT '대표 칭호 (유저당 최대 1개)',
    granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_title (user_id, title_id)
) COMMENT '유저 보유 칭호';
