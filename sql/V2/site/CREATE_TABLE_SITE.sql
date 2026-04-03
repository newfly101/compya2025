CREATE TABLE site_coupons
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    coupon_code VARCHAR(100) NOT NULL UNIQUE,
    title       VARCHAR(255) NOT NULL,
    detail      VARCHAR(500),
    expire_at   DATETIME     NOT NULL,
    is_visible  BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE site_notices
(
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    source         ENUM ('INTERNAL', 'EXTERNAL') NOT NULL COMMENT '사이트 내부 작성 / 외부 링크 공지',
    title          VARCHAR(255) NOT NULL COMMENT '공지 제목',
    summary        TEXT NULL COMMENT '목록용 요약',
    content        LONGTEXT NULL COMMENT '내부 공지 본문',
    external_url   VARCHAR(500) NULL COMMENT '외부 공지 링크',

    is_visible     BOOLEAN NOT NULL DEFAULT true COMMENT '사용자 노출 여부',
    is_pinned      BOOLEAN NOT NULL DEFAULT false COMMENT '상단 고정 여부',

    published_at   DATETIME NULL COMMENT '실제 게시 시각',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_site_notices_source_payload
        CHECK (
            (source = 'INTERNAL' AND content IS NOT NULL AND external_url IS NULL)
                OR
            (source = 'EXTERNAL' AND content IS NULL AND external_url IS NOT NULL)
            ),

    INDEX idx_site_notices_visible_pinned_created (is_visible, is_pinned, created_at DESC),
    INDEX idx_site_notices_source (source),
    INDEX idx_site_notices_published_at (published_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
    COMMENT ='사이트 공지사항 통합 관리';

CREATE TABLE site_events
(
    id            BIGINT AUTO_INCREMENT COMMENT '이벤트 고유 식별자 (PK)',
    event_type    ENUM ('OFFICIAL', 'INTERNAL') NOT NULL DEFAULT 'OFFICIAL' COMMENT '이벤트 유형 (OFFICIAL: 외부 공개 이벤트, INTERNAL: 내부 이벤트)',
    title         VARCHAR(255)                  NOT NULL COMMENT '이벤트 제목',
    start_at      DATETIME                      NOT NULL COMMENT '이벤트 시작 일시',
    expire_at     DATETIME                      NOT NULL COMMENT '이벤트 종료 일시',
    image_url     VARCHAR(500)                  NOT NULL COMMENT '이벤트 이미지 URL',
    external_link VARCHAR(500)                           COMMENT '이벤트 외부 연결 링크',
    is_visible    BOOLEAN                       NOT NULL DEFAULT TRUE COMMENT '이벤트 노출 여부',
    created_at    DATETIME                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at    DATETIME                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),

    CONSTRAINT chk_site_events_expire_after_start
        CHECK (expire_at > start_at),

    INDEX idx_site_events_visible_period (is_visible, start_at, expire_at)
) COMMENT = '사이트 이벤트 정보';
