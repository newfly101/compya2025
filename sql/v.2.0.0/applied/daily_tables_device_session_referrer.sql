-- 이미 반영됨 · 재실행 금지 — 반영일 2026-09-29 (사용자 직접 실행). 원본: draft/feat/admin-internal-stats/03_daily_tables.sql
-- 목적: 내부 통계 3차 — 7일·30일 탭의 기기 비율·세션·외부 유입을 위한 일별 집계 테이블 3종 (사용자 승인 2026-09-29)
-- 되돌릴 수 있나: 예 — 아래 99 롤백 절 (집계 결과만 사라지고 원본 site_user_event 는 무관)
-- 실행 전 조건: 없음. test DB = prod DB 이므로 실행 = 운영 반영
-- 실행 순서: ① 이 파일 → ② BE 재시작 (WEEK/MONTH 조회와 새벽 집계 배치가 이 테이블을 읽고 쓴다)
-- 반영 뒤: sql/v.2.0.0/01_site.sql 은 이미 동기돼 있음. 이 파일은 applied/ 로 옮기고 여기서 지운다

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

-- 확인
SELECT TABLE_NAME FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME LIKE 'site_user_event_daily_%';
-- 위 결과가 3행(device · session · referrer)이면 성공

-- 99 롤백 (필요할 때만)
-- DROP TABLE IF EXISTS site_user_event_daily_device, site_user_event_daily_session, site_user_event_daily_referrer;
