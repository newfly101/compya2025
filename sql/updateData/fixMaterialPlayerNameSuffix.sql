-- 레전드 재료 선수명 동명이인 접미 보정
--
-- data_player_legend_material.player_name 은 "동명이인 접미사(B/S/C)는 유지" 가 규칙인데,
-- 두산 2005·2007 다니엘 리오스가 접미 없이 '리오스' 로 들어가 있었다.
-- LG 2026 에 '리오스S' 가 따로 있어, 접미가 없으면 어느 선수인지 가릴 수 없다.
--
-- 포지션 조사 엑셀(노말카드 포지션 조사_최종본_NOMAL_최종.xlsx)이 정본이며
-- 그쪽 표기는 '리오스B' 다. 시드 파일(data_player_legend_INSERT.sql)도 함께 고쳤으므로
-- 이 스크립트는 이미 적재된 DB 를 맞추는 용도다.
--
-- 재적재로 새로 넣은 DB 라면 이미 '리오스B' 라서 0 rows affected 가 정상이다.

SET NAMES utf8mb4;
USE compyafun;

UPDATE data_player_legend_material
SET player_name = '리오스B'
WHERE id IN (
    '1319af33-fdbe-4f2d-a4d9-d1d6f2628f13',  -- DOO 2007
    '2b9c7382-4aa9-4881-ad32-7378793622bf'   -- DOO 2005
);

-- 확인 --------------------------------------------------------------
-- 접미 없는 '리오스' 가 남아있지 않아야 한다
-- SELECT id, team_code, season_year, player_name
-- FROM data_player_legend_material
-- WHERE player_name LIKE '리오스%';
