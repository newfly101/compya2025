-- 이미 반영됨 · 재실행 금지 — 반영일 2026-09-29 (사용자 직접 실행). 원본: draft/feat/admin-internal-stats/02_event_columns.sql
-- 목적: 내부 통계 2차 — site_user_event 에 세션·탐색 종류·기기 정보 7컬럼 추가 (사용자 승인 2026-09-29, ADR 없음 — 개인식별 아님)
-- 되돌릴 수 있나: 예 — 아래 99 롤백 절 (컬럼만 지우면 되고 데이터 손실은 새 컬럼값뿐)
-- 실행 전 조건: 없음 (행 2건 안팎이라 즉시). test DB = prod DB 이므로 실행 = 운영 반영
-- 실행 순서: ① 이 파일 → ② BE 재시작(새 컬럼을 쓰는 insertAll 이 이 컬럼들을 요구한다. 순서가 바뀌면 수집이 "Unknown column" 으로 실패)
-- 반영 뒤: sql/v.2.0.0/01_site.sql 은 이미 동기돼 있음. 이 파일은 applied/ 로 옮기고 여기서 지운다

ALTER TABLE site_user_event
  ADD COLUMN session_id  VARCHAR(36) NULL COMMENT '브라우저 세션 UUID, 30분 무활동 만료' AFTER anon_id,
  ADD COLUMN nav_type    VARCHAR(16) NULL COMMENT 'reload/navigate/back_forward/spa',
  ADD COLUMN screen_w    SMALLINT    NULL COMMENT '클라이언트 뷰포트 폭(px)',
  ADD COLUMN device_type VARCHAR(8)  NULL COMMENT '서버 UA 파싱 — mobile/tablet/pc',
  ADD COLUMN os          VARCHAR(16) NULL COMMENT '서버 UA 파싱',
  ADD COLUMN browser     VARCHAR(16) NULL COMMENT '서버 UA 파싱, 버전 미포함',
  ADD COLUMN item_id     BIGINT      NULL COMMENT 'OUTBOUND_CLICK 콘텐츠 id, 이번 라운드 FE 미사용';

-- 확인
SELECT COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_user_event'
  AND COLUMN_NAME IN ('session_id','nav_type','screen_w','device_type','os','browser','item_id');
-- 위 결과가 7행이면 성공

-- 99 롤백 (필요할 때만, 새 컬럼값은 사라진다)
-- ALTER TABLE site_user_event
--   DROP COLUMN session_id, DROP COLUMN nav_type, DROP COLUMN screen_w,
--   DROP COLUMN device_type, DROP COLUMN os, DROP COLUMN browser, DROP COLUMN item_id;
