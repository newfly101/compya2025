#!/usr/bin/env python3
"""포지션 조사 엑셀 → data_player_legend_material.player_position_code UPDATE 생성.

재료 시드의 PLAYER 행을 (선수명, 구단, 연도) 로 엑셀과 맞춰 포지션을 찾는다.
player_name 이 없는 행은 코치라 건너뛴다.

사용법
  python scripts/gen_material_position_update.py [-o 출력경로]
"""
from __future__ import annotations

import argparse
import re
from collections import defaultdict
from pathlib import Path

import openpyxl

XLSX = Path("test-docs/레전드 재료 앱 디자인/data_handoff_player_position/노말카드 포지션 조사_최종본_NOMAL_최종.xlsx")
SEED = Path("sql/V3/data/data_player_legend_INSERT.sql")

# 재료 시드의 팀 코드 ↔ 엑셀(players.json) 구단 표기.
# SUP 은 장명부 1983 한 건 — 삼미 슈퍼스타즈다.
TEAM = {
    "SAM": "삼성", "LG": "LG", "LOT": "롯데", "HAN": "한화", "DOO": "두산",
    "KIA": "KIA", "HAE": "해태", "SK": "SK", "HYU": "현대", "NC": "NC",
    "OB": "OB", "KIW": "키움", "BIN": "빙그레", "PAC": "태평양", "MBC": "MBC",
    "SSG": "SSG", "SSA": "쌍방울", "KT": "kt", "SUP": "삼미", "CHU": "청보",
}

# 엑셀에서 포지션을 읽을 시트. 코치 시트는 포지션이 없어 제외한다.
SHEETS = ("선수", "L 단일")


def load_positions() -> dict[tuple[str, str, int], str]:
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    table: dict[tuple[str, str, int], str] = {}
    clash = 0
    for sheet in SHEETS:
        if sheet not in wb.sheetnames:
            continue
        ws = wb[sheet]
        head = [ws.cell(1, c).value for c in range(1, ws.max_column + 1)]
        col = {name: i + 1 for i, name in enumerate(head) if name}
        for r in range(2, ws.max_row + 1):
            name = ws.cell(r, col["이름"]).value
            team = ws.cell(r, col["구단"]).value
            year = ws.cell(r, col["연도"]).value
            pos = ws.cell(r, col["포지션"]).value
            if not (name and team and pos) or not isinstance(year, int):
                continue
            key = (str(name).strip(), str(team).strip(), year)
            pos = str(pos).strip()
            if key in table and table[key] != pos:
                clash += 1
            table[key] = pos
    if clash:
        # 김성한처럼 투타겸업이면 같은 해에 투수 카드와 타자 카드가 따로 있다 — 정상이다.
        # 한 칸에 하나만 담기므로 뒤에 읽은 값이 남는다. 재료에 그런 선수가 있으면
        # 아래 미매칭 목록이 아니라 이 경고로 드러난다.
        print(f"  같은 선수·구단·연도에 포지션이 둘인 행 {clash}건 — 투타겸업(카드 2장). 뒤 값을 씀")
    return table


MATERIAL_ROW = re.compile(
    r"\(\s*'([0-9a-f-]{36})'\s*,\s*'[0-9a-f-]{36}'\s*,\s*'PLAYER'\s*,\s*\d+\s*,"
    r"\s*'([A-Z]+)'\s*,\s*(\d{4})\s*,\s*'([^']+)'\s*\)"
)


