-- =====================================================================
-- site_ 테이블 DDL — 사이트 운영 콘텐츠 (community 계열 제외, 그쪽은 draft/community/)
-- 실행 순서: 이 파일 안에서 위→아래 (site_users 가 site_user_oauth_accounts·
--   site_refresh_tokens 의 FK 부모라 반드시 먼저 와야 한다)
-- 포함 테이블(행수는 sql-folder-map.md 2026-09-13 실측 기준, 이후 갱신 있을 수 있음):
--   site_coupons(51) · site_notices(11) · site_events(36) · site_users(497) ·
--   site_user_oauth_accounts(497, FK→site_users) · site_refresh_tokens(324, FK→site_users) ·
--   site_user_event(2) · site_user_event_daily(0, 집계 배치 미구현)
-- 출처: sql/V2/CREATE_04_TABLE_SITE.sql(앞부분) + sql/V3/CREATE_06·CREATE_07
-- =====================================================================

USE compyafun;

CREATE TABLE site_coupons
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    coupon_code VARCHAR(100) NOT NULL UNIQUE,
    title       VARCHAR(255) NOT NULL,
    detail      VARCHAR(500),
    expire_at   DATETIME     NOT NULL,
    is_visible  BOOLEAN      NOT NULL DEFAULT true,
    created_at  DATETIME              DEFAULT CURRENT_TIMESTAMP, -- 2026-09-28 KST 통일(ADR 0007 3단계) 운영 반영됨 — applied/kst_timestamp_to_datetime.sql
    updated_at  DATETIME              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- 2026-09-28 KST 통일(ADR 0007 3단계) 운영 반영됨 — applied/kst_timestamp_to_datetime.sql
);


CREATE TABLE site_notices
(
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    source         ENUM ('INTERNAL', 'EXTERNAL') NOT NULL COMMENT '사이트 내부 작성 / 외부 링크 공지',
    title          VARCHAR(255) NOT NULL COMMENT '공지 제목',
    summary        TEXT NULL COMMENT '목록용 요약',
    content        LONGTEXT NULL COMMENT '내부 공지 본문',
    external_url   VARCHAR(500) NULL COMMENT '외부 공지 링크',
    image_url      VARCHAR(500) NULL COMMENT '공지사항 이미지 URL',

    is_visible     BOOLEAN NOT NULL DEFAULT true COMMENT '사용자 노출 여부',
    is_pinned      BOOLEAN NOT NULL DEFAULT false COMMENT '상단 고정 여부',

    published_at   DATETIME NULL COMMENT '실제 게시 시각',
    created_at     DATETIME  DEFAULT CURRENT_TIMESTAMP, -- 2026-09-28 KST 통일(ADR 0007 3단계) 운영 반영됨 — applied/kst_timestamp_to_datetime.sql
    updated_at     DATETIME  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 2026-09-28 KST 통일(ADR 0007 3단계) 운영 반영됨 — applied/kst_timestamp_to_datetime.sql

    CONSTRAINT chk_site_notices_source_payload
        CHECK (
            (source = 'INTERNAL' AND content IS NOT NULL AND external_url IS NULL)
                OR
            (source = 'EXTERNAL' AND content IS NULL AND external_url IS NOT NULL)
            ),

    INDEX idx_site_notices_visible_pinned_created (is_visible, is_pinned, created_at), -- 운영 DB 실측: DESC 미적용
    INDEX idx_site_notices_source (source),
    INDEX idx_site_notices_published_at (published_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci -- 운영 DB 실측: 이 테이블만 general_ci (다른 site_* 는 unicode_ci)
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
    source_article_id BIGINT                             COMMENT '원문 카페 글번호 — 자동 수집 중복 방지·재확인 대상 식별',
    content_html  MEDIUMTEXT                             COMMENT '정제된 이벤트 본문 HTML (이벤트 기간 ~ 감사합니다 구간)',
    content_hash  CHAR(64)                               COMMENT '원문 구간 SHA-256 — 원문 변경 감지',
    synced_at     DATETIME                               COMMENT '마지막 수집 시각 (KST)',
    is_visible    BOOLEAN                       NOT NULL DEFAULT TRUE COMMENT '이벤트 노출 여부',
    created_at    DATETIME                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at    DATETIME                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),

    CONSTRAINT chk_site_events_expire_after_start
        CHECK (expire_at > start_at),

    UNIQUE KEY uk_site_events_source_article (source_article_id),

    INDEX idx_site_events_visible_period (is_visible, start_at, expire_at)
) COMMENT = '사이트 이벤트 정보';


