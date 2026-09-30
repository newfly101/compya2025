-- 운영 DB 적용 완료 (2026-09-30, 사용자 직접 실행). 이력 보존용 — sql/v.2.0.0/ 에서 applied/ 로 이동. ⚠️ test DB = prod DB
-- 목적: 내부 통계 4차(FN-2) — GeoIP(MaxMind) 조회 결과 중 도시명을 저장할 컬럼 추가.
--   지금까지는 country 만 저장했다(CloudFront 헤더 재사용). 이번 라운드부터 서버가
--   직접 GeoIP DB(.mmdb) 파일로 country+city 를 조회하므로 city 컬럼이 필요하다.
-- 되돌릴 수 있나: 예 — 아래 99 롤백 절 (컬럼만 지우면 되고 데이터 손실은 새 컬럼값뿐)
-- 실행 전 조건: 없음. test DB = prod DB 이므로 실행 = 운영 반영
-- 실행 순서: ① 이 파일 → ② BE 재시작(city 컬럼을 쓰는 insertAll 이 이 컬럼을 요구한다.
--   순서가 바뀌면 수집이 "Unknown column 'city'" 로 실패한다)
-- 반영 뒤: 01_site.sql:200(country 컬럼) 아래에 city 컬럼 주석을 동기화하고, 이 파일은
--   applied/ 로 옮기고 여기서 지운다

ALTER TABLE site_user_event
  ADD COLUMN city VARCHAR(50) NULL COMMENT 'GeoIP(MaxMind) 도시 추정' AFTER country;

-- 확인
SELECT COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_user_event'
  AND COLUMN_NAME = 'city';
-- 위 결과가 1행이면 성공

-- 99 롤백 (필요할 때만, city 값은 사라진다)
-- ALTER TABLE site_user_event DROP COLUMN city;
