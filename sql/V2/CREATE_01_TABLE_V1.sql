-- =====================================================================
-- V1 baseline DDL (구 sql/CREATE_TABLE.sql, 2026-09-13 재편으로 이동)
--
-- teams / users / user_roles / events / coupons / boards / posts / tags /
-- posts_tags / notices / quiz_answers + 주석 처리된 player_card 계열.
-- player_legend 계열 4테이블은 별도 격리 — 하단 주석 참조.
--
-- 테이블별 운영 DB 현황 (2026-09-13 실측, 40테이블 기준):
--   teams          — 운영 DB 존재(20행). BE 참조 0건(실측). 사용자 결정 대기
--   boards/posts/tags/posts_tags — 운영 DB 존재. site_board/post/tag 로 이관 예정(v2 부활 확정,
--                    table-classification.md §5-2) 이나 아직 미실행 — 실데이터 보유 쪽은 이 파일
--   users/user_roles/events/coupons/notices/quiz_answers
--                  — 운영 DB(40테이블)에 없음. site_users/site_events/site_coupons/
--                    site_notices/fun_quiz 로 컷오버 완료 추정. DDL 은 기록 목적 보존
--   player_card 3종(주석 처리) — 0행 확인, 별도 DROP 스크립트 언급(파일 내 주석). 미적용 상태 그대로 보존
-- =====================================================================

USE compyafun;

CREATE TABLE teams
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_code      VARCHAR(10) NOT NULL, -- SAM, DOO
    team_name      VARCHAR(50) NOT NULL, -- 삼성 라이온즈
    latest_team_id BIGINT      NULL,     -- 최신 구단 포함 여부
    city           VARCHAR(50),          -- 대구
    start_year     SMALLINT,             -- 1982
    end_year       SMALLINT,             -- 1991
    emblem_url     VARCHAR(255),         -- 로고

    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_team_code (team_code),
    INDEX idx_latest_team_id (latest_team_id),

    CONSTRAINT fk_latest_team
        FOREIGN KEY (latest_team_id)
            REFERENCES teams (id)
);

-- ⚠️ 2026-09-13 — player_legend / player_legend_hitter_career /
-- player_legend_pitcher_career / legend_pitcher_pitch_slot 4테이블 DDL 은
-- 이 파일에서 분리해 sql/V2/CREATE_02_TABLE_PLAYER_LEGEND_V1.sql
-- 로 격리했다 (BE 참조 0건 + 운영 데이터 잔존 — 삭제는 사용자 결정 대기).
-- 근거: docs/global-guide/develop/specs/db/sql-folder-map.md §4

-- ⚠️ 운영 DB 에 존재하지 않음 (2026-09-13 대조)
CREATE TABLE users
(
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider            VARCHAR(20)  NOT NULL, -- NAVER
    provider_id         VARCHAR(100) NOT NULL, -- NAVER UNIQUE ID
    oauth_nickname      VARCHAR(20),
    oauth_email         VARCHAR(255),
    oauth_profile_image VARCHAR(500),
    oauth_age_range     VARCHAR(10),
    nickname            VARCHAR(20),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at       TIMESTAMP DEFAULT '0000-00-00 00:00:00',

    UNIQUE KEY uk_provider (provider, provider_id)
);


-- ⚠️ 운영 DB 에 존재하지 않음 (2026-09-13 대조)
CREATE TABLE user_roles
(
    user_id    BIGINT PRIMARY KEY,
    role       ENUM ('ADMIN', 'USER') NOT NULL                      DEFAULT 'USER',
    status     ENUM ('ACTIVE', 'BLOCKED', 'WITHDRAWN', 'SUSPENDED') DEFAULT 'ACTIVE',
    ban_reason VARCHAR(255),
    created_at TIMESTAMP                                            DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP                                            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users (id)
            ON DELETE CASCADE
);


-- ⚠️ 운영 DB 에 존재하지 않음 (2026-09-13 대조)
CREATE TABLE events
(
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_type    ENUM ('OFFICIAL', 'INTERNAL') NOT NULL DEFAULT 'OFFICIAL', -- OFFICIAL / INTERNAL
    title         VARCHAR(255)                  NOT NULL,
    start_at      DATETIME                      NOT NULL,
    expire_at     DATETIME                      NOT NULL,
    image_url     VARCHAR(500)                  NOT NULL,
    external_link VARCHAR(500),
    is_visible    BOOLEAN                       NOT NULL DEFAULT true,
    created_at    TIMESTAMP                              DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP                              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK ( expire_at > start_at ),

    INDEX idx_events_visible_period (is_visible, start_at, expire_at)
);

