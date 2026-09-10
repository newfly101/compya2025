-- =====================================================================
-- data_history_roster.roster_group — BATTER 를 HITTER 로
--
-- 타자를 가리키는 말이 코드마다 달랐다. DB 의 player_role 은 HITTER 인데
-- 이 컬럼만 BATTER 를 써서, 같은 것을 두 이름으로 부르고 있었다.
-- 화면과 스토어는 이미 hitter 로 통일했고(커밋 fd6a137) 여기만 남았다.
--
--   STARTING_BATTER → STARTING_HITTER
--   BENCH_BATTER    → BENCH_HITTER
--
-- ⚠️ 순서가 중요하다
--   chk_dhro_order 제약이 'STARTING_BATTER' 라는 값을 직접 참조한다.
--   제약을 먼저 떼지 않고 ENUM 을 바꾸면 그 자리에서 막힌다.
--   ENUM 도 한 번에 갈아끼우지 않는다 — 옛 값과 새 값을 잠시 함께 두고,
--   데이터를 옮긴 뒤 옛 값을 뺀다. 중간에 멈춰도 데이터가 깨지지 않는다.
--
-- ⚠️ 실행 전
--   - 이 테이블은 1,750행이다. 잠깐 잠기지만 금방 끝난다
--   - 서버를 내리고 할 필요는 없다. Java 쪽은 이 값을 String 으로 받아
--     상수 비교를 하지 않는다(HistoryRosterEntity.rosterGroup)
--   - 다만 화면의 한글 이름표(historyLegend.js)가 새 값을 알아야 하므로
--     FE 를 함께 배포해야 「선발타자」가 제대로 나온다
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;

-- 0) 지금 상태 확인 (실행 전 눈으로 볼 것)
--    STARTING_BATTER 986 / BENCH_BATTER 546 근처가 나온다
SELECT roster_group, COUNT(*) AS cnt
FROM data_history_roster
GROUP BY roster_group
ORDER BY roster_group;


-- 1) 값을 참조하는 제약을 뗀다 --------------------------------------
--    이걸 안 떼면 2)에서 "CHECK constraint failed" 로 막힌다.
ALTER TABLE data_history_roster
    DROP CONSTRAINT chk_dhro_order;


-- 2) ENUM 에 새 값을 더한다 (옛 값은 아직 남겨 둔다) ------------------
--    한 번에 갈아끼우면 기존 행이 갈 곳을 잃는다.
ALTER TABLE data_history_roster
    MODIFY COLUMN roster_group
        ENUM ('STARTING_BATTER','BENCH_BATTER',
              'STARTING_HITTER','BENCH_HITTER',
              'STARTING_PITCHER','RELIEF_PITCHER','CLOSER')
        NOT NULL COMMENT '선발타자9/후보타자5/선발투수5/중간계투5/마무리1';


-- 3) 데이터를 옮긴다 --------------------------------------------------
UPDATE data_history_roster
SET roster_group = 'STARTING_HITTER'
WHERE roster_group = 'STARTING_BATTER';

UPDATE data_history_roster
SET roster_group = 'BENCH_HITTER'
WHERE roster_group = 'BENCH_BATTER';


-- 4) 옮겨졌는지 확인 (BATTER 가 0 이어야 다음으로 간다) ----------------
--    0 이 아니면 여기서 멈추고 원인을 찾을 것. 5)를 실행하면 남은 행이 깨진다.
SELECT SUM(roster_group IN ('STARTING_BATTER','BENCH_BATTER')) AS 남은_BATTER,
       SUM(roster_group = 'STARTING_HITTER')                   AS STARTING_HITTER,
       SUM(roster_group = 'BENCH_HITTER')                      AS BENCH_HITTER,
       COUNT(*)                                                AS 전체
FROM data_history_roster;


-- 5) 옛 값을 뺀다 -----------------------------------------------------
ALTER TABLE data_history_roster
    MODIFY COLUMN roster_group
        ENUM ('STARTING_HITTER','BENCH_HITTER',
              'STARTING_PITCHER','RELIEF_PITCHER','CLOSER')
        NOT NULL COMMENT '선발타자9/후보타자5/선발투수5/중간계투5/마무리1';


-- 6) 제약을 새 값으로 다시 건다 ---------------------------------------
ALTER TABLE data_history_roster
    ADD CONSTRAINT chk_dhro_order CHECK (
        (roster_group = 'STARTING_HITTER' AND order_no BETWEEN 1 AND 9)
            OR (roster_group = 'BENCH_HITTER' AND order_no BETWEEN 1 AND 5)
            OR (roster_group = 'STARTING_PITCHER' AND order_no BETWEEN 1 AND 5)
            OR (roster_group = 'RELIEF_PITCHER' AND order_no BETWEEN 1 AND 5)
            OR (roster_group = 'CLOSER' AND order_no = 1)
        );


-- 7) 마무리 확인 ------------------------------------------------------
--    BATTER 가 사라지고 25인 구성이 그대로인지 본다.
SELECT roster_group, COUNT(*) AS cnt
FROM data_history_roster
GROUP BY roster_group
ORDER BY roster_group;

-- 라운드마다 25인이 유지되는지 (어긋난 라운드만 나온다 — 0행이어야 정상)
-- SELECT r.round_id,
--        COUNT(*)                                        AS total,
--        SUM(r.roster_group = 'STARTING_HITTER')         AS starting_hitter,
--        SUM(r.roster_group = 'BENCH_HITTER')            AS bench_hitter,
--        SUM(r.roster_group = 'STARTING_PITCHER')        AS starting_pitcher,
--        SUM(r.roster_group = 'RELIEF_PITCHER')          AS relief_pitcher,
--        SUM(r.roster_group = 'CLOSER')                  AS closer
-- FROM data_history_roster r
-- GROUP BY r.round_id
-- HAVING total <> 25 OR starting_hitter <> 9 OR bench_hitter <> 5
--     OR starting_pitcher <> 5 OR relief_pitcher <> 5 OR closer <> 1;