-- ⚠️ 2026-09-13 — 운영 DB 실측 덤프 기준으로 갱신했다 (유저 테이블 개편 3단계까지 전부 반영된 최종 형태).
-- oauth_provider 등 6개 컬럼은 site_user_oauth_accounts 로 이관 후 DROP 됐다 — 더는 이 테이블에 없다.
-- 이관 이력은 sql/V2/MIGRATE_user_restructure.sql (USER_RESTRUCTURE_01~03 병합) 참고.
CREATE TABLE site_users
(
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY   COMMENT '사용자 고유 ID',
    public_id               CHAR(36)     NOT NULL               COMMENT '밖으로 노출되는 사용자 식별자 (UUID v4). id(내부 PK)는 노출하지 않는다',

    -- 서비스 자체 정보
    service_nickname        VARCHAR(20)                         COMMENT '서비스 자체 닉네임 (미설정 시 NULL)',
    profile_image           VARCHAR(500)                        COMMENT '사용자가 마이페이지에서 직접 올린 프로필 이미지 URL. oauth_profile_image(site_user_oauth_accounts)와 별개. NULL이면 미설정',
    email                   VARCHAR(255)                        COMMENT '서비스 자체 이메일 (관리자 표시용, OAuth 이메일과 분리)',

    user_role               ENUM('ADMIN', 'USER')      NOT NULL DEFAULT 'USER'   COMMENT '사용자 권한',
    user_status             ENUM('ACTIVE', 'BLOCKED', 'WITHDRAWN', 'SUSPENDED')
        NOT NULL DEFAULT 'ACTIVE' COMMENT '계정 상태 (ACTIVE: 정상, BLOCKED: 차단, WITHDRAWN: 탈퇴, SUSPENDED: 정지)',
    withdrawn_at            DATETIME                            COMMENT '탈퇴 시각. updated_at 대용 금지(관리자가 권한만 바꿔도 updated_at 이 갱신되는 버그를 없앤다)',

    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP         COMMENT '최초 가입일',
    updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP         COMMENT '수정일',
    last_login_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP         COMMENT '마지막 로그인 시각',

    UNIQUE KEY uk_site_users_public_id (public_id)              COMMENT '밖으로 노출되는 사용자 식별자 (UUID v4)',
    INDEX idx_user_email (email)
) COMMENT = '서비스 사용자 테이블';