-- ⚠️ 운영 DB 에 존재하지 않음 (2026-09-13 대조)
CREATE TABLE coupons
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,

    coupon_code VARCHAR(100) NOT NULL UNIQUE,       -- CPB2025CAFE40
    title       VARCHAR(255) NOT NULL,              -- 플래티넘 코치팩 1장
    detail      VARCHAR(500),                       -- 40만 달성 쿠폰

    expire_at   DATETIME     NOT NULL,              -- 만료일

    is_visible  BOOLEAN      NOT NULL DEFAULT true, -- 관리자 노출 제어

    created_at  TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_coupons_visible_period (is_visible, expire_at),
    INDEX idx_coupons_expire_at (expire_at)
);


CREATE TABLE boards
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,

    code        VARCHAR(50)            NOT NULL UNIQUE,
    -- TIP, FREE, CLUB, NOTICE 등 (URL 기준)

    name        VARCHAR(100)           NOT NULL,
    description VARCHAR(255),

    write_role  ENUM ('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    read_role   ENUM ('ALL', 'LOGIN')  NOT NULL DEFAULT 'ALL',

    is_visible  BOOLEAN                NOT NULL DEFAULT true,
    is_deleted  BOOLEAN                NOT NULL DEFAULT false,

    sort_order  INT                             DEFAULT 0,

    created_at  TIMESTAMP                       DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP                       DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE posts
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,

    board_id     BIGINT                        NOT NULL,

    author_type  ENUM ('ADMIN', 'USER')        NOT NULL,
    author_id    BIGINT                        NULL,
    author_name  VARCHAR(50)                   NOT NULL,

    title        VARCHAR(255)                  NOT NULL,
    content      LONGTEXT                      NULL,

    link_type    ENUM ('INTERNAL', 'EXTERNAL') NOT NULL DEFAULT 'INTERNAL',
    external_url VARCHAR(500)                  NULL,

    is_pinned    BOOLEAN                       NOT NULL DEFAULT false,
    is_visible   BOOLEAN                       NOT NULL DEFAULT true,

    view_count   INT                           NOT NULL DEFAULT 0,

    created_at   TIMESTAMP                              DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP                              DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (board_id) REFERENCES boards (id),

    INDEX idx_board_visible_created (board_id, is_visible, created_at),
    INDEX idx_board_pinned_created (board_id, is_pinned, created_at), -- 게시판별 목록, 고정글 (운영 DB 실측 — DESC 미적용 확인)
    INDEX idx_author (author_type, author_id)                                   -- 작성자 기준 조회
);


CREATE TABLE tags
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,

    code        VARCHAR(50) NOT NULL UNIQUE, -- NEWBIE, RECOMMEND, SKILL
    name        VARCHAR(50) NOT NULL,        -- 뉴비, 추천, 스킬

    description VARCHAR(255),

    is_visible  BOOLEAN     NOT NULL DEFAULT true,
    is_deleted  BOOLEAN     NOT NULL DEFAULT false,

    created_at  TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP            DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE posts_tags
(
    post_id BIGINT NOT NULL,
    tag_id  BIGINT NOT NULL,

    PRIMARY KEY (post_id, tag_id),

    INDEX tag_id (tag_id), -- 운영 DB 실측: FK 컬럼 자동 생성 인덱스

    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id)
);

-- ⚠️ 운영 DB 에 존재하지 않음 (2026-09-13 대조)
CREATE TABLE notices
(
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    source       ENUM ('INTERNAL','EXTERNAL') NOT NULL COMMENT 'INTERNAL / EXTERNAL',
    title        VARCHAR(255)                 NOT NULL,
    summary      TEXT                         NULL,
    content      LONGTEXT                     NULL,
    external_url VARCHAR(500)                 NULL,

    is_visible   BOOLEAN                      NOT NULL DEFAULT true,
    is_pinned    BOOLEAN                      NOT NULL DEFAULT false,

    created_at   TIMESTAMP                             DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP                             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (
        (source = 'INTERNAL' AND content IS NOT NULL AND external_url IS NULL)
            OR
        (source = 'EXTERNAL' AND content IS NULL AND external_url IS NOT NULL)
        )
);

