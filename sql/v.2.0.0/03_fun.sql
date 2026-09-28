-- =====================================================================
-- fun_ 테이블 DDL + 접두 없는 실측 테이블(statistic_support_click)
-- 실행 순서: 이 파일 안에서 위→아래 (서로 FK 의존 없음, fun_teams 는 자기참조만)
-- 포함 테이블(행수는 sql-folder-map.md 2026-09-13 실측 기준, 이후 갱신 있을 수 있음):
--   fun_teams(20, 자기참조 FK) · fun_quiz(5, DROP 후 재생성) ·
--   statistic_support_click(0, 신규 — site_/data_/fun_ 어디에도 안 속하는 유일한 테이블)
-- ⚠️ 접두 불일치 기록 (database-notes.md §7): fun_teams·fun_quiz 는 결이
--   site_/data_ 에 더 맞는다는 지적이 있으나, mapper·엔티티 동반 수정이 필요해
--   이름은 그대로 뒀다. statistic_support_click 도 site_ 접두가 맞다는 지적 있음.
-- 출처: sql/V2/CREATE_03_TABLE_FUN.sql + sql/V3/CREATE_05·CREATE_08
-- =====================================================================

-- ⚠️ 접두 불일치 (2026-09-27 실측) — 운영 DB 접두 분포는 site_ 15 · data_ 13 ·
-- fun_ 2 · 접두없음 1인데, fun_teams 는 게임에서 받아오는 참조 데이터라 결이
-- data_ 에 더 맞는다 (fun_ 은 site 관리자가 운용하는 컨텐츠 계열). 아직 이름은
-- 바꾸지 않았다 — 바꾸려면 mapper XML·엔티티까지 함께 고쳐야 한다.
CREATE TABLE fun_teams
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '팀 고유 식별자 (PK)',
    team_code      VARCHAR(10)  NOT NULL COMMENT '팀 코드',
    team_name      VARCHAR(50)  NOT NULL COMMENT '팀명',
    latest_team_id BIGINT       NULL COMMENT '현재 기준 연결되는 후속 팀 ID',
    city_name      VARCHAR(50)  NULL COMMENT '연고지명',
    start_year     SMALLINT     NULL COMMENT '팀명/엠블럼 사용 시작 연도',
    end_year       SMALLINT     NULL COMMENT '팀명/엠블럼 사용 종료 연도, 현재 사용 중이면 NULL',
    emblem_url     VARCHAR(255) NULL COMMENT '팀 엠블럼 이미지 URL',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    UNIQUE KEY uk_fun_teams_code_period (team_code, start_year),
    INDEX idx_fun_teams_latest_team_id (latest_team_id),

    CONSTRAINT fk_fun_teams_latest_team
        FOREIGN KEY (latest_team_id) REFERENCES fun_teams (id)
);

-- ─────────────────────────────────────────────────────────────────────
-- fun_quiz 는 여기 없다 — sql/V3/CREATE_05_fun.sql 이 최종 정의를 갖는다.
--
-- 원래 이 파일에도 같은 테이블이 있었는데, V3 쪽이 DROP & CREATE 로 다시
-- 만드는 구조라 두 곳에 있으면 V2 → V3 순서로 실행할 때 방금 만든 것을
-- 지우고 다시 만든다. 데이터가 든 상태에서 다시 돌리면 그게 날아간다.
-- (2026-09-13 정리)
-- ─────────────────────────────────────────────────────────────────────

-- ============================================================================
-- compyafun-v3_fun.sql
--
-- fun_ prefix V3 통합 SQL.
-- 도메인별 PRD 확정 결정에 따라 fun_quiz 부터 점차 통합. 다른 fun_ 테이블은
-- 각 도메인 PRD Part B 확정 후 본 파일로 이전.
-- ============================================================================


