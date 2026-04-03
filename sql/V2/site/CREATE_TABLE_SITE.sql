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


-- ============================================================
-- 게시판 전체 DDL
-- MySQL 8.0+  /  1차 운영용  /  커뮤니티 확장 고려
-- 페이징 : cursor 기반 (created_at + id 복합 커서)
-- 댓글   : 2단계 고정 (댓글 + 대댓글)
-- 반응   : 좋아요 / 싫어요 / 신고 (관리자 확인)
-- ============================================================


-- ============================================================
-- 1. site_board  게시판 메타
-- ============================================================
CREATE TABLE site_board
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,

    code        VARCHAR(50)            NOT NULL UNIQUE  COMMENT 'URL 식별자. ex) tip, free, notice — board_type 대신 code 로 분기',
    name        VARCHAR(100)           NOT NULL         COMMENT '게시판 표시명',
    description VARCHAR(255)           NULL             COMMENT '게시판 설명 (선택)',

    write_role  ENUM ('ADMIN', 'USER') NOT NULL DEFAULT 'USER'  COMMENT '쓰기 권한. ADMIN=관리자 전용(공지), USER=일반 유저',
    read_role   ENUM ('ALL', 'LOGIN')  NOT NULL DEFAULT 'ALL'   COMMENT '읽기 권한. ALL=비로그인 허용, LOGIN=로그인 필수',

    use_comment BOOLEAN                NOT NULL DEFAULT TRUE   COMMENT '댓글 기능 사용 여부 — FALSE 시 UI 숨김 + API 차단',
    use_like    BOOLEAN                NOT NULL DEFAULT TRUE   COMMENT '좋아요/싫어요 기능 사용 여부',
    use_tag     BOOLEAN                NOT NULL DEFAULT TRUE   COMMENT '태그 기능 사용 여부',

    is_visible  BOOLEAN                NOT NULL DEFAULT TRUE   COMMENT '노출 여부. FALSE 시 네비게이션에서 숨김',
    is_deleted  BOOLEAN                NOT NULL DEFAULT FALSE  COMMENT 'soft delete. TRUE 시 전체 조회 제외',

    sort_order  INT                    NOT NULL DEFAULT 0      COMMENT '네비게이션 정렬 순서. 낮을수록 앞에 노출',

    created_at  DATETIME               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 네비게이션 목록: 삭제 안 됨 + 노출 중 + sort_order 순
    INDEX idx_board_list (is_deleted, is_visible, sort_order, id)
);


-- ============================================================
-- 2. site_post  게시글
-- ============================================================
CREATE TABLE site_post
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,

    board_id    BIGINT NOT NULL  COMMENT '소속 게시판 FK',

    author_type ENUM ('ADMIN', 'USER') NOT NULL  COMMENT '작성자 유형. 관리자 공지 vs 일반 유저 구분',
    author_id   BIGINT                 NULL       COMMENT '작성자 ID. 탈퇴 회원은 NULL 허용 — 글은 보존',
    author_name VARCHAR(50)            NOT NULL   COMMENT '작성 시점 닉네임 스냅샷. 탈퇴/변경 후에도 원본 유지',

    title        VARCHAR(255)                  NOT NULL  COMMENT '게시글 제목',
    content      LONGTEXT                      NULL      COMMENT '본문 (에디터 HTML). 외부 링크 글은 NULL 가능',

    link_type    ENUM ('INTERNAL', 'EXTERNAL') NOT NULL DEFAULT 'INTERNAL'  COMMENT 'INTERNAL=일반 본문 글, EXTERNAL=외부 URL 연결 글',
    external_url VARCHAR(500)                  NULL                         COMMENT 'link_type=EXTERNAL 일 때 이동할 외부 URL',

    is_pinned   BOOLEAN NOT NULL DEFAULT FALSE  COMMENT '상단 고정 여부. 목록 정렬 시 고정글 먼저 노출',
    is_visible  BOOLEAN NOT NULL DEFAULT TRUE   COMMENT '노출 여부. 관리자가 숨김 처리 시 FALSE',
    is_deleted  BOOLEAN NOT NULL DEFAULT FALSE  COMMENT 'soft delete. 실제 데이터는 유지',

    -- 목록 표시용 denormalized 카운터 (매 조회마다 COUNT 쿼리 방지)
    -- 정합성은 INSERT/DELETE 트랜잭션에서 함께 UPDATE
    view_count    INT NOT NULL DEFAULT 0  COMMENT '조회수',
    comment_count INT NOT NULL DEFAULT 0  COMMENT '댓글+대댓글 총 개수 (site_comment 연동)',
    like_count    INT NOT NULL DEFAULT 0  COMMENT '좋아요 수 (site_post_reaction 연동)',
    dislike_count INT NOT NULL DEFAULT 0  COMMENT '싫어요 수 (site_post_reaction 연동)',
    report_count  INT NOT NULL DEFAULT 0  COMMENT '누적 신고 수. 관리자 대시보드 기준값',

    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_post_board FOREIGN KEY (board_id) REFERENCES site_board (id),

    -- 목록 조회 기본 (cursor: created_at + id / 고정글 우선)
    INDEX idx_post_list    (board_id, is_deleted, is_visible, is_pinned, created_at DESC, id DESC),
    -- 인기순 정렬 (좋아요 기준)
    INDEX idx_post_popular (board_id, is_deleted, is_visible, like_count DESC, id DESC),
    -- 내 글 조회 (마이페이지)
    INDEX idx_post_author  (author_type, author_id, created_at DESC, id DESC),
    -- 관리자 신고 대시보드: 신고 많은 글 우선
    INDEX idx_post_report  (report_count DESC, id DESC)
);


