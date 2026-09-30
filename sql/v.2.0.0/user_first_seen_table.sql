-- 미반영 · 사용자 직접 실행 대상 (2026-09-30 작성, decision.md 승인 완료)
-- 목적: 내부 통계 4차(FN-4/FN-10/FN-13 공유) — 익명 방문자(anon_id)의 최초 관측일과
--   회원가입 전환 시점을 기록하는 신규 테이블. 상위 경로 재방문율(FN-4), 신규/재방문
--   구성(FN-10), 재방문 후 가입 전환율(FN-13) 이 모두 이 테이블 하나를 조회한다.
-- 되돌릴 수 있나: 예 — 신규 테이블이라 DROP 하면 끝(다른 테이블에 영향 없음, FK 없음)
-- 실행 전 조건: 없음(신규 테이블). test DB = prod DB 이므로 실행 = 운영 반영
-- 실행 순서: ① 이 파일 → ② BE 재시작(AnalyticsEventServiceImpl 의 upsert, AdminAnalyticsMapper
--   의 조회가 이 테이블을 요구한다. 순서가 바뀌면 수집·통계 조회가 "Table doesn't exist" 로 실패)
-- 반영 뒤: 01_site.sql 의 site_user_event_daily 계열 근처에 이 CREATE TABLE 을 추가하고,
--   이 파일은 applied/ 로 옮기고 여기서 지운다

CREATE TABLE site_user_first_seen (
  anon_id           CHAR(36)  NOT NULL PRIMARY KEY COMMENT '익명 방문자 UUID (site_user_event.anon_id 와 동일 값)',
  first_seen_date   DATE      NOT NULL               COMMENT '이 anon_id 를 처음 관측한 날짜(KST)',
  converted_user_id BIGINT    NULL                   COMMENT '가입 전환된 회원 id. 미전환이면 NULL',
  converted_at      DATETIME  NULL                   COMMENT '가입 전환 시각(KST). 미전환이면 NULL',
  INDEX idx_first_seen_date (first_seen_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='익명 방문자 최초 관측 + 회원가입 전환 시점';

-- 확인
SELECT COUNT(*) AS table_exists
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_user_first_seen';
-- 위 결과가 1이면 성공

-- 99 롤백 (필요할 때만, 쌓인 최초관측·전환 기록이 사라진다)
-- DROP TABLE site_user_first_seen;
