#!/usr/bin/env python3
"""data_player_card 1단계 시드 생성.

소스는 엑셀 「선수」시트(포지션 조사 최종본) 11,672행 단독이다.
players.json 은 쓰지 않는다 — 포지션이 없고, 코치 판정을 다시 거쳐야 해서 원본으로 부적합.

1단계는 card_type = 'NORMAL' 만 채운다. '일반' 카드가 없는 건 레전드(이 테이블 대상 아님)뿐이라
엑셀의 모든 행이 NORMAL 카드 1장에 대응한다. 올스타/국가대표/골든글러브/MVP/에픽은 2단계.

⚠️ 예외 처리 — 같은 (이름,구단,연도) 가 두 행으로 나오는 경우가 8건(4쌍) 있다.
   UNIQUE KEY 는 (구단,연도,포지션,이름,종류) 라 포지션이 다르면 자연히 공존한다.
   - 투타겸업 2중 카드 4쌍(김성한B×3, 김정수C×1) — 포지션이 서로 달라 그대로 둘 다 남긴다
     (인게임에서 실제로 확인된 카드 2장).
   - 로하스B 4쌍(kt 2017~2020) — 구단·연도·포지션·이름이 완전히 같은 진짜 중복(원본 확률표
     집계 오류로 판단). "카드 종류 개수가 더 많은(더 풍부한) 행"을 남기고 나머지는 버린다
     — 개수가 같으면 시트에 먼저 나온 행을 남긴다. 버린 행은 로그로 남긴다.

사용법
  python scripts/gen_player_card_seed.py [-o 출력경로]
"""
from __future__ import annotations

import argparse
import sys
import uuid
from pathlib import Path

import openpyxl

# 이 프로젝트의 선수 카드 데이터 전용 네임스페이스. 고정값이며 바꾸면 모든 id 가 달라진다.
NAMESPACE = uuid.uuid5(uuid.NAMESPACE_URL, "https://compyafun.com/data/player-card")

SOURCE_XLSX = Path(
    "test-docs/레전드 재료 앱 디자인/data_handoff_player_position/"
    "노말카드 포지션 조사_최종본_NOMAL_최종.xlsx"
)
SHEET_NAME = "선수"

# data_player_legend_material 등 기존 테이블과 같은 코드 체계로 통일한다.
TEAM_CODE = {
    "삼성": "SAM", "LG": "LG", "롯데": "LOT", "한화": "HAN", "두산": "DOO",
    "KIA": "KIA", "해태": "HAE", "SK": "SK", "현대": "HYU", "NC": "NC",
    "OB": "OB", "키움": "KIW", "빙그레": "BIN", "태평양": "PAC", "MBC": "MBC",
    "SSG": "SSG", "쌍방울": "SSA", "kt": "KT", "삼미": "SUP", "청보": "CHU",
}

PITCHER_POSITIONS = {"SP", "RP", "CP"}
NAME_MAX_LEN = 20

BATCH = 200  # INSERT 한 문장에 담을 행 수


def card_uid(team_code: str, season_year: int, position_code: str, player_name: str, card_type: str) -> str:
    """이름에서 UUID v5 를 만든다. 같은 이름이면 언제 돌려도 같은 값.

    UNIQUE KEY 순서(team_code, season_year, position_code, player_name, card_type)를 그대로 따른다.
    position_code 를 반드시 포함해야 한다 — 투타겸업 선수(김성한B 등)는 이름·구단·연도·종류가
    같고 포지션만 다른 두 행이 실존하므로, position_code 가 빠지면 두 행의 id 가 같아져
    PRIMARY KEY 충돌이 난다.
    """
    name = f"player_card:{team_code}:{season_year}:{position_code}:{player_name}:{card_type}"
    return str(uuid.uuid5(NAMESPACE, name))


def quote(text: str) -> str:
    return "'" + text.replace("\\", "\\\\").replace("'", "''") + "'"


