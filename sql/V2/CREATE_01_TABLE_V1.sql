-- =====================================================================
-- V1 baseline DDL (구 sql/CREATE_TABLE.sql, 2026-09-13 재편으로 이동)
--
-- boards / posts / tags / posts_tags 만 남는다.
--
-- 2026-09-27 운영 DB 실측(36테이블) 대조 결과 teams / users / user_roles /
-- events / coupons / notices / quiz_answers / player_card 3종(주석 처리,
-- player_legend 계열 4테이블은 sql/V2/CREATE_02_TABLE_PLAYER_LEGEND_V1.sql
-- 로 격리돼 있었으나 역시 DB 에 없어 그 파일 자체를 삭제)은 DB 에 실재하지
-- 않아 죽은 DDL 로 삭제했다.
--
-- 남긴 4테이블 운영 DB 현황: boards(4행) · posts(242행) · tags(6행) ·
-- posts_tags(0행) — 실데이터 보유, site_board/post/tag 로 이관 예정
-- (v2 부활 확정, table-classification.md §5-2) 이나 아직 미실행.
-- =====================================================================

USE compyafun;

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