-- ============================================================================
-- fun_quiz
--
-- PRD: docs/prd/domains/quiz.md (Part B v2 — 2026-05-09 IA-CONFIRM)
--
-- 변경 사항 (V2 → V3):
--   - is_visible 컬럼 DROP
--       Owner 결정 (a): visible 운영 정책 폐기. 모든 row 노출 대상.
--       admin 운영자가 row 덮어쓰기로 노출 갱신.
--   - title 컬럼 추가하지 않음
--       Owner 결정 (b): server-side 동적 생성.
--       BE 응답 직전 합성: "🎉컴프야 퀴즈 이벤트 {round}회 정답"
--   - UNIQUE KEY uq_round 유지
--       T5 admin upload-driven 회차 자동 +1 정책 — 중복 방지 BE validation 근거.
--
-- 운영 정책:
--   - admin form initial 회차 = (DB 최신 round + 1) — admin 검토 후 저장 또는 jump 가능
--   - admin 입력 필드: image (필수) + round (필수). title input 제거됨.
--   - 모바일: HomeScreen QuizSection 이 최신 1건 fetch (`GET /api/quiz/latest`)
--
-- 기존 데이터: 운영 row 0건 (사용자 진술 — fun_quiz 미사용) → DROP & CREATE 안전.
--
-- ⚠️ 접두 불일치 (2026-09-27 실측) — fun_quiz 는 관리자가 등록하는 사이트
-- 컨텐츠라 fun_ 보다 site_ 가 결에 맞는다 (fun_ 은 게임 참조 데이터 계열).
-- 아직 이름은 바꾸지 않았다 — 바꾸려면 mapper XML·엔티티까지 함께 고쳐야 한다.
-- ============================================================================
-- ⚠️ 막아둠(test DB = prod DB): 빈 DB 재현에는 불필요. 운영에서 재생성이 정말 필요하면 draft/ 에 별도 스크립트로
-- DROP TABLE IF EXISTS fun_quiz;

CREATE TABLE fun_quiz
(
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    round      INT          NOT NULL                                      COMMENT '퀴즈 회차 (예: 877). admin upload-driven 자동 +1, UNIQUE 보장.',
    image_url  VARCHAR(500) NOT NULL                                      COMMENT '정답 이미지 (S3 URL).',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_round (round)
)

-- =====================================================================
-- 후원(카카오페이 송금) 버튼 클릭 기록 — 로그인 유저에 한해 "누가 언제 눌렀는지"만 남기는
-- 최소 통계. 비로그인 클릭은 기록하지 않는다(서비스 로직 상 insert 자체를 안 함 — 이
-- 테이블에 애초에 들어오지 않는다).
--
-- target 을 별도 컬럼으로 둔 이유: 지금은 카카오페이뿐이지만 후원 수단이 늘어날 수 있어
-- 구분자로 남겨둔다 (기본값 'kakaopay').
--
-- site_user_event(CREATE_07) 관례를 따라 user_id 에 FK 는 걸지 않는다
-- (쓰기 비용 최소화, 정합성은 앱 레벨 보장) — 인덱스만 둔다.
--
-- 실행 순서: site_users(V2/CREATE_04_TABLE_SITE.sql) 다음 아무 때나 — 독립 테이블.
--
-- ⚠️ 접두 불일치 (2026-09-27 실측) — 파일명은 이미 site_ 인데 테이블명만 접두가
-- 빠졌다. 다른 테이블과 결을 맞추면 site_statistic_support_click. 아직 이름은
-- 바꾸지 않았다 — 바꾸려면 mapper XML·엔티티까지 함께 고쳐야 한다.
-- =====================================================================

USE compyafun;

-- DROP TABLE IF EXISTS statistic_support_click;

CREATE TABLE statistic_support_click
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY          COMMENT '기록 고유 ID',
    user_id    BIGINT      NOT NULL                       COMMENT 'site_users.id. 로그인 유저만 기록되므로 NULL 없음. FK 는 걸지 않는다(site_user_event 관례, 앱 레벨 정합성)',
    target     VARCHAR(20) NOT NULL DEFAULT 'kakaopay'    COMMENT '후원 수단 구분자. 현재는 카카오페이뿐이나 수단이 늘 수 있어 구분',
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '클릭 시각',

    INDEX idx_statistic_support_click_user (user_id, created_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '홈 화면 후원(카카오페이 송금) 버튼 클릭 기록 — 로그인 유저만 적재';
