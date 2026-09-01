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
