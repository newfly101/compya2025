-- 미반영 · 사용자 직접 실행 대상 (2026-09-30 작성, decision.md 승인 완료)
-- 목적: 내부 통계 4차(FN-3) — 쓰이지 않던 상품 식별자 컬럼 제거, content_id 로 일원화.
--   item_id 는 2026-09-29 추가됐지만 FE 가 끝까지 채운 적이 없다(applied/event_columns_
--   session_device.sql 주석 "이번 라운드 FE 미사용" 참고). 코드(AnalyticsEventEntity·
--   AnalyticsEventItemRequest·insertAll)는 이미 item_id 를 참조하지 않는다.
-- 되돌릴 수 있나: 부분적 — 컬럼을 다시 추가할 수는 있으나 그 사이 쌓인 값은 복구 불가
-- 실행 전 조건: **코드 배포가 먼저 끝나야 한다.** insertAll 이 item_id 를 더 안 쓰는
--   버전이 이미 서비스 중인지 확인 후 실행 — 순서가 바뀌면(이 DDL을 먼저 실행) 배포 전
--   구버전 코드가 여전히 item_id 를 INSERT 하려다 "Unknown column" 으로 수집이 깨진다
-- 실행 순서: ① 코드 배포(이번 라운드분) → ② 이 파일
-- 반영 뒤: 01_site.sql:207 의 item_id 컬럼 정의를 지우고, 이 파일은 applied/ 로 옮기고
--   여기서 지운다

ALTER TABLE site_user_event DROP COLUMN item_id;

-- 확인
SELECT COLUMN_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_user_event'
  AND COLUMN_NAME = 'item_id';
-- 위 결과가 0행이면 성공

-- 99 롤백 (컬럼만 되살아나고 과거 값은 복구되지 않는다)
-- ALTER TABLE site_user_event
--   ADD COLUMN item_id BIGINT NULL COMMENT 'OUTBOUND_CLICK 콘텐츠 id' AFTER browser;
