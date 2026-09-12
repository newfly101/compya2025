-- =====================================================================
-- 선수 이름·포지션 보정 — 노말(투수,타자) 스탯 입력 시트 "최종본" 기준
--
-- 정본
--   test-docs/노말(투수,타자)_스탯_입력_시트_정리_최종본.xlsx
--   게임 화면을 12,000회가량 캡처해 이름·포지션을 3회 교차 검수한 자료다.
--   이번 회차는 fixPlayerNamesAndPositionsFromStatSheet.sql (21건) 이후
--   같은 방식으로 다시 대조해 새로 드러난 차이다.
--
-- 어떻게 찾았나
--   구단·연도·이름을 열쇠로 양방향 대조. 엑셀 11,664 ↔ 운영DB 11,664, 짝 못 지은 외톨이 0건.
--   즉 카드가 빠지거나 남은 게 아니라 순수한 이름·포지션 오기다.
--   대조 스크립트 scripts/crosscheck_final_sheet.py (참고용, 실행 불필요).
--
--   ⚠️ 운영 DB 를 직접 조회해 확인한 수치다(시드 파일 아님). 부포지션 642건은
--      전부 정본과 일치해 손댈 것이 없다. 김성한B(HAE 1983·1985) · 김정수C(MBC 1985) 는
--      같은 해 타자·투수 카드를 둘 다 가진 선수라 둘 다 정확하다 — 건드리지 않는다.
--
-- 되돌리기
--   각 UPDATE 의 새 값·옛 값을 맞바꾸면 된다. 실행 전 0) 조회 결과를 남겨두면 확실하다.
--
-- ⚠️ 재적재로 새로 넣은 DB 라면 시드가 이미 고쳐져 있어 0 rows 가 정상이다.
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;


-- 0) 실행 전 현황 -------------------------------------------------------
--    바뀔 예정인 행. 합계 16행(이름 10 + 포지션 6)이어야 한다.
SELECT player_name, team_code, season_year, position_code, player_role
FROM data_player_card
WHERE card_type = 'NORMAL'
  AND (
    (player_name = '시라미네' AND team_code = 'DOO' AND season_year = 2024)
    OR (player_name = '박승주' AND team_code = 'KIW' AND season_year = 2024)
    OR (player_name = '이창재' AND team_code = 'KT' AND season_year IN (2015, 2016, 2021))
    OR (player_name = '로웰' AND team_code = 'NC' AND season_year = 2025)
    OR (player_name = '김진규' AND team_code = 'OB' AND season_year IN (1989, 1990, 1991, 1992))
    OR (player_name = '배재준' AND team_code = 'LG' AND season_year = 2022)
    OR (player_name = '유현승' AND team_code = 'SSA' AND season_year = 1995)
    OR (player_name = '톨허스트' AND team_code = 'LG' AND season_year = 2025)
    OR (player_name = '김민' AND team_code = 'KT' AND season_year = 2018)
    OR (player_name = '이준우' AND team_code = 'KIW' AND season_year = 2025)
    OR (player_name = '김사율' AND team_code = 'KT' AND season_year = 2016)
  )
ORDER BY player_name, team_code, season_year;


-- 1) 🔴 유니크 충돌 검사 — 이것부터 볼 것 -------------------------------
--    data_player_card 에 UNIQUE (team_code, season_year, position_code, player_name, card_type)
--    가 걸려 있다. 고칠 자리에 이미 그 값(새 이름 / 새 포지션)의 카드가 있으면 UPDATE 가
--    통째로 실패하거나(단건) 다른 선수 카드를 덮어씌우는 사고로 이어진다.
--
--    ⚠️ 한 행이라도 나오면 여기서 멈추고 보고할 것. 임의로 지우거나 합치지 마라.
--    (운영 실측 기준 0 이었다. 그래도 실행 시점에 다시 본다)

--    1-a) 이름 변경 충돌 — 같은 team·year·position·card_type 자리에 새 이름이 이미 있는가
SELECT '이름' AS 종류, c.player_name AS 옛이름, x.player_name AS 새이름,
       c.team_code, c.season_year, c.position_code