-- ============================================================
-- 3. site_comment  댓글 / 대댓글 (2단계 고정)
-- ============================================================
CREATE TABLE site_comment
(
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,

    post_id           BIGINT NOT NULL  COMMENT '소속 게시글 FK',
    parent_comment_id BIGINT NULL      COMMENT 'NULL=댓글(1단계), 값 있음=대댓글(2단계). 3단계 이상 금지',

    author_type ENUM ('ADMIN', 'USER') NOT NULL  COMMENT '작성자 유형',
    author_id   BIGINT                 NULL       COMMENT '작성자 ID. 탈퇴 시 NULL 허용',
    author_name VARCHAR(50)            NOT NULL   COMMENT '작성 시점 닉네임 스냅샷',

    content TEXT NOT NULL  COMMENT '댓글 본문',

    is_visible BOOLEAN NOT NULL DEFAULT TRUE   COMMENT '노출 여부. FALSE 시 "관리자에 의해 숨겨진 댓글" 표시',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE  COMMENT 'soft delete. TRUE 시 "삭제된 댓글입니다" 표시 (대댓글 맥락 보존)',

    like_count    INT NOT NULL DEFAULT 0  COMMENT '좋아요 수 (site_comment_reaction 연동)',
    dislike_count INT NOT NULL DEFAULT 0  COMMENT '싫어요 수',
    report_count  INT NOT NULL DEFAULT 0  COMMENT '누적 신고 수',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_comment_post   FOREIGN KEY (post_id)           REFERENCES site_post    (id),
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES site_comment (id),

    -- 게시글의 댓글 목록 (cursor 기반 / 오래된 순)
    -- parent_comment_id 포함: 댓글만 or 특정 댓글의 대댓글만 조회 모두 커버
    INDEX idx_comment_list   (post_id, is_deleted, parent_comment_id, created_at ASC, id ASC),
    -- 대댓글 별도 조회
    INDEX idx_comment_parent (parent_comment_id, created_at ASC, id ASC)
);


-- ============================================================
-- 4. site_tag  태그 마스터
-- ============================================================
CREATE TABLE site_tag
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,

    code        VARCHAR(50)  NOT NULL UNIQUE  COMMENT '태그 식별자. ex) newbie, recommend, skill',
    name        VARCHAR(50)  NOT NULL         COMMENT '태그 표시명. ex) 뉴비, 추천, 스킬',
    description VARCHAR(255) NULL             COMMENT '태그 설명 (관리자용)',

    is_visible BOOLEAN NOT NULL DEFAULT TRUE   COMMENT '노출 여부. FALSE 시 태그 선택 UI에서 숨김',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE  COMMENT 'soft delete',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- ============================================================