-- ── 원본: USER_RESTRUCTURE_02_CREATE_OAUTH_ACCOUNTS_TABLE.sql (2026-09-13 CREATE_ 로 이관) ──
-- 로그인 수단을 여러 개 붙일 수 있게 구조는 열어두되(user_id 는 UNIQUE 로 묶지 않는다),
-- 지금은 사람당 로그인 수단이 1개뿐이라 결과적으로 한 사람 = 한 행이다.
-- 연결/해제 화면·API 는 아직 없다 (설계 문서: docs/domain/account/prd/user-table-restructure.md § 8).
CREATE TABLE site_user_oauth_accounts
(
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY  COMMENT '로그인 수단 고유 ID',
    user_id                 BIGINT       NOT NULL              COMMENT 'site_users.id 참조. 여러 행이 같은 user_id 를 가질 수 있다',

    oauth_provider          VARCHAR(20)  NOT NULL              COMMENT 'OAuth 제공자 (NAVER)',
    oauth_provider_id       VARCHAR(100) NOT NULL              COMMENT 'OAuth 제공자 고유 ID',
    oauth_nickname          VARCHAR(20)                        COMMENT 'OAuth 제공자 닉네임 (원본 스냅샷)',
    oauth_email             VARCHAR(255)                       COMMENT 'OAuth 제공자 이메일 (원본 스냅샷)',
    oauth_profile_image     VARCHAR(500)                       COMMENT 'OAuth 제공자 프로필 이미지 URL (원본 스냅샷)',
    oauth_age_range         VARCHAR(10)                        COMMENT 'OAuth 제공자 연령대. 계속 수집(결정 유지) — 쓰는 화면은 없음',

    created_at              DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '연결(가입) 시각',
    updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',

    UNIQUE KEY uk_oauth_provider (oauth_provider, oauth_provider_id) COMMENT '같은 네이버 계정이 두 사람에 붙지 못하게',
    KEY idx_oauth_user_id (user_id),
    CONSTRAINT fk_oauth_accounts_user
        FOREIGN KEY (user_id) REFERENCES site_users (id)
            ON DELETE CASCADE
) COMMENT = '로그인 수단(OAuth) 원본 — 한 사람이 여러 개 가질 수 있다';


-- access token: stateless JWT (15~30분)
-- refresh token: 30일 만료, DB 행 단위 revocation 가능
--
-- 보안:
--  - token_hash 는 SHA-256(token) 16진수 64자. 평문 토큰은 DB 에 저장하지 않음
--  - 사용자가 refresh 호출 시 cookie 의 평문을 hash 해서 DB 와 비교
--  - 로그아웃 / 토큰 탈취 의심 시 해당 행 DELETE → 즉시 무효화

CREATE TABLE site_refresh_tokens
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY               COMMENT 'PK',
    user_id     BIGINT       NOT NULL                           COMMENT 'site_users.id',
    token_hash  CHAR(64)     NOT NULL                           COMMENT 'SHA-256(refresh token) hex',
    expires_at  DATETIME     NOT NULL                           COMMENT '만료 시각 (발급 시점 + 30일)',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '발급 시각',
    revoked_at  DATETIME     NULL                               COMMENT '무효 처리 시각 (NULL = 활성)',

    UNIQUE KEY uk_refresh_token_hash (token_hash),
    INDEX idx_refresh_user_id (user_id),
    INDEX idx_refresh_expires_at (expires_at),
    CONSTRAINT fk_refresh_user
        FOREIGN KEY (user_id) REFERENCES site_users (id)
            ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
    COMMENT = '리프레시 토큰 저장소 (rotation + revocation 지원)';

-- =====================================================================
-- 사용자 행동 이벤트 원본 로그
--
-- 1행 = 1회 발생한 행동(페이지뷰 / 콘텐츠 클릭 / 외부 이동 / 검색).
-- 게스트도 anon_id 쿠키로 식별되며, 로그인하면 같은 행에 user_id 가 함께 채워진다
-- (게스트로 둘러보다 가입한 흐름을 anon_id 하나로 연결하기 위함).
--
-- append-only, 쓰기 매우 잦음 — 인덱스는 최소로 유지한다.
-- 무거운 집계(화면별 이탈 랭킹, 일별 방문자 수 등)는 이 테이블을 직접 긁지 않고
-- site_user_event_daily(아래) 를 배치로 채워 어드민이 그쪽을 보게 한다 (배치는 2단계).
--
-- 설계 문서: docs/domain/analytics/prd/user-event-tracking.md § 4
-- =====================================================================

USE compyafun;

-- DROP TABLE IF EXISTS site_user_event;

