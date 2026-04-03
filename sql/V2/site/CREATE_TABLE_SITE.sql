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


CREATE TABLE site_users
(
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY   COMMENT '사용자 고유 ID',

    -- OAuth 정보
    oauth_provider          VARCHAR(20)  NOT NULL               COMMENT 'OAuth 제공자 (NAVER)',
    oauth_provider_id       VARCHAR(100) NOT NULL               COMMENT 'OAuth 제공자 고유 ID',
    oauth_nickname          VARCHAR(20)                         COMMENT 'OAuth 제공자 닉네임',
    oauth_email             VARCHAR(255)                        COMMENT 'OAuth 제공자 이메일',
    oauth_profile_image     VARCHAR(500)                        COMMENT 'OAuth 제공자 프로필 이미지 URL',
    oauth_age_range         VARCHAR(10)                         COMMENT 'OAuth 제공자 연령대 (예: 20~29)',

    -- 서비스 자체 정보
    service_nickname        VARCHAR(20)                         COMMENT '서비스 자체 닉네임 (미설정 시 NULL)',
    user_role               ENUM('ADMIN', 'USER')      NOT NULL DEFAULT 'USER'   COMMENT '사용자 권한',
    user_status             ENUM('ACTIVE', 'BLOCKED', 'WITHDRAWN', 'SUSPENDED')
        NOT NULL DEFAULT 'ACTIVE' COMMENT '계정 상태 (ACTIVE: 정상, BLOCKED: 차단, WITHDRAWN: 탈퇴, SUSPENDED: 정지)',

    created_at              DATETIME DEFAULT CURRENT_TIMESTAMP                  COMMENT '최초 가입일',
    updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    last_login_at           DATETIME DEFAULT CURRENT_TIMESTAMP                  COMMENT '마지막 로그인 시각',

    UNIQUE KEY uk_oauth (oauth_provider, oauth_provider_id)     COMMENT 'OAuth 제공자 + 고유 ID 복합 유니크'
) COMMENT = '서비스 사용자 테이블';
