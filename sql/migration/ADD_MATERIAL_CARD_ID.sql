-- =====================================================================
-- 레전드 재료 → 선수 카드 FK 연결
--
-- 지금 재료는 카드를 (구단, 연도, 선수명) 문자열 세 개로 느슨하게 가리킨다.
-- 그래서 이름 표기가 어긋나면 조용히 매칭이 깨진다 — 실제로 두산 2005·2007 리오스가
-- 접미 없이 들어가 '리오스B' 와 이어지지 않았던 적이 있다.
--
-- 자리는 처음부터 있었다 — player_card_id 컬럼이 "추후 FK 연결 예정"으로 비어 있었고,
-- 가리킬 대상이던 fun_player_card 는 끝내 만들어지지 않았다.
-- 이제 data_player_card 가 생겼으니 그 자리를 채우고 FK 로 묶는다.
--
-- ⚠️ 실행 순서
--   1) sql/V3/data/data_player_card.sql        (테이블 생성)
--   2) sql/V3/data/data_player_card_INSERT.sql (11,668행 적재)
--   3) 이 파일
--
-- 코치 행 222건(74명 × 3)은 코치 카드 테이블이 아직 없어 NULL 로 남는다.
-- 기존 제약(chk_dplm_shape)이 이미 "COACH 면 player_card_id 는 NULL" 을 요구하므로 그대로 맞는다.
-- team_code·season_year 컬럼도 지우지 않는다 — 코치는 여전히 그 값으로 읽는다.
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;

-- 1) 가리키는 대상을 바로잡는다 -----------------------------------------
--    fun_player_card 는 만들어지지 않았고, 실제 대상은 data_player_card 다.
ALTER TABLE data_player_legend_material
    MODIFY COLUMN player_card_id CHAR(36) NULL
        COMMENT 'data_player_card.id. PLAYER 행만 채워지고 COACH 행은 NULL';

-- 2) 선수 444건 연결 ---------------------------------------------------
--    포지션까지 넣어 조인하는 이유: 투타겸업 선수(김성한B 해태 1982 등)는 이름·구단·연도가
--    같고 포지션만 다른 카드가 두 장 있다. 포지션이 빠지면 어느 카드인지 가릴 수 없다.
UPDATE data_player_legend_material m
    JOIN data_player_card c
    ON c.player_name   = m.player_name
        AND c.team_code     = m.team_code
        AND c.season_year   = m.season_year
        AND c.position_code = m.player_position_code
        AND c.card_type     = 'NORMAL'
SET m.player_card_id = c.id
WHERE m.material_type = 'PLAYER';

-- 3) 연결 결과 확인 ----------------------------------------------------
--    (444, 0, 222) 여야 다음으로 간다.
--    못 채운 선수가 있으면 4)번 FK 를 걸지 말고 원인부터 찾을 것.
SELECT SUM(material_type = 'PLAYER' AND player_card_id IS NOT NULL) AS 연결됨,
       SUM(material_type = 'PLAYER' AND player_card_id IS NULL)     AS 못찾음,
       SUM(material_type = 'COACH')                                 AS 코치
FROM data_player_legend_material;

-- 못 찾은 선수가 있으면 여기서 확인
-- SELECT team_code, season_year, player_name, player_position_code
-- FROM   data_player_legend_material
-- WHERE  material_type = 'PLAYER' AND player_card_id IS NULL;

-- 4) FK 제약 ----------------------------------------------------------
--    3)번이 (444, 0, 222) 인 것을 확인한 뒤에 실행한다.
--    ON DELETE RESTRICT — 재료로 쓰이는 카드는 함부로 지워지면 안 된다.
ALTER TABLE data_player_legend_material
    ADD CONSTRAINT fk_dplm_card FOREIGN KEY (player_card_id)
        REFERENCES data_player_card (id) ON DELETE RESTRICT;


-- =====================================================================
-- 이후 활용 — 마일리지 저격 대상 119건
--
-- 구단×연도×포지션에 선수가 한 명뿐이면서 레전드 재료인 카드.
-- 그 조합을 저격하면 원하는 재료가 확정적으로 나온다.
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