CREATE TABLE site_user_event
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY   COMMENT '이벤트 식별자 (쓰기 성능 우선 — UUID 대신 순차 증가)',

    event_type     ENUM ('PAGE_VIEW','CONTENT_CLICK','OUTBOUND_CLICK','SEARCH')
                                NOT NULL                COMMENT '이벤트 종류',

    anon_id        CHAR(36)    NOT NULL                COMMENT '익명 방문자 UUID (쿠키). 로그인 후에도 유지',
    session_id     VARCHAR(36) NULL                     COMMENT '브라우저 세션 UUID, 30분 무활동 만료 (2026-09-29 추가 — draft/feat/admin-internal-stats/02 실행 전까지 운영엔 없음)',
    user_id        BIGINT      NULL                     COMMENT 'site_users.id. 로그인 상태일 때만 채워짐 (서버가 인증 컨텍스트에서 채운다 — 클라이언트 입력 아님). FK 제약은 걸지 않는다(쓰기 비용, 정합성은 앱 레벨 보장)',

    page_path      VARCHAR(255) NOT NULL                COMMENT '이벤트 발생 화면 경로',

    content_type   VARCHAR(20) NULL                     COMMENT 'COUPON / EVENT / ODDS / COMMUNITY 등. CONTENT_CLICK·OUTBOUND_CLICK 일 때만',
    content_id     VARCHAR(50) NULL                     COMMENT '쿠폰코드 / 이벤트ID 등. 콘텐츠 종류가 섞여 VARCHAR로 둠',
    target_url     VARCHAR(500) NULL                    COMMENT '이동한 외부 URL. 500자 초과분은 서버가 잘라서 저장(에러로 막지 않음)',

    search_keyword VARCHAR(100) NULL                    COMMENT 'SEARCH 일 때만. 사용자가 입력한 원문 — 100자 초과분은 잘라서 저장',

    referrer       VARCHAR(500) NULL                    COMMENT 'document.referrer',
    country        VARCHAR(10) NULL                     COMMENT 'CloudFront-Viewer-Country 재사용',
    user_agent     VARCHAR(255) NULL                    COMMENT '봇 판별·통계용. 원문 앞 255자만 저장',
    nav_type       VARCHAR(16) NULL                     COMMENT 'reload/navigate/back_forward/spa (2026-09-29 추가)',
    screen_w       SMALLINT    NULL                     COMMENT '클라이언트 뷰포트 폭(px) (2026-09-29 추가)',
    device_type    VARCHAR(8)  NULL                     COMMENT '서버 UA 파싱 — mobile/tablet/pc (2026-09-29 추가)',
    os             VARCHAR(16) NULL                     COMMENT '서버 UA 파싱 (2026-09-29 추가)',
    browser        VARCHAR(16) NULL                     COMMENT '서버 UA 파싱, 버전 미포함 (2026-09-29 추가)',
    item_id        BIGINT      NULL                     COMMENT 'OUTBOUND_CLICK 콘텐츠 id (2026-09-29 추가)',

    extra          JSON        NULL                     COMMENT '스키마에 없는 부가 정보 임시 보관용. WHERE·인덱스 대상이 되는 값은 반드시 정규 컬럼으로 승격시킬 것 — JSON 컬럼엔 인덱스를 태우지 않는다. 1단계는 항상 NULL',

    created_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '이벤트 발생 일시. 클라이언트가 보낸 occurredAt 을 서버가 검증 후 채운다(값이 없거나 형식이 이상하면 서버 수신 시각으로 대체). 파티션/정리 기준',

    -- Q1(콘텐츠 클릭 수) · Q6(검색 결과 없는 검색어) : 종류 + 기간으로 좁히는 조회
    INDEX idx_ue_type_created (event_type, created_at),
    -- Q3 : 특정 방문자(anon_id)의 시계열 — 가입 전후 행동 비교
    INDEX idx_ue_anon_created (anon_id, created_at),
    -- Q1 : 콘텐츠별(쿠폰/이벤트) 클릭 랭킹
    INDEX idx_ue_content (content_type, content_id, created_at)

    -- page_path 단독 인덱스는 일부러 안 둔다. 카디널리티가 낮고(화면 수가 적음) 이 값이
    -- 필요한 무거운 집계(어느 화면에서 가장 이탈하는지, 화면별 조회수 추이)는 아래
    -- site_user_event_daily 에서 처리한다.

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT = '사용자 행동 이벤트 원본 로그 — append-only, 정기 정리 대상(하단 보관 정책 참고)';