FROM data_player_card c
         JOIN data_player_card x
              ON x.team_code = c.team_code
                  AND x.season_year = c.season_year
                  AND x.position_code = c.position_code
                  AND x.card_type = c.card_type
WHERE c.card_type = 'NORMAL'
  AND (
    (c.player_name = '시라미네' AND c.team_code = 'DOO' AND c.season_year = 2024 AND x.player_name = '시라카와')
    OR (c.player_name = '박승주' AND c.team_code = 'KIW' AND c.season_year = 2024 AND x.player_name = '박민찬')
    OR (c.player_name = '이창재' AND c.team_code = 'KT' AND c.season_year IN (2015, 2016, 2021) AND x.player_name = '이태우')
    OR (c.player_name = '로웰' AND c.team_code = 'NC' AND c.season_year = 2025 AND x.player_name = '로건')
    OR (c.player_name = '김진규' AND c.team_code = 'OB' AND c.season_year IN (1989, 1990, 1991, 1992) AND x.player_name = '김동균')
  );

--    1-b) 포지션 변경 충돌 — 같은 team·year·새 포지션 자리에 같은 이름이 이미 있는가
--    ⚠️ 포지션 변경이 특히 위험한 이유: 이름은 그대로라 유니크의 player_name 은 안 걸리는데,
--       position_code 만 바뀌면서 다른 행(카드 분리 등)과 겹칠 수 있다.
SELECT '포지션' AS 종류, player_name, team_code, season_year, position_code AS 이미_있는_새포지션값
FROM data_player_card
WHERE card_type = 'NORMAL'
  AND (
    (player_name = '배재준' AND team_code = 'LG' AND season_year = 2022 AND position_code = 'SP')
    OR (player_name = '유현승' AND team_code = 'SSA' AND season_year = 1995 AND position_code = 'SP')
    OR (player_name = '톨허스트' AND team_code = 'LG' AND season_year = 2025 AND position_code = 'SP')
    OR (player_name = '김민' AND team_code = 'KT' AND season_year = 2018 AND position_code = 'SP')
    OR (player_name = '이준우' AND team_code = 'KIW' AND season_year = 2025 AND position_code = 'RP')
    OR (player_name = '김사율' AND team_code = 'KT' AND season_year = 2016 AND position_code = 'RP')
  );


-- 2) 이름 보정 — 선수 카드 (10행) -----------------------------------------
--    구단·연도까지 짚는다. 이름만 보고 바꾸면 다른 팀·연도의 동명이인을 함께 망가뜨린다.

--    시라미네 → 시라카와 : DOO 2024 (1행)
UPDATE data_player_card SET player_name = '시라카와'
WHERE player_name = '시라미네' AND card_type = 'NORMAL'
  AND team_code = 'DOO' AND season_year = 2024;

--    박승주 → 박민찬 : KIW 2024 (1행)
UPDATE data_player_card SET player_name = '박민찬'
WHERE player_name = '박승주' AND card_type = 'NORMAL'
  AND team_code = 'KIW' AND season_year = 2024;

--    이창재 → 이태우 : KT 2015, 2016, 2021 (3행)
UPDATE data_player_card SET player_name = '이태우'
WHERE player_name = '이창재' AND card_type = 'NORMAL'
  AND team_code = 'KT' AND season_year IN (2015, 2016, 2021);

--    로웰 → 로건 : NC 2025 (1행)
UPDATE data_player_card SET player_name = '로건'
WHERE player_name = '로웰' AND card_type = 'NORMAL'
  AND team_code = 'NC' AND season_year = 2025;

--    김진규 → 김동균 : OB 1989~1992 (4행)
UPDATE data_player_card SET player_name = '김동균'
WHERE player_name = '김진규' AND card_type = 'NORMAL'
  AND team_code = 'OB' AND season_year IN (1989, 1990, 1991, 1992);


-- 3) 포지션 보정 — 선수 카드, 전부 투수 보직 (6행) --------------------------
--    이름은 그대로다. WHERE 에 옛 position_code 를 넣어 재실행해도 멱등하게 한다.

