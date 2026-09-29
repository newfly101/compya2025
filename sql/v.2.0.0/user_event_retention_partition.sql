-- 미반영 · 사용자 직접 실행 대상 (2026-09-30 작성, decision.md 승인 완료)
-- 목적: 내부 통계 4차(FN-11) — 원본 site_user_event 를 월별 파티션으로 재구성해
--   3개월 보관 정책을 "DROP PARTITION"(메타데이터 연산, 가벼움)으로 정리할 수 있게 한다.
--   실제 매달 파티션 추가/삭제는 배치(RetentionPartitionServiceImpl, 매월 1일 03:40 KST)가
--   자동으로 하지만, 그 배치가 동작하려면 아래 파티션 스키마가 먼저 있어야 한다.
--
-- ⚠️ 이 스크립트는 테이블 전체를 재구성한다(대상 행 전부 복사) — 다른 3건(city 컬럼·
--   item_id 삭제·site_user_first_seen 신설)보다 훨씬 무겁다. 트래픽이 적은 시간대에
--   실행할 것. test DB = prod DB 이므로 실행 = 운영 반영, 진행 중 해당 테이블 쓰기가
--   지연될 수 있다(락 범위는 MariaDB 버전에 따라 다름 — 사전에 테이블 크기 확인 권장).
--
-- 되돌릴 수 있나: 부분적 — 99 롤백으로 파티션을 없앨 수 있으나 원상태(PK 단독 id)로
--   되돌리는 것도 같은 무게의 재구성이다. 파티션을 DROP 하면 그 안의 행은 삭제되므로,
--   되돌리기 전에는 절대 DROP PARTITION 을 실행하지 않을 것.
-- 실행 전 조건: city 컬럼(user_event_city_column.sql)·item_id 삭제(user_event_item_id_drop.sql)
--   를 먼저 반영해두면 재구성이 한 번으로 끝난다(순서 제약은 아니지만 권장)
-- 실행 순서: ① 이 파일 → ② BE 재시작(배치가 파티션 스키마 존재를 전제로 동작)
--
-- ⚠️ 파티션 경계에 MAXVALUE 를 두지 않았다 — 배치가 매달 "다음 달" 파티션을 ADD PARTITION
--   으로 붙이는 방식이라 MAXVALUE 촉수(catch-all)가 있으면 그 위에 새 파티션을 못 붙인다.
--   아래는 2026-01(서비스 시작월)부터 2026-11(다음 달 버퍼 1개월)까지만 만들어뒀다 —
--   배치가 매달 자동으로 그 다음 달을 미리 붙이므로 평소엔 문제없지만, 이 스크립트 실행 후
--   배치가 한 번도 안 돌고 2026-12 로 넘어가면 "partition not found" 로 INSERT 가 실패한다.
--   그 사이 배치가 죽어있는지 로그로 한 번 확인할 것.
-- 반영 뒤: 01_site.sql 의 site_user_event CREATE TABLE 하단에 PARTITION BY 절과 이 주석을
--   옮겨 적고, 이 파일은 applied/ 로 옮기고 여기서 지운다

-- 1) PK 를 (id, created_at) 복합키로 — MariaDB 파티션 키(created_at)는 모든 유니크 키에
--    포함돼야 한다. id 가 그대로 맨 앞이라 AUTO_INCREMENT 제약(인덱스 선두 컬럼)도 유지된다.
ALTER TABLE site_user_event
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (id, created_at);

-- 2) 월별 RANGE COLUMNS 파티션 전환
ALTER TABLE site_user_event
  PARTITION BY RANGE COLUMNS (created_at) (
    PARTITION p_202601 VALUES LESS THAN ('2026-02-01'),
    PARTITION p_202602 VALUES LESS THAN ('2026-03-01'),
    PARTITION p_202603 VALUES LESS THAN ('2026-04-01'),
    PARTITION p_202604 VALUES LESS THAN ('2026-05-01'),
    PARTITION p_202605 VALUES LESS THAN ('2026-06-01'),
    PARTITION p_202606 VALUES LESS THAN ('2026-07-01'),
    PARTITION p_202607 VALUES LESS THAN ('2026-08-01'),
    PARTITION p_202608 VALUES LESS THAN ('2026-09-01'),
    PARTITION p_202609 VALUES LESS THAN ('2026-10-01'),
    PARTITION p_202610 VALUES LESS THAN ('2026-11-01'),
    PARTITION p_202611 VALUES LESS THAN ('2026-12-01')
  );

-- 확인
SELECT PARTITION_NAME, PARTITION_DESCRIPTION, TABLE_ROWS
FROM information_schema.PARTITIONS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_user_event'
ORDER BY PARTITION_ORDINAL_POSITION;
-- 위 결과가 11행(p_202601~p_202611)이면 성공

-- 99 롤백 (필요할 때만 — 파티션을 없애도 행은 그대로 남는다, PK 원복까지 해야 완전 원상복구)
-- ALTER TABLE site_user_event REMOVE PARTITIONING;
-- ALTER TABLE site_user_event DROP PRIMARY KEY, ADD PRIMARY KEY (id);
