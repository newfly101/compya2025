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
    user_id        BIGINT      NULL                     COMMENT 'site_users.id. 로그인 상태일 때만 채워짐 (서버가 인증 컨텍스트에서 채운다 — 클라이언트 입력 아님). FK 제약은 걸지 않는다(쓰기 비용, 정합성은 앱 레벨 보장)',

    page_path      VARCHAR(255) NOT NULL                COMMENT '이벤트 발생 화면 경로',

    content_type   VARCHAR(20) NULL                     COMMENT 'COUPON / EVENT / ODDS / COMMUNITY 등. CONTENT_CLICK·OUTBOUND_CLICK 일 때만',
    content_id     VARCHAR(50) NULL                     COMMENT '쿠폰코드 / 이벤트ID 등. 콘텐츠 종류가 섞여 VARCHAR로 둠',
    target_url     VARCHAR(500) NULL                    COMMENT '이동한 외부 URL. 500자 초과분은 서버가 잘라서 저장(에러로 막지 않음)',

    search_keyword VARCHAR(100) NULL                    COMMENT 'SEARCH 일 때만. 사용자가 입력한 원문 — 100자 초과분은 잘라서 저장',

    referrer       VARCHAR(500) NULL                    COMMENT 'document.referrer',
    country        VARCHAR(10) NULL                     COMMENT 'CloudFront-Viewer-Country 재사용',
    user_agent     VARCHAR(255) NULL                    COMMENT '봇 판별·통계용. 원문 앞 255자만 저장',

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