UPDATE data_player_card SET position_code = 'SP'
WHERE player_name = '배재준' AND card_type = 'NORMAL'
  AND team_code = 'LG' AND season_year = 2022 AND position_code = 'RP';

UPDATE data_player_card SET position_code = 'SP'
WHERE player_name = '유현승' AND card_type = 'NORMAL'
  AND team_code = 'SSA' AND season_year = 1995 AND position_code = 'RP';

UPDATE data_player_card SET position_code = 'SP'
WHERE player_name = '톨허스트' AND card_type = 'NORMAL'
  AND team_code = 'LG' AND season_year = 2025 AND position_code = 'RP';

UPDATE data_player_card SET position_code = 'SP'
WHERE player_name = '김민' AND card_type = 'NORMAL'
  AND team_code = 'KT' AND season_year = 2018 AND position_code = 'RP';

UPDATE data_player_card SET position_code = 'RP'
WHERE player_name = '이준우' AND card_type = 'NORMAL'
  AND team_code = 'KIW' AND season_year = 2025 AND position_code = 'CP';

UPDATE data_player_card SET position_code = 'RP'
WHERE player_name = '김사율' AND card_type = 'NORMAL'
  AND team_code = 'KT' AND season_year = 2016 AND position_code = 'CP';


-- 4) 히스토리 로스터 — 이름만 이어짐(team_code 컬럼 없음), 연도로 좁힌다 ------
--    이 표는 FK 없이 player_name + season_year 문자열로 재료와 이어진다.
--    포지션 6건은 이름을 바꾸지 않았으니 이 표와 무관하다.
--    ⚠️ 운영에서 직접 확인하지 않았다. 0행이면 그 이름이 로스터에 안 올라간 것뿐이니 정상이다.

--    4-a) 조회 먼저
SELECT player_name, season_year, roster_group, order_no
FROM data_history_roster
WHERE (player_name = '시라미네' AND season_year = 2024)
   OR (player_name = '박승주' AND season_year = 2024)
   OR (player_name = '이창재' AND season_year IN (2015, 2016, 2021))
   OR (player_name = '로웰' AND season_year = 2025)
   OR (player_name = '김진규' AND season_year IN (1989, 1990, 1991, 1992))
ORDER BY player_name, season_year;

--    4-b) 위 조회에 행이 있을 때만 의미 있다 (0행이면 아래도 0행 처리되어 안전)
UPDATE data_history_roster SET player_name = '시라카와'
WHERE player_name = '시라미네' AND season_year = 2024;

UPDATE data_history_roster SET player_name = '박민찬'
WHERE player_name = '박승주' AND season_year = 2024;

UPDATE data_history_roster SET player_name = '이태우'
WHERE player_name = '이창재' AND season_year IN (2015, 2016, 2021);

UPDATE data_history_roster SET player_name = '로건'
WHERE player_name = '로웰' AND season_year = 2025;

UPDATE data_history_roster SET player_name = '김동균'
WHERE player_name = '김진규' AND season_year IN (1989, 1990, 1991, 1992);


-- 5) 레전드 재료 — team_code·season_year 있음, 함께 좁힌다 -------------------
--    ⚠️ 운영에서 직접 확인하지 않았다. 0행일 수 있다.

--    5-a) 조회 먼저
SELECT player_name, team_code, season_year, material_type
FROM data_player_legend_material
WHERE (player_name = '시라미네' AND team_code = 'DOO' AND season_year = 2024)
   OR (player_name = '박승주' AND team_code = 'KIW' AND season_year = 2024)
   OR (player_name = '이창재' AND team_code = 'KT' AND season_year IN (2015, 2016, 2021))
   OR (player_name = '로웰' AND team_code = 'NC' AND season_year = 2025)
   OR (player_name = '김진규' AND team_code = 'OB' AND season_year IN (1989, 1990, 1991, 1992));

--    5-b) 위 조회에 행이 있을 때만 의미 있다
UPDATE data_player_legend_material SET player_name = '시라카와'
WHERE player_name = '시라미네' AND team_code = 'DOO' AND season_year = 2024;