-- =====================================================================
-- 사용자 행동 일별 집계 — 어드민 차트가 실제로 조회할 테이블 (2단계에서 배치로 채움)
--
-- site_user_event 원본을 하루 단위 · (이벤트종류, 화면, 콘텐츠) 조합으로 미리 집계해둔다.
-- 원본에서 매번 GROUP BY / COUNT(DISTINCT) 하면 풀스캔에 가까워지므로, 무거운 집계 질문
-- (Q2 화면별 이탈, Q4 일별 순방문자, Q5 화면별 조회수 추이) 은 전부 이 테이블에서 답한다.
-- 원본이 정리(삭제)돼도 이 테이블은 영구 보관한다.
--
-- ⚠️ 설계 문서 초안 대비 변경: page_path/content_type/content_id 를 NULL 허용 대신
-- NOT NULL DEFAULT '' 로 뒀다. 세 컬럼 모두 PRIMARY KEY 구성요소인데, MariaDB/MySQL 은
-- PK 에 포함된 컬럼을 NULL 선언과 무관하게 항상 NOT NULL 로 강제한다 — 그대로 두면
-- PAGE_VIEW(=content_type/content_id 없음) 행 적재 시 "컬럼이 NULL 일 수 없다" 오류로
-- 배치가 실패한다. 빈 문자열을 "값 없음" sentinel 로 써서 PK 제약과 충돌을 피했다.
-- =====================================================================

-- DROP TABLE IF EXISTS site_user_event_daily;

