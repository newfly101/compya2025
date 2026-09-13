-- =====================================================================
-- UPDATE_player_names_positions.sql — 선수 이름·포지션 보정 2건 병합
-- 병합 전 원본: fixPlayerNamesAndPositionsFromStatSheet(21건) → fixPlayerNamesAndPositionsFinalCrosscheck(16건) (2026-09-13 병합)
-- ⚠️ 실행 순서가 있다 — FromStatSheet 을 먼저, FinalCrosscheck 를 나중에 실행한다.
-- FinalCrosscheck 는 FromStatSheet 이후 재대조에서 새로 드러난 차이라 순서를 바꾸면 안 된다.
-- =====================================================================

-- ── 원본: fixPlayerNamesAndPositionsFromStatSheet.sql (먼저 실행) ──
-- =====================================================================
-- 선수 이름·포지션 보정 — 스탯 입력 시트 기준
--
-- 정본
--   test-docs/타자_스탯_입력_시트_정리_최종본.xlsx (2026-09-11 최신화분)
--   사용자가 게임 화면을 직접 찍어 추출하고 1:1 검수를 마친 자료다.
--   이름과 포지션 **둘 다** 이 시트가 정본이다.
--
-- 어떻게 찾았나
--   엑셀 일반_타자 6,233 + 일반_투수 5,435 = 11,668 행이
--   data_player_card 의 NORMAL 카드 수와 정확히 같다.
--   구단·연도·이름을 열쇠로 양방향 대조한 결과 —
--     DB 에만 있는 조합 21 / 엑셀에만 있는 조합 21 / 짝 못 지은 것 0
--   즉 카드가 빠지거나 남은 게 아니라 **순수한 이름 오기 21건**이다.
--
--   ⚠️ 운영 DB 를 직접 조회해 확인한 수치다(시드 파일 아님).
--
-- 구단 표기 대응 (엑셀 → DB)
--   두산DOO 롯데LOT 빙그레BIN 삼미SUP 삼성SAM 쌍방울SSA
--   청보CHU 키움KIW 태평양PAC 한화HAN 해태HAE 현대HYU  kt→KT
--   20개 구단 전부 양쪽 행 수가 일치해 대응표가 옳음이 증명됐다.
--
-- 되돌리기
--   각 UPDATE 의 새 이름·옛 이름을 맞바꾸면 된다. 포지션도 같다.
--   실행 전 아래 0) 조회 결과를 남겨두면 확실하다.
--
-- ⚠️ 재적재로 새로 넣은 DB 라면 시드가 이미 고쳐져 있어 0 rows 가 정상이다.
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;


-- 0) 실행 전 현황 -------------------------------------------------------
--    바뀔 예정인 행을 미리 눈으로 본다. 합계 24행(이름 21 + 포지션 3)이어야 한다.
SELECT player_name, team_code, season_year, position_code, player_role
FROM data_player_card
WHERE card_type = 'NORMAL'
  AND (player_name IN ('정진기', '하준호', '김수환', '이현석', '신진호', '화이즈')
    OR (team_code = 'MBC' AND season_year = 1983 AND player_name IN ('송영운', '신언호'))
    OR (team_code = 'NC' AND season_year = 2021 AND player_name = '김다율'))
ORDER BY player_name, team_code, season_year;


-- 1) 🔴 유니크 충돌 검사 — 이것부터 볼 것 -------------------------------
--    data_player_card 에 UNIQUE (team_code, season_year, position_code, player_name, card_type)
--    가 걸려 있다. 고칠 자리에 이미 올바른 이름의 카드가 있으면 UPDATE 가 통째로 실패한다.
--
--    ⚠️ 한 행이라도 나오면 여기서 멈추고 보고할 것.
--       어느 쪽을 남길지는 사람이 정할 일이다. 임의로 지우거나 합치지 마라.
--    (운영 실측 기준 0 이었다. 그래도 실행 시점에 다시 본다)
SELECT c.player_name AS 옛이름, x.player_name AS 새이름,
       c.team_code, c.season_year, c.position_code
FROM data_player_card c
         JOIN data_player_card x
              ON x.team_code = c.team_code
                  AND x.season_year = c.season_year
                  AND x.position_code = c.position_code
                  AND x.card_type = c.card_type
WHERE c.player_name IN ('정진기', '하준호', '김수환', '이현석', '신진호', '화이즈')
  AND x.player_name IN ('정세현', '하동현', '김우찬', '이도율', '신건우', '화이즈S');


-- 2) 이름 보정 — 선수 카드 (21행) ---------------------------------------
--    구단·연도까지 짚는다. 이름만 보고 바꾸면 동명이인을 함께 망가뜨린다.

--    정진기 → 정세현 : SK 2017~2020, NC 2021~2022 (6행)
UPDATE data_player_card SET player_name = '정세현'
WHERE player_name = '정진기'
  AND ((team_code = 'SK' AND season_year BETWEEN 2017 AND 2020)
    OR (team_code = 'NC' AND season_year IN (2021, 2022)));