UPDATE data_player_legend_material SET player_name = '박민찬'
WHERE player_name = '박승주' AND team_code = 'KIW' AND season_year = 2024;

UPDATE data_player_legend_material SET player_name = '이태우'
WHERE player_name = '이창재' AND team_code = 'KT' AND season_year IN (2015, 2016, 2021);

UPDATE data_player_legend_material SET player_name = '로건'
WHERE player_name = '로웰' AND team_code = 'NC' AND season_year = 2025;

UPDATE data_player_legend_material SET player_name = '김동균'
WHERE player_name = '김진규' AND team_code = 'OB' AND season_year IN (1989, 1990, 1991, 1992);


-- 6) 레전드 — legend_name 이 유니크 키라 연도 없이 이름+구단으로만 좁힌다 -----
--    ⚠️ 운영에서 직접 확인하지 않았다. 레전드는 선수 1명당 카드 1장이라
--       10건 모두 0행이어도 이상하지 않다.

--    6-a) 조회 먼저
SELECT legend_name, team_code, position_code
FROM data_player_legend
WHERE (legend_name = '시라미네' AND team_code = 'DOO')
   OR (legend_name = '박승주' AND team_code = 'KIW')
   OR (legend_name = '이창재' AND team_code = 'KT')
   OR (legend_name = '로웰' AND team_code = 'NC')
   OR (legend_name = '김진규' AND team_code = 'OB');

--    6-b) 위 조회에 행이 있을 때만 의미 있다
UPDATE data_player_legend SET legend_name = '시라카와' WHERE legend_name = '시라미네' AND team_code = 'DOO';
UPDATE data_player_legend SET legend_name = '박민찬' WHERE legend_name = '박승주' AND team_code = 'KIW';
UPDATE data_player_legend SET legend_name = '이태우' WHERE legend_name = '이창재' AND team_code = 'KT';
UPDATE data_player_legend SET legend_name = '로건' WHERE legend_name = '로웰' AND team_code = 'NC';
UPDATE data_player_legend SET legend_name = '김동균' WHERE legend_name = '김진규' AND team_code = 'OB';


-- 7) 실행 후 검증 ---------------------------------------------------------
--    옛 값이 0, 새 값이 기대 건수여야 한다.
SELECT SUM(player_name IN ('시라미네', '박승주', '이창재', '로웰', '김진규')) AS 남은_옛이름,
       SUM(player_name = '시라카와') AS 시라카와_1,
       SUM(player_name = '박민찬') AS 박민찬_1,
       SUM(player_name = '이태우') AS 이태우_3,
       SUM(player_name = '로건') AS 로건_1,
       SUM(player_name = '김동균') AS 김동균_4
FROM data_player_card
WHERE card_type = 'NORMAL';

--    포지션 6건 — 전부 기대값이어야 한다
SELECT player_name, team_code, season_year, position_code
FROM data_player_card
WHERE card_type = 'NORMAL'
  AND ((player_name = '배재준' AND team_code = 'LG' AND season_year = 2022)
    OR (player_name = '유현승' AND team_code = 'SSA' AND season_year = 1995)
    OR (player_name = '톨허스트' AND team_code = 'LG' AND season_year = 2025)
    OR (player_name = '김민' AND team_code = 'KT' AND season_year = 2018)
    OR (player_name = '이준우' AND team_code = 'KIW' AND season_year = 2025)
    OR (player_name = '김사율' AND team_code = 'KT' AND season_year = 2016));
--    기대 — 배재준/유현승/톨허스트/김민 = SP, 이준우/김사율 = RP

--    로스터 · 재료 · 레전드에 옛 이름이 남아있지 않아야 한다
SELECT '로스터' AS 표, player_name FROM data_history_roster
WHERE player_name IN ('시라미네', '박승주', '이창재', '로웰', '김진규')
UNION ALL
SELECT '재료', player_name FROM data_player_legend_material
WHERE player_name IN ('시라미네', '박승주', '이창재', '로웰', '김진규')
UNION ALL
SELECT '레전드', legend_name FROM data_player_legend
WHERE legend_name IN ('시라미네', '박승주', '이창재', '로웰', '김진규');
