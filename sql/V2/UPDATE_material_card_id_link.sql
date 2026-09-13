-- =====================================================================
-- data_player_legend_material.player_card_id 값 연결 (데이터 백필)
--
-- 컬럼 자체와 FK(fk_dplm_card)는 스키마이므로 CREATE_ 로 옮겼다
--   - 컬럼:  sql/V3/CREATE_02_data_player_legend.sql (data_player_legend_material)
--   - FK  :  sql/V3/CREATE_03_data_player_card.sql   맨 끝 (data_player_card 가 여기서 생기므로)
-- 이 파일은 그 컬럼에 실제 값을 채우는 데이터 작업만 담당한다.
--
-- 실행 전제 — 아래 순서로 이미 적재돼 있어야 한다
--   1) sql/V3/CREATE_03_data_player_card.sql       (테이블 + FK)
--   2) sql/V3_insert/INSERT_data_player_card.sql   (11,668건 적재)
--   3) 이 파일
--
-- 연결 방법 — team_code·season_year·position_code·player_name 일치 + card_type='NORMAL' 인
-- data_player_card 를 찾아 player_card_id 에 넣는다. 대상은 material_type='PLAYER' 행뿐이다
-- (COACH 행은 player_card_id 가 항상 NULL — chk_dplm_shape 참고).
--
-- 실측 기준 222건(74레전드 x 3) 중 74건은 대응 카드가 없어 NULL 로 남는다.
-- chk_dplm_shape 제약은 "COACH 면 player_card_id NULL" 만 강제하고, 이 미매칭 자체는 막지 않는다.
-- team_code·season_year 표기가 서로 달라 생기는 정상적인 차이이니 재작업하지 않는다.
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;

-- 1) 데이터 연결 -----------------------------------------------------------
--    포지션·시즌·구단·이름 4중 매치. 아무 하나라도 다르면 매칭되지 않는다.
UPDATE data_player_legend_material m
    JOIN data_player_card c
    ON c.player_name   = m.player_name
        AND c.team_code     = m.team_code
        AND c.season_year   = m.season_year
        AND c.position_code = m.player_position_code
        AND c.card_type     = 'NORMAL'
SET m.player_card_id = c.id
WHERE m.material_type = 'PLAYER';

-- 2) 연결 결과 확인 ----------------------------------------------------------
--    (연결됨, 미매칭, COACH) 순 — 미매칭은 74건 전후가 정상.
SELECT SUM(material_type = 'PLAYER' AND player_card_id IS NOT NULL) AS 연결됨,
       SUM(material_type = 'PLAYER' AND player_card_id IS NULL)     AS 미매칭,
       SUM(material_type = 'COACH')                                 AS 코치
FROM data_player_legend_material;

-- 미매칭 행을 눈으로 보고 싶으면 이 조회
-- SELECT team_code, season_year, player_name, player_position_code
-- FROM   data_player_legend_material
-- WHERE  material_type = 'PLAYER' AND player_card_id IS NULL;


-- =====================================================================
-- 레전드 재료 선정 로직 검증용 참고 쿼리 (실행 불필요)
--
-- 구단×연도×포지션 조합에 선수가 정확히 1명뿐인 자리 — 재료 선정이 이 로직을
-- 따랐는지 사람이 대조할 때 쓴다.
-- =====================================================================
-- SELECT c.team_code, c.season_year, c.position_code, c.player_name
-- FROM   data_player_card c
--            JOIN data_player_legend_material m ON m.player_card_id = c.id
--            JOIN (SELECT team_code, season_year, position_code
--                  FROM   data_player_card
--                  WHERE  card_type = 'NORMAL'
--                  GROUP  BY team_code, season_year, position_code
--                  HAVING COUNT(DISTINCT player_name) = 1) solo
--                 ON solo.team_code     = c.team_code
--                     AND solo.season_year   = c.season_year
--                     AND solo.position_code = c.position_code
-- WHERE  c.card_type = 'NORMAL'
-- ORDER  BY c.team_code, c.season_year, c.position_code;