-- 5. site_post_tag  게시글-태그 매핑
-- ============================================================
CREATE TABLE site_post_tag
(
    post_id BIGINT NOT NULL  COMMENT '게시글 FK',
    tag_id  BIGINT NOT NULL  COMMENT '태그 FK',

    PRIMARY KEY (post_id, tag_id),

    CONSTRAINT fk_post_tag_post FOREIGN KEY (post_id) REFERENCES site_post (id) ON DELETE CASCADE,
    CONSTRAINT fk_post_tag_tag  FOREIGN KEY (tag_id)  REFERENCES site_tag  (id),

    -- 태그 클릭 시 해당 태그 글 목록 역조회
    INDEX idx_post_tag_by_tag (tag_id, post_id)
);


-- ============================================================
-- 6. site_post_reaction  게시글 좋아요 / 싫어요
-- ============================================================
CREATE TABLE site_post_reaction
(
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,

    post_id  BIGINT                    NOT NULL  COMMENT '대상 게시글 FK',
    user_id  BIGINT                    NOT NULL  COMMENT '반응한 유저 ID',
    reaction ENUM ('LIKE', 'DISLIKE')  NOT NULL  COMMENT 'LIKE=좋아요, DISLIKE=싫어요. 변경 시 UPDATE / 취소 시 DELETE',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_post_reaction_post FOREIGN KEY (post_id) REFERENCES site_post (id) ON DELETE CASCADE,

    -- 1인 1반응 강제 (좋아요 + 싫어요 동시 불가)
    UNIQUE KEY uq_post_reaction_user (post_id, user_id),

    -- 유저가 반응한 글 목록 조회 (마이페이지)
    INDEX idx_post_reaction_user (user_id, post_id)
);


-- ============================================================
-- 7. site_comment_reaction  댓글 좋아요 / 싫어요
-- ============================================================
CREATE TABLE site_comment_reaction
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,

    comment_id BIGINT                    NOT NULL  COMMENT '대상 댓글 FK',
    user_id    BIGINT                    NOT NULL  COMMENT '반응한 유저 ID',
    reaction   ENUM ('LIKE', 'DISLIKE')  NOT NULL  COMMENT 'LIKE=좋아요, DISLIKE=싫어요. 변경 시 UPDATE / 취소 시 DELETE',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comment_reaction_comment FOREIGN KEY (comment_id) REFERENCES site_comment (id) ON DELETE CASCADE,

    -- 1인 1반응 강제
    UNIQUE KEY uq_comment_reaction_user (comment_id, user_id),

    -- 유저가 반응한 댓글 목록 조회
    INDEX idx_comment_reaction_user (user_id, comment_id)
);


-- ============================================================
-- 8. site_report  신고 (게시글 / 댓글 공용)
-- ============================================================
CREATE TABLE site_report
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,

    target_type ENUM ('POST', 'COMMENT') NOT NULL  COMMENT '신고 대상 유형. POST=게시글, COMMENT=댓글',
    target_id   BIGINT                   NOT NULL  COMMENT '신고 대상 ID. target_type 에 따라 site_post.id 또는 site_comment.id',

    reporter_id BIGINT NOT NULL  COMMENT '신고한 유저 ID',

    reason ENUM (
        'SPAM',            -- 스팸 / 광고
        'OBSCENE',         -- 음란물
        'ABUSE',           -- 욕설 / 혐오
        'MISINFORMATION',  -- 허위 정보
        'OTHER'            -- 기타
        ) NOT NULL  COMMENT '신고 사유',

    detail VARCHAR(500) NULL  COMMENT '기타(OTHER) 선택 시 자유 입력 상세 사유',

    status      ENUM ('PENDING', 'REVIEWED', 'DISMISSED') NOT NULL DEFAULT 'PENDING'
        COMMENT '처리 상태. PENDING=미처리, REVIEWED=처리 완료, DISMISSED=무혐의 기각',
    reviewed_by BIGINT   NULL  COMMENT '처리한 관리자 ID',
    reviewed_at DATETIME NULL  COMMENT '처리 일시',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 중복 신고 방지: 같은 유저가 같은 대상에 중복 신고 불가
    UNIQUE KEY uq_report_user_target (target_type, target_id, reporter_id),

    -- 관리자 대시보드: 미처리 신고 최신순
    INDEX idx_report_admin  (status, target_type, created_at DESC),
    -- 특정 게시글/댓글의 신고 내역 전체 조회
    INDEX idx_report_target (target_type, target_id, created_at DESC)
);