def load_rows() -> list[tuple]:
    wb = openpyxl.load_workbook(SOURCE_XLSX, data_only=True)
    ws = wb[SHEET_NAME]
    return list(ws.iter_rows(min_row=2, values_only=True))


def build_records(rows: list[tuple]) -> tuple[list[tuple], list[tuple]]:
    """엑셀 행 → (player_name, team_code, season_year, player_role, position_code, has_signature).

    반환값: (최종 레코드 목록, 중복 처리로 버려진 행 목록)
    """
    best: dict[tuple, tuple[int, int, tuple]] = {}  # key -> (richness, order, record)
    dropped: list[tuple] = []

    for order, r in enumerate(rows):
        _id, name, team, year, _grade, card_types_raw, _role_formula, position, _note = r

        if team not in TEAM_CODE:
            print(f"[실패] 알 수 없는 구단: {team!r} (엑셀 행 {order + 2})", file=sys.stderr)
            sys.exit(1)
        team_code = TEAM_CODE[team]

        if not isinstance(year, int):
            print(f"[실패] 연도가 정수가 아님: {name} {team} {year!r} (엑셀 행 {order + 2})", file=sys.stderr)
            sys.exit(1)
        season_year = year

        if not name or len(name) > NAME_MAX_LEN:
            print(f"[실패] 이름 형식 오류(공백/{NAME_MAX_LEN}자 초과): {name!r} (엑셀 행 {order + 2})", file=sys.stderr)
            sys.exit(1)

        position_code = str(position).strip() if position else ""
        if not position_code:
            print(f"[실패] 포지션 없음: {name} {team} {year} (엑셀 행 {order + 2})", file=sys.stderr)
            sys.exit(1)

        # 「타자/투수」 열은 수식이라 캐시가 비어 있다(실측: 11,672행 전부 None) — 포지션으로 판정.
        role = "PITCHER" if position_code in PITCHER_POSITIONS else "HITTER"

        card_types = [t.strip() for t in (card_types_raw or "").split(",") if t.strip()]
        has_signature = any("시그니처" in t for t in card_types)
        richness = len(card_types)

        record = (name, team_code, season_year, role, position_code, has_signature)
        key = (team_code, season_year, position_code, name)

        cur = best.get(key)
        if cur is None:
            best[key] = (richness, order, record)
        elif richness > cur[0]:
            dropped.append(cur[2])
            best[key] = (richness, order, record)
        else:
            dropped.append(record)

    records = [v[2] for v in best.values()]
    return records, dropped


def emit(rows: list[str], out: list[str]) -> None:
    for start in range(0, len(rows), BATCH):
        chunk = rows[start: start + BATCH]
        out.append(
            "INSERT INTO data_player_card "
            "(id, player_name, team_code, season_year, player_role, position_code, card_type, has_signature)\nVALUES"
        )
        out.append(",\n".join(chunk) + ";")
        out.append("")


