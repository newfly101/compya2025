-- =====================================================================
-- UPDATE_small_fixes.sql — 짧은 1회성 데이터 보정 3건 병합
-- 병합 전 원본: FIX_SITE_NOTICES_PUBLISHED_AT(V2에서 이관) / data_player_legend_fix / fixMaterialPlayerNameSuffix (2026-09-13 병합)
-- 세 섹션은 서로 무관 — 독립적으로 실행 가능하다.
-- =====================================================================

-- ── 원본: FIX_SITE_NOTICES_PUBLISHED_AT.sql (원래 sql/V2/ — 데이터 보정이라 V2_insert 로 이관) ──
-- site_notices 발행일(published_at) 보정
--
-- 어드민 글쓰기 화면에 발행일 입력이 없어서 지금까지 등록된 공지는
-- published_at 이 비어 있다. 이후 등록/수정 건은 서버에서 자동으로 채우도록
-- 바꿨으니(등록 시각으로 대체), 과거 데이터만 한 번 보정한다.
--
-- ⚠️ 실행하지 말 것 — 파일만 만들어 둔다. 적용 시점은 별도 결정.

UPDATE site_notices
SET published_at = created_at
WHERE published_at IS NULL;


-- ── 원본: data_player_legend_fix.sql ──
-- 백인천 레전드 선수 재료 교정
--
-- 잘못된 값 : 백인천'82
-- 올바른 값 : 김인식S'82   (구단·연도는 둘 다 MBC 1982 로 동일)
--
-- 근거
--   1. 공시 「고급 레전드 재료 선수팩」 풀은 408장 = 68 레전드 x 6장 이고,
--      408장 전부가 정확히 한 레전드에만 속한다.
--      유일한 예외가 백인천'82 로, 이종범과 백인천 양쪽 목록에 걸쳐 있었다.
--      → 백인천'82 의 소유주는 이종범이다. 백인천의 6장에서 빠져야 한다.
--
--   2. 백인천의 지정 재료 18장 중 풀에 포함된 것이 7장이었다 (다른 67개는 전부 6장).
--      7장에서 백인천'82 를 빼면 6장이 되고, 남는 자리에 김인식S'82 가 들어간다.
--
--   3. 백인천'82 가 백인천 목록에 있는 이유는 MBC'82 코치 세트의 6번째이기 때문이다.
--      MBC'82 코치 카드는 5장(MBC불펜/수석/주수/타격/투수)뿐인데,
--      1982년 백인천이 MBC 플레이어-감독이라 본인 선수 카드가 감독 자리를 채운다.
--      같은 구조가 최동원에도 있다 — 롯데'88 코치 세트가 5장이고 박태호'88 이 그 자리를 채운다.
--      최동원 쪽은 DB 가 이미 올바르다.
--
--   4. 게임 내 히스토리모드 스테이지 1(1982) 로스터에서
--      김인식S'82 가 선발타자로 등장하며 레전드 재료 대상이 백인천으로 표기된다.
--
-- 여러 번 실행해도 안전하다 (조건이 맞을 때만 갱신).

UPDATE data_player_legend_material m
    JOIN data_player_legend l ON l.id = m.legend_id
SET m.player_name = '김인식S'
WHERE l.legend_name = '백인천'
  AND m.material_type = 'PLAYER'
  AND m.season_year = 1982
  AND m.team_code = 'MBC'
  AND m.player_name = '백인천';

-- 확인용
-- SELECT m.slot_no, m.team_code, m.season_year, m.player_name
-- FROM data_player_legend_material m
--          JOIN data_player_legend l ON l.id = m.legend_id
-- WHERE l.legend_name = '백인천' AND m.material_type = 'PLAYER'
-- ORDER BY m.slot_no;


-- ── 원본: fixMaterialPlayerNameSuffix.sql ──
-- 레전드 재료 선수명 동명이인 접미 보정
--
-- data_player_legend_material.player_name 은 "동명이인 접미사(B/S/C)는 유지" 가 규칙인데,
-- 두산 2005·2007 다니엘 리오스가 접미 없이 '리오스' 로 들어가 있었다.
-- LG 2026 에 '리오스S' 가 따로 있어, 접미가 없으면 어느 선수인지 가릴 수 없다.
--
-- 포지션 조사 엑셀(노말카드 포지션 조사_최종본_NOMAL_최종.xlsx)이 정본이며
-- 그쪽 표기는 '리오스B' 다. 시드 파일(sql/V3_insert/INSERT_data_player_legend.sql)도 함께 고쳤으므로
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