def load_materials() -> list[tuple[str, str, int, str]]:
    """(id, team_code, season_year, player_name) — PLAYER 행만."""
    text = SEED.read_text(encoding="utf-8")
    return [(m.group(1), m.group(2), int(m.group(3)), m.group(4))
            for m in MATERIAL_ROW.finditer(text)]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("-o", "--out", type=Path,
                    default=Path("sql/updateData/updateMaterialPosition.sql"))
    args = ap.parse_args()

    positions = load_positions()
    materials = load_materials()
    print(f"엑셀 포지션 {len(positions):,}건 / 재료 PLAYER 행 {len(materials):,}건")

    # 접미 없는 이름 → 후보. 재료 시드가 동명이인 접미(B/S/C)를 빠뜨린 행이 있다
    # (예: 두산 2005 '리오스' ↔ 엑셀 '리오스B'). 후보가 하나뿐일 때만 붙여 쓴다.
    loose: dict[tuple[str, str, int], list[tuple[str, str]]] = defaultdict(list)
    for (name, team, year), pos in positions.items():
        base = re.sub(r"[A-Z]$", "", name)
        if base != name:
            loose[(base, team, year)].append((name, pos))

    by_pos: dict[str, list[str]] = defaultdict(list)
    missing: list[tuple[str, str, int, str]] = []
    unknown_team: set[str] = set()
    loosened: list[str] = []

    for mid, code, year, name in materials:
        team = TEAM.get(code)
        if team is None:
            unknown_team.add(code)
            missing.append((mid, code, year, name))
            continue
        pos = positions.get((name, team, year))
        if pos is None:
            cands = loose.get((name, team, year), [])
            if len(cands) == 1:
                full, pos = cands[0]
                loosened.append(f"{code} {year} {name} → {full} ({pos})")
        if pos is None:
            missing.append((mid, code, year, name))
            continue
        by_pos[pos].append(mid)

    matched = sum(len(v) for v in by_pos.values())
    print(f"매칭 {matched:,}건 / 미매칭 {len(missing):,}건")
    if unknown_team:
        print(f"  모르는 팀 코드: {sorted(unknown_team)}")
    if loosened:
        print(f"  접미 보정으로 찾은 건 {len(loosened)}:")
        for line in loosened:
            print(f"    {line}")

    lines = [
        "-- 자동 생성 파일 (scripts/gen_material_position_update.py).",
        f"-- 출처: {XLSX.name}",
        "-- 레전드 재료 선수의 포지션을 채운다. 코치 행(player_name IS NULL)은 대상이 아니다.",
        "--",
        f"-- 재료 PLAYER 행 {len(materials):,}건 중 {matched:,}건 매칭"
        + (f", {len(missing):,}건은 엑셀에서 못 찾아 그대로 둔다." if missing else "."),
        "",
        "SET NAMES utf8mb4;",
        "USE compyafun;",
        "START TRANSACTION;",
        "",
    ]

    for pos in sorted(by_pos):
        ids = by_pos[pos]
        lines.append(f"-- {pos} {len(ids)}건")
        lines.append(f"UPDATE data_player_legend_material SET player_position_code = '{pos}'")
        lines.append("WHERE id IN (")
        for i in range(0, len(ids), 4):
            chunk = ", ".join(f"'{x}'" for x in ids[i:i + 4])
            lines.append(f"    {chunk}" + ("," if i + 4 < len(ids) else ""))
        lines.append(");")
        lines.append("")

    lines += [
        "COMMIT;",
        "",
        "-- 확인용 --------------------------------------------------------",
        "-- 포지션이 채워졌는지 (코치는 원래 NULL 이라 제외)",
        "-- SELECT COUNT(*) AS 전체,",
        "--        SUM(player_position_code IS NOT NULL) AS 채워짐,",
        "--        SUM(player_position_code IS NULL)     AS 비어있음",
        "-- FROM data_player_legend_material WHERE player_name IS NOT NULL;",
        "",
        "-- 아직 비어있는 선수 목록",
        "-- SELECT team_code, season_year, player_name FROM data_player_legend_material",
        "-- WHERE player_name IS NOT NULL AND player_position_code IS NULL",
        "-- ORDER BY team_code, season_year;",
    ]

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text("\n".join(lines), encoding="utf-8")
    print(f"→ {args.out}")

    if missing:
        print("\n엑셀에서 못 찾은 재료 (앞 20건):")
        for _, code, year, name in missing[:20]:
            print(f"  {code} {year} {name}")
        if len(missing) > 20:
            print(f"  … 외 {len(missing) - 20}건")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
