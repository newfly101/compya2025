# -*- coding: utf-8 -*-
"""부포지션 채우기 SQL 생성 — 타자 스탯 시트가 정본.
엑셀 포지션 칸이 '1B/DH' 처럼 슬래시로 나뉜 행(642건)만 대상이다.
앞이 주포지션, 뒤가 부포지션. 투수 시트에는 겸업이 한 건도 없다."""
import openpyxl, io, sys

XLSX = "test-docs/타자_스탯_입력_시트_정리_최종본.xlsx"
OUT = "sql/updateData/addSubPositionFromStatSheet.sql"
# 엑셀 한글 구단 표기 → DB team_code
TEAM = {'두산':'DOO','롯데':'LOT','빙그레':'BIN','삼미':'SUP','삼성':'SAM','쌍방울':'SSA',
        '청보':'CHU','키움':'KIW','태평양':'PAC','한화':'HAN','해태':'HAE','현대':'HYU','kt':'KT'}

wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
rows = []
for sheet in ("일반_타자", "일반_투수"):
    for r in wb[sheet].iter_rows(min_row=3, values_only=True):
        if not r or not r[0]:
            continue
        pos = [p.strip() for p in str(r[7]).split('/') if p.strip()]
        if len(pos) < 2:
            continue
        rows.append((TEAM.get(str(r[2]).strip(), str(r[2]).strip()),
                     int(float(r[3])), str(r[1]).strip(), pos[0], pos[1]))

def esc(s):
    return s.replace("\\", "\\\\").replace("'", "\'")

with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
    f.write(f"""-- =====================================================================
-- 부포지션 채우기 — 타자 스탯 시트 기준
--
-- 정본: {XLSX}
--   포지션 칸이 '1B/DH' 처럼 슬래시로 나뉜 행이 겸업이다. 앞이 주, 뒤가 부.
--   타자 {len(rows)}건이며 투수 시트에는 겸업이 한 건도 없다(세 개 이상도 0건).
--
-- 왜 필요한가
--   마일리지 저격은 구단x연도x포지션에 선수가 한 명뿐인 칸을 찾는다.
--   부포지션을 모르면 그 칸에 실제로는 두 명인데 한 명으로 세어 잘못 잡힌다.
--   반대로 부포지션 칸에서 혼자인 선수를 놓치기도 한다.
--   주/부를 합쳐 세면 저격 대상이 119건에서 111건이 된다(빠짐 15 · 추가 7).
--
-- 되돌리기
--   ALTER TABLE data_player_card DROP COLUMN sub_position_code;
--   컬럼째 지우면 원래대로 돌아간다. 다른 데이터는 건드리지 않는다.
--
-- ⚠️ 컬럼 추가는 되돌릴 수 있지만, 운영 DB 다. 0) 조회로 현황을 먼저 볼 것.
-- 이 스크립트는 scripts/gen_sub_position_sql.py 가 만든다. 손으로 고치지 마라.
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;


-- 0) 실행 전 현황 -------------------------------------------------------
SELECT COUNT(*) AS 전체_노말카드,
       SUM(player_role = 'HITTER')  AS 타자,
       SUM(player_role = 'PITCHER') AS 투수
FROM data_player_card
WHERE card_type = 'NORMAL';


-- 1) 부포지션 칸을 만든다 ------------------------------------------------
--    ⚠️ 유니크(team_code, season_year, position_code, player_name, card_type)에는
--       넣지 않는다. 넣으면 같은 선수가 부포지션만 달라도 다른 카드로 취급된다.
ALTER TABLE data_player_card
    ADD COLUMN IF NOT EXISTS sub_position_code VARCHAR(10) NULL
        COMMENT '부포지션. 겸업 선수만 채운다. 주포지션은 position_code'
        AFTER position_code;


-- 2) 값을 채운다 ({len(rows)}건) ---------------------------------------------
--    구단·연도·이름·주포지션까지 짚는다. 이름만 보고 채우면 동명이인이 섞인다.
""")
    for tm, yr, nm, main, sub in rows:
        f.write(f"UPDATE data_player_card SET sub_position_code = '{esc(sub)}' "
                f"WHERE team_code = '{esc(tm)}' AND season_year = {yr} "
                f"AND player_name = '{esc(nm)}' AND position_code = '{esc(main)}' "
                f"AND card_type = 'NORMAL';\n")
    f.write(f"""

-- 3) 실행 후 검증 --------------------------------------------------------
--    채워진 행이 {len(rows)}건이어야 한다. 투수는 0이어야 한다.
SELECT COUNT(*) AS 부포지션_채워짐,
       SUM(player_role = 'PITCHER') AS 투수인데_채워짐
FROM data_player_card
WHERE sub_position_code IS NOT NULL;

--    주포지션과 부포지션이 같은 행은 없어야 한다
SELECT COUNT(*) AS 주부_같음
FROM data_player_card
WHERE sub_position_code = position_code;

--    많이 나오는 조합 (눈으로 확인용)
SELECT position_code, sub_position_code, COUNT(*) AS cnt
FROM data_player_card
WHERE sub_position_code IS NOT NULL
GROUP BY 1, 2
ORDER BY cnt DESC
LIMIT 10;
""")
print(f"{OUT} — UPDATE {len(rows)}건")