CREATE TABLE site_user_event_daily
(
    event_date        DATE         NOT NULL              COMMENT '집계 일자',
    event_type        VARCHAR(20)  NOT NULL               COMMENT '이벤트 종류',
    page_path         VARCHAR(255) NOT NULL DEFAULT ''    COMMENT 'PAGE_VIEW/OUTBOUND_CLICK 집계용. 콘텐츠 집계 행은 빈 문자열(값 없음)',
    content_type       VARCHAR(20)  NOT NULL DEFAULT ''    COMMENT 'CONTENT_CLICK 집계용. 화면 집계 행은 빈 문자열',
    content_id         VARCHAR(50)  NOT NULL DEFAULT ''    COMMENT 'CONTENT_CLICK 집계용. 화면 집계 행은 빈 문자열',

    event_count        BIGINT NOT NULL                     COMMENT '해당 조합의 발생 건수',
    unique_anon_count  BIGINT NOT NULL                     COMMENT '순 방문자 수 (그 날 그 조합을 겪은 anon_id 종류 수)',
    unique_user_count  BIGINT NOT NULL                     COMMENT '그중 로그인 상태였던 건수',

    PRIMARY KEY (event_date, event_type, page_path, content_type, content_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT = '사용자 행동 일별 집계 — 원본 삭제 후에도 영구 보관 (2단계 배치가 채움)';

-- =====================================================================
-- 보관 정책 (1단계는 스키마만 — 실행 스크립트는 별도 트랙에서)
--
-- - 원본 site_user_event 는 최근 N개월만 보관 후 삭제 (N 은 실 트래픽 관측 후 사용자가
--   확정 — 설계 문서 § 4.5 는 6개월을 가정값으로 제안). 정리 전에 site_user_event_daily
--   로 매일 새벽 배치 집계를 먼저 채워야 한다 (2단계 작업).
-- - 정리 방법 후보 둘 중 하나를 고른다:
--     (A) DELETE FROM site_user_event WHERE created_at < DATE_SUB(NOW(), INTERVAL N MONTH);
--         — 구현은 간단하지만 대량 삭제 시 InnoDB 언두 로그/락 부담이 있다.
--     (B) created_at 기준 월별 RANGE COLUMNS 파티션 + DROP PARTITION
--         — append-only 테이블과 궁합이 좋고 삭제 비용이 훨씬 가볍다(파티션 드롭은
--         메타데이터 연산). 다만 PARTITION 도입은 PRIMARY KEY(id) 단독으로는 파티션
--         키(created_at)를 포함해야 하는 MariaDB 제약이 있어 PK 를 (id, created_at) 복합키로
--         바꾸는 등 테이블 구조 변경이 필요 — 지금 CREATE TABLE 에는 반영하지 않았다.
--   → (B) 를 권장하되, 실제 적용은 보관 기간(N)이 확정된 뒤 별도 마이그레이션으로 진행한다.
-- =====================================================================

-- ============================================================================
-- 일별 집계 테이블 3종 (2026-09-29 추가, 내부 통계 3차 — draft/feat/admin-internal-stats/03 실행 전까지 운영엔 없음)
-- site_user_event_daily 와 같이 새벽 배치가 채운다. FK 없음(집계 결과)
-- ============================================================================
CREATE TABLE site_user_event_daily_device (
  event_date        DATE        NOT NULL COMMENT '집계 일자(KST)',
  device_type       VARCHAR(8)  NOT NULL COMMENT 'mobile / tablet / pc / unknown',
  unique_anon_count BIGINT      NOT NULL COMMENT '해당 기기로 방문한 anon_id 수',
  page_view_count   BIGINT      NOT NULL DEFAULT 0 COMMENT '해당 기기의 PAGE_VIEW 수(중복 제거 후)',
  PRIMARY KEY (event_date, device_type)
) COMMENT '일별 기기 분포 — 새벽 집계 배치가 채운다';

CREATE TABLE site_user_event_daily_session (
  event_date        DATE   NOT NULL PRIMARY KEY COMMENT '집계 일자(KST)',
  session_count     BIGINT NOT NULL COMMENT 'session_id 유일 수',
  page_view_count   BIGINT NOT NULL COMMENT '같은 세션·경로 30초 내 중복 제거한 PAGE_VIEW 수',
  unique_anon_count BIGINT NOT NULL DEFAULT 0 COMMENT 'anon_id 유일 수(방문자)'
) COMMENT '일별 세션 요약 — 세션당 페이지뷰 = page_view_count / session_count';

CREATE TABLE site_user_event_daily_referrer (
  event_date    DATE         NOT NULL COMMENT '집계 일자(KST)',
  referrer_host VARCHAR(255) NOT NULL COMMENT '외부 유입 호스트(자기 도메인·localhost 제외)',
  event_count   BIGINT       NOT NULL COMMENT '그 호스트에서 시작한 PAGE_VIEW 수',
  PRIMARY KEY (event_date, referrer_host)
) COMMENT '일별 외부 유입 상위 — 새벽 집계 배치가 채운다';

-- ============================================================================
-- 레전드 재료 보유 현황 저장 테이블 3종 (2026-09-29 추가, legendCollections)
-- 운영 반영 완료(2026-09-29) — 적용 스크립트: sql/v.2.0.0/applied/legend_collection_tables.sql
-- ============================================================================
CREATE TABLE site_legend_material_states
(
    user_id     BIGINT      NOT NULL COMMENT 'site_users.id',
    material_id CHAR(36)    NOT NULL COMMENT 'data_player_legend_material.id (마스터 원본은 읽기만, FK 없음 — 재적재 금지)',
    state       ENUM ('HAVE','INSERTED') NOT NULL COMMENT '재료 칸 상태. 미보유는 행 없음',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    PRIMARY KEY (user_id, material_id),
    CONSTRAINT fk_legend_material_states_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '이용자별 레전드 재료 칸 상태 (보유/삽입)';

CREATE TABLE site_legend_states
(
    user_id    BIGINT   NOT NULL COMMENT 'site_users.id',
    legend_id  CHAR(36) NOT NULL COMMENT 'data_player_legend.id (FK 없음)',
    status     ENUM ('FRAME','OWNED') NOT NULL COMMENT '레전드 상태. 미보유는 행 없음',
    acquired_at DATE NULL COMMENT '레전드 획득일 (사용자 입력)',
    frame_acquired_at DATE NULL COMMENT '액자 획득일 (사용자 입력)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    PRIMARY KEY (user_id, legend_id),
    CONSTRAINT fk_legend_states_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '이용자별 레전드 상태 (액자/보유중)';

CREATE TABLE site_legend_state_logs
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT   NOT NULL COMMENT 'site_users.id',
    legend_id   CHAR(36) NOT NULL COMMENT 'data_player_legend.id (FK 없음)',
    from_status ENUM ('FRAME','OWNED') NULL COMMENT '변경 전 상태. NULL = 미보유',
    to_status   ENUM ('FRAME','OWNED') NULL COMMENT '변경 후 상태. NULL = 미보유',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '변경 일시',
    INDEX idx_legend_state_logs_user_legend (user_id, legend_id),
    CONSTRAINT fk_legend_state_logs_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '이용자별 레전드 상태 변경 로그 (덧붙임 전용)';

CREATE TABLE site_legend_preferences
(
    user_id    BIGINT   NOT NULL COMMENT 'site_users.id',
    legend_id  CHAR(36) NOT NULL COMMENT 'data_player_legend.id (FK 없음)',
    rank_no    TINYINT  NOT NULL COMMENT '선호 순위 1~10',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    PRIMARY KEY (user_id, legend_id),
    UNIQUE KEY uk_legend_preferences_rank (user_id, rank_no),
    CONSTRAINT fk_legend_preferences_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '이용자별 선호 레전드 순위 (최대 10)';

-- ============================================================================
-- 레전드 스킬 저장 테이블 2종 (legendCollectionSkills, ⚠️ 미적용 — 적용 스크립트: sql/v.2.0.0/applied/user_legend_skill_tables.sql)
-- ============================================================================
CREATE TABLE site_user_legend_skills
(
    user_id        BIGINT   NOT NULL COMMENT 'site_users.id',
    legend_id      CHAR(36) NOT NULL COMMENT 'data_player_legend.id (FK 없음)',
    skill1_id      CHAR(36) NULL COMMENT '슬롯1 data_player_skill.id (FK 없음, 스킬 초기화 시 NULL)',
    skill1_base    ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯1 등록 등급',
    skill1_current ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯1 현재 등급(강화 반영)',
    skill2_id      CHAR(36) NULL COMMENT '슬롯2 data_player_skill.id',
    skill2_base    ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯2 등록 등급',
    skill2_current ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯2 현재 등급',
    skill3_id      CHAR(36) NULL COMMENT '슬롯3 data_player_skill.id',
    skill3_base    ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯3 등록 등급',
    skill3_current ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯3 현재 등급',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시 (동시 수정 경고 비교용)',
    PRIMARY KEY (user_id, legend_id),
    CONSTRAINT fk_user_legend_skills_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '이용자×레전드 스킬 3칸 현재 상태 (일괄 적용 여부는 로그로 판단)';

CREATE TABLE site_user_legend_skill_logs
(
    id         BIGINT   NOT NULL AUTO_INCREMENT COMMENT '로그 id',
    user_id    BIGINT   NOT NULL COMMENT 'site_users.id',
    legend_id  CHAR(36) NOT NULL COMMENT 'data_player_legend.id (FK 없음)',
    action     ENUM ('SAVE','BASE_UP','GCG_UP','GGG_UP','UNDO','RESET','BULK_S','BULK_NO_GGG') NOT NULL COMMENT '이벤트 종류',
    slot       TINYINT  NULL COMMENT '강화한 슬롯 1~3 (해당 없으면 NULL)',
    snapshot   JSON     NOT NULL COMMENT '그 시점 3슬롯 [{skillId, base, current} x3] — 조회 조건으로 쓰지 않으므로 JSON',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '발생 일시',
    PRIMARY KEY (id),
    INDEX idx_user_legend_skill_logs (user_id, legend_id),
    CONSTRAINT fk_user_legend_skill_logs_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '레전드 스킬 이벤트 로그 (덧붙임 전용, 사용자 삭제 시 함께 삭제)';