-- =====================================================================
-- /* v1 기준 플레이어카드 */  2026-09-02 비활성화
--
-- 데이터가 한 건도 없어 DROP 대상으로 확정했다.
-- 실제 DROP 문 : sql/cleanup/drop_player_card_v1_v2.sql
-- 대응 Java   : domain/player/** (전량 주석 처리)
--
-- ※ player_legend* 는 v1 실데이터가 있어 DROP 보류 — 그대로 둔다.
-- =====================================================================
-- CREATE TABLE player_card
-- (
--     id          BIGINT AUTO_INCREMENT PRIMARY KEY,
--
--     -- 카드 식별
--     card_code   VARCHAR(60)                                                             NOT NULL COMMENT 'GRADE_ROLE_TEAM_PLAYER_YEAR',
--     name        VARCHAR(50)                                                             NOT NULL,
--
--     team_id     BIGINT                                                                  NOT NULL,
--
--     role        ENUM ('HITTER','PITCHER')                                               NOT NULL,
--     grade       ENUM ('LEGEND','EPIC','PLATINUM','MVP','NATIONAL', 'ALLSTAR', 'GOLDEN') NOT NULL,
--
--     -- 시즌 (LEGEND는 NULL 허용)
--     season_year SMALLINT                                                                NULL COMMENT 'LEGEND는 NULL',
--
--     overall     SMALLINT                                                                NOT NULL,
--     back_number SMALLINT,
--     birth_date  DATE,
--     bat_throw   VARCHAR(10),
--
--     positions   JSON                                                                    NOT NULL,
--     traits      JSON,
--
--     created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
--         ON UPDATE CURRENT_TIMESTAMP,
--
--     -- 제약
--     UNIQUE KEY uk_card_code (card_code),
--
--     INDEX idx_team_id (team_id),
--     INDEX idx_grade (grade),
--     INDEX idx_role (role),
--     INDEX idx_season_year (season_year),
--     INDEX idx_grade_year (grade, season_year),
--
--     CONSTRAINT fk_card_team
--         FOREIGN KEY (team_id)
--             REFERENCES teams (id),
--
--     CONSTRAINT chk_grade_year
--         CHECK (
--             (grade = 'LEGEND' AND season_year IS NULL)
--                 OR
--             (grade <> 'LEGEND' AND season_year IS NOT NULL)
--             )
-- );
--
-- CREATE TABLE player_card_hitter_attributes
-- (
--     card_id  BIGINT PRIMARY KEY,
--
--     accuracy SMALLINT NOT NULL COMMENT '정확',
--     power    SMALLINT NOT NULL COMMENT '파워',
--     contact  SMALLINT NOT NULL COMMENT '선구',
--     speed    SMALLINT NOT NULL COMMENT '주력',
--     defense  SMALLINT NOT NULL COMMENT '수비',
--
--     CONSTRAINT fk_card_hitter_attr
--         FOREIGN KEY (card_id)
--             REFERENCES player_card (id)
--             ON DELETE CASCADE
-- );
--
-- CREATE TABLE player_card_pitcher_attributes
-- (
--     card_id  BIGINT PRIMARY KEY,
--
--     control  SMALLINT NOT NULL COMMENT '제구',
--     velocity SMALLINT NOT NULL COMMENT '구위',
--     stamina  SMALLINT NOT NULL COMMENT '체력',
--     fastball SMALLINT NOT NULL COMMENT '직구',
--     breaking SMALLINT NOT NULL COMMENT '변화',
--
--     CONSTRAINT fk_card_pitcher_attr
--         FOREIGN KEY (card_id)
--             REFERENCES player_card (id)
--             ON DELETE CASCADE
-- );

-- ⚠️ 운영 DB 에 존재하지 않음 (2026-09-13 대조)
CREATE TABLE quiz_answers
(
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    round      INT          NOT NULL COMMENT '퀴즈 회차 번호 (예: 877)',
    title      VARCHAR(100) NOT NULL COMMENT '표시 제목 (예: 컴프야 퀴즈 이벤트 877회 정답)',
    image_url  VARCHAR(500) NOT NULL COMMENT 'S3 이미지 URL',
    is_visible BOOLEAN      NOT NULL DEFAULT true,
    created_at DATETIME     NOT NULL,
    updated_at DATETIME     NOT NULL,
    UNIQUE KEY uq_round (round)
);