--    하준호 → 하동현 : 롯데 2014, kt 2015~2018 · 2020~2022 (8행)
--    ⚠️ kt 2020~2022 는 중간계투(RP)다. 타자 카드만 고치면 세 장이 남는다.
UPDATE data_player_card SET player_name = '하동현'
WHERE player_name = '하준호'
  AND ((team_code = 'LOT' AND season_year = 2014)
    OR (team_code = 'KT' AND season_year BETWEEN 2015 AND 2018)
    OR (team_code = 'KT' AND season_year BETWEEN 2020 AND 2022));

--    김수환 → 김우찬 : 키움 2021~2023 (3행)
UPDATE data_player_card SET player_name = '김우찬'
WHERE player_name = '김수환'
  AND team_code = 'KIW' AND season_year BETWEEN 2021 AND 2023;

--    이현석 → 이도율 : SK 2020, SSG 2021 (2행)
UPDATE data_player_card SET player_name = '이도율'
WHERE player_name = '이현석'
  AND ((team_code = 'SK' AND season_year = 2020)
    OR (team_code = 'SSG' AND season_year = 2021));

--    신진호 → 신건우 : NC 2018 (1행)
UPDATE data_player_card SET player_name = '신건우'
WHERE player_name = '신진호'
  AND team_code = 'NC' AND season_year = 2018;

--    화이즈 → 화이즈S : SK 2020 (1행)
--    오기가 아니라 동명이인 접미 누락이다. 롯데 2000 에 화이즈B 가 따로 있어
--    접미가 없으면 어느 선수인지 가릴 수 없다.
UPDATE data_player_card SET player_name = '화이즈S'
WHERE player_name = '화이즈'
  AND team_code = 'SK' AND season_year = 2020;


-- 3) 포지션 보정 — 선수 카드 (3행) ---------------------------------------
--    MBC 1983 의 두 선수는 서로 맞바뀌어 있었다. 우연으로 보기 어렵다.
--
--    ⚠️ 유니크에 position_code 가 들어 있지만, player_name 도 함께 들어 있어
--       서로 다른 두 사람의 포지션을 맞바꾸는 것은 충돌하지 않는다.
UPDATE data_player_card SET position_code = 'DH'
WHERE player_name = '송영운' AND team_code = 'MBC' AND season_year = 1983;

UPDATE data_player_card SET position_code = 'RF'
WHERE player_name = '신언호' AND team_code = 'MBC' AND season_year = 1983;

UPDATE data_player_card SET position_code = 'LF'
WHERE player_name = '김다율' AND team_code = 'NC' AND season_year = 2021;


-- 4) 이름 보정 — 히스토리 로스터 (2행) -----------------------------------
--    이 표는 FK 없이 이름 문자열로 재료와 이어진다. 한쪽만 고치면 매칭이 끊긴다.
--    운영 실측 기준 해당 이름은 아래 둘뿐이다.
--
--    ⚠️ 송영운 1986 · 신언호 1986 · 신언호 1990 도 이 표에 있지만
--       그건 이름이 맞는 행이다(포지션 오기는 1983 카드에만 있었다). 건드리지 않는다.
UPDATE data_history_roster SET player_name = '정세현'
WHERE player_name = '정진기' AND season_year = 2018;

UPDATE data_history_roster SET player_name = '하동현'
WHERE player_name = '하준호' AND season_year = 2015;


-- 5) 레전드 재료 · 레전드 --------------------------------------------------
--    운영 실측 기준 해당 이름이 한 건도 없어 손댈 것이 없다.
--    혹시 모르니 조회만 남긴다. 0행이 정상이다.
SELECT '재료' AS 표, player_name FROM data_player_legend_material
WHERE player_name IN ('정진기', '하준호', '김수환', '이현석', '신진호', '화이즈')
UNION ALL
SELECT '레전드', legend_name FROM data_player_legend
WHERE legend_name IN ('정진기', '하준호', '김수환', '이현석', '신진호', '화이즈');


-- 6) 실행 후 검증 ----------------------------------------------------------
--    옛 이름이 0, 새 이름이 기대 건수여야 한다.
SELECT SUM(player_name IN ('정진기', '하준호', '김수환', '이현석', '신진호', '화이즈')) AS 남은_옛이름,
       SUM(player_name = '정세현')  AS 정세현_6,
       SUM(player_name = '하동현')  AS 하동현_8,
       SUM(player_name = '김우찬')  AS 김우찬_3,
       SUM(player_name = '이도율')  AS 이도율_2,
       SUM(player_name = '신건우')  AS 신건우_1,
       SUM(player_name = '화이즈S') AS 화이즈S_1
FROM data_player_card
WHERE card_type = 'NORMAL';

--    포지션 3건
SELECT player_name, team_code, season_year, position_code
FROM data_player_card
WHERE (team_code = 'MBC' AND season_year = 1983 AND player_name IN ('송영운', '신언호'))
   OR (team_code = 'NC' AND season_year = 2021 AND player_name = '김다율');
--    기대 — 송영운 DH / 신언호 RF / 김다율 LF

--    로스터
SELECT player_name, season_year, roster_group
FROM data_history_roster
WHERE player_name IN ('정진기', '하준호', '정세현', '하동현')
ORDER BY player_name;
--    기대 — 정세현 2018 / 하동현 2015 만 나온다


-- ── 원본: fixPlayerNamesAndPositionsFinalCrosscheck.sql (나중에 실행) ──
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