def validate(records: list[tuple]) -> None:
    """개행마다 실패시켜야 할 항목을 확인. 하나라도 어긋나면 0이 아닌 코드로 종료."""
    errors: list[str] = []

    total = len(records)
    if total != 11672 - 4:
        errors.append(f"전체 건수 불일치: {total} (기대 {11672 - 4} = 엑셀 11,672 - 로하스B 중복 4)")

    # 기대치 5,129 = 로하스B 정리 전 11,664행 기준 5,126 + 되살아난 투타겸업 3쌍(김성한B) 중
    # has_signature=TRUE 인 3건. (김정수C 1985 3B 는 시그니처 없음이라 +0)
    sig_true = sum(1 for r in records if r[5] is True)
    if sig_true != 5129:
        errors.append(f"has_signature TRUE 건수 불일치: {sig_true} (기대 5,129)")

    sig_null = sum(1 for r in records if r[5] is None)
    if sig_null != 0:
        errors.append(f"has_signature NULL 행 존재: {sig_null}건 (NORMAL 은 NULL 불가)")

    year_null = sum(1 for r in records if r[2] is None)
    if year_null != 0:
        errors.append(f"season_year NULL 행 존재: {year_null}건")

    pos_null = sum(1 for r in records if not r[4])
    if pos_null != 0:
        errors.append(f"position_code 빈 값 행 존재: {pos_null}건")

    max_name_len = max(len(r[0]) for r in records)
    if max_name_len > NAME_MAX_LEN:
        errors.append(f"player_name 최대 길이 초과: {max_name_len}자 (제한 {NAME_MAX_LEN}자)")

    ids = [card_uid(r[1], r[2], r[4], r[0], "NORMAL") for r in records]
    if len(ids) != len(set(ids)):
        errors.append(f"id 중복 발생: {len(ids) - len(set(ids))}건")

    # r = (name, team_code, season_year, role, position_code, has_sig) → UNIQUE 키 순서로 재배열
    keys = [(r[1], r[2], r[4], r[0]) for r in records]  # + card_type('NORMAL' 고정)이라 이 조합이 곧 UNIQUE 키
    if len(keys) != len(set(keys)):
        errors.append(f"UNIQUE 키(구단·연도·포지션·이름·종류) 중복: {len(keys) - len(set(keys))}건")

    bad_teams = {r[1] for r in records} - set(TEAM_CODE.values())
    if bad_teams:
        errors.append(f"team_code 변환표 밖 값: {bad_teams}")

    if errors:
        print("[검증 실패]", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)

    print("[검증 통과]")
    print(f"  전체 {total}행 (card_type=NORMAL 전부)")
    print(f"  has_signature TRUE {sig_true} / FALSE {total - sig_true} / NULL 0")
    print(f"  season_year NULL 0 / position_code 빈값 0")
    print(f"  player_name 최대 길이 {max_name_len}자 (제한 {NAME_MAX_LEN}자)")
    print(f"  id 중복 0 / UNIQUE 키 중복 0")
    print(f"  team_code 20종 이내 확인")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "-o", "--out", type=Path,
        default=Path("sql/V3/data/data_player_card_INSERT.sql"),
    )
    args = ap.parse_args()

    rows = load_rows()
    if len(rows) != 11672:
        print(f"[실패] 엑셀 행 수가 예상과 다름: {len(rows)} (기대 11,672)", file=sys.stderr)
        return 1

    records, dropped = build_records(rows)
    if dropped:
        print(f"중복 정리로 제외된 행 {len(dropped)}건 (더 풍부한 행을 남김):")
        for d in dropped:
            print(f"  - {d[0]} {d[1]} {d[2]} pos={d[4]} sig={d[5]}")

    validate(records)

    insert_rows = [
        f"  ({quote(card_uid(team_code, season_year, position_code, name, 'NORMAL'))}, "
        f"{quote(name)}, {quote(team_code)}, {season_year}, '{role}', "
        f"{quote(position_code)}, 'NORMAL', {1 if has_sig else 0})"
        for (name, team_code, season_year, role, position_code, has_sig) in records
    ]

    out: list[str] = [
        "-- 자동 생성 파일. 직접 고치지 말 것 (scripts/gen_player_card_seed.py 가 덮어씀).",
        "-- source: 노말카드 포지션 조사_최종본_NOMAL_최종.xlsx (「선수」 시트, 11,672행)",
        "-- 1단계 시드 — card_type 전부 NORMAL. 나머지 종류는 2단계에서 추가.",
        "-- UUID v5 — 이름에서 계산되므로 다시 생성해도 같은 id 가 나온다.",
        "",
        "SET NAMES utf8mb4;",
        "USE compyafun;",
        "START TRANSACTION;",
        "",
        "DELETE FROM data_player_card WHERE card_type = 'NORMAL';",
        "",
    ]
    emit(insert_rows, out)
    out.append("COMMIT;")
    out.append("")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text("\n".join(out), encoding="utf-8")

    print(f"\n→ {args.out} ({len(records)}행)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
