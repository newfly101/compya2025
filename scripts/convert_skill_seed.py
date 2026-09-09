#!/usr/bin/env python3
"""기존 스킬 시드(숫자 id) → data_player_skill 계열 시드(UUID v5) 변환.

바뀌는 것
  - 테이블명   skill / skill_tier / skill_tier_value
               → data_player_skill / data_player_skill_tier / data_player_skill_tier_value
  - id         숫자(146, 246…) → UUID v5 (이름에서 계산하므로 재실행해도 동일)
  - role       batter/pitcher  → HITTER/PITCHER
  - grade      legend/…        → LEGEND/…  (grade_label 컬럼은 버린다. grade 에서 나오는 값)
  - 값 참조    (skill_id, tier) → skill_tier_id  (티어 행의 UUID 를 직접 가리킨다)
  - 값 컬럼명  value           → skill_value     (예약어는 아니지만 너무 일반적인 이름)

사용법
  python scripts/convert_skill_seed.py <기존시드.sql> [-o 출력경로]

출력 기본값: sql/V3/data/data_player_skill_INSERT.sql
"""
from __future__ import annotations

import argparse
import re
import sys
import uuid
from pathlib import Path

# 이 프로젝트의 스킬 데이터 전용 네임스페이스. 고정값이며 바꾸면 모든 id 가 달라진다.
NAMESPACE = uuid.uuid5(uuid.NAMESPACE_URL, "https://compyafun.com/data/player-skill")

ROLE_MAP = {"batter": "HITTER", "pitcher": "PITCHER"}
GRADE_MAP = {"normal": "NORMAL", "hero": "HERO", "platinum": "PLATINUM", "legend": "LEGEND"}

BATCH = 200  # INSERT 한 문장에 담을 행 수


def uid(name: str) -> str:
    """이름에서 UUID v5 를 만든다. 같은 이름이면 언제 돌려도 같은 값."""
    return str(uuid.uuid5(NAMESPACE, name))


def skill_uid(role: str, name: str) -> str:
    return uid(f"skill:{role}:{name}")


def tier_uid(role: str, name: str, tier: str) -> str:
    return uid(f"skill_tier:{role}:{name}:{tier}")


def value_uid(role: str, name: str, tier: str, order: int) -> str:
    return uid(f"skill_tier_value:{role}:{name}:{tier}:{order}")


# ── 파싱 ────────────────────────────────────────────────────────────────
# 설명문 안에 쉼표·괄호·따옴표가 들어 있어서 단순 split 으로는 못 쪼갠다.
# 따옴표 안/밖을 추적하는 상태 기계로 읽는다.

def split_tuples(body: str) -> list[list[str]]:
    """`(a, 'b', c), (d, 'e', f)` → [[a, b, c], [d, e, f]]"""
    rows: list[list[str]] = []
    field: list[str] = []
    row: list[str] = []
    in_str = False
    depth = 0
    i = 0
    while i < len(body):
        ch = body[i]
        if in_str:
            if ch == "\\" and i + 1 < len(body):  # \' \" \n 등 이스케이프
                field.append(body[i : i + 2])
                i += 2
                continue
            if ch == "'":
                if i + 1 < len(body) and body[i + 1] == "'":  # '' → 따옴표 한 개
                    field.append("''")
                    i += 2
                    continue
                in_str = False
                i += 1
                continue
            field.append(ch)
            i += 1
            continue

        if ch == "'":
            in_str = True
        elif ch == "(":
            depth += 1
            if depth == 1:
                row, field = [], []
        elif ch == ")":
            depth -= 1
            if depth == 0:
                row.append("".join(field).strip())
                rows.append(row)
                field = []
        elif ch == "," and depth == 1:
            row.append("".join(field).strip())
            field = []
        elif depth == 1:
            field.append(ch)
        i += 1
    return rows


def parse_inserts(sql: str, table: str) -> list[list[str]]:
    """해당 테이블의 INSERT 를 전부(여러 블록이어도) 모아 행 목록으로 돌려준다."""
    pattern = re.compile(
        rf"INSERT\s+INTO\s+{table}\s*\([^)]*\)\s*VALUES(.*?);",
        re.IGNORECASE | re.DOTALL,
    )
    rows: list[list[str]] = []
    for match in pattern.finditer(sql):
        rows.extend(split_tuples(match.group(1)))
    return rows


def unquote(token: str) -> str:
    """바깥 따옴표만 벗긴다. 안쪽은 SQL 리터럴 표현 그대로(\\n, '' 유지)."""
    return token[1:-1] if len(token) >= 2 and token[0] == "'" and token[-1] == "'" else token


def requote(raw: str) -> str:
    """리터럴 표현을 그대로 다시 감싼다.

    파서가 이스케이프를 풀지 않고 보존하므로 여기서 다시 이스케이프하면 안 된다.
    (설명문의 \\n 이 \\\\n 이 되어 개행이 아니라 글자 두 개로 저장되는 사고를 막는다)
    """
    return "'" + raw + "'"


def sql_unescape(raw: str) -> str:
    """리터럴 표현 → 실제 문자열. UUID 이름 계산에만 쓴다."""
    out: list[str] = []
    i = 0
    escapes = {"n": "\n", "t": "\t", "r": "\r", "0": "\0", "b": "\b"}
    while i < len(raw):
        if raw[i] == "\\" and i + 1 < len(raw):
            out.append(escapes.get(raw[i + 1], raw[i + 1]))
            i += 2
        elif raw[i] == "'" and i + 1 < len(raw) and raw[i + 1] == "'":
            out.append("'")
            i += 2
        else:
            out.append(raw[i])
            i += 1
    return "".join(out)


def quote(text: str) -> str:
    """새로 만든 값(UUID 등)을 리터럴로. 이스케이프가 필요한 값에만 쓴다."""
    return "'" + text.replace("\\", "\\\\").replace("'", "''") + "'"


# ── 생성 ────────────────────────────────────────────────────────────────

def emit(table: str, columns: str, rows: list[str], out: list[str]) -> None:
    for start in range(0, len(rows), BATCH):
        chunk = rows[start : start + BATCH]
        out.append(f"INSERT INTO {table} {columns} VALUES")
        out.append(",\n".join(chunk) + ";")
        out.append("")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("source", type=Path, help="기존 시드 SQL")
    ap.add_argument(
        "-o", "--out", type=Path,
        default=Path("sql/V3/data/data_player_skill_INSERT.sql"),
    )
    args = ap.parse_args()

    sql = args.source.read_text(encoding="utf-8")

    skills = parse_inserts(sql, "skill")
    tiers = parse_inserts(sql, "skill_tier")
    values = parse_inserts(sql, "skill_tier_value")

    if not (skills and tiers and values):
        print(f"파싱 실패 — skill {len(skills)} / tier {len(tiers)} / value {len(values)}", file=sys.stderr)
        return 1

    # 숫자 id → (role, name). 티어·수치 행이 스킬을 찾을 때 쓴다.
    by_num: dict[str, tuple[str, str]] = {}

    skill_rows: list[str] = []
    for r in skills:
        # id, role, name, grade, grade_label, max_tier, sort_order,
        # description_template, value_count, value_groups, source_row
        num, role_raw, name_raw, grade_raw = r[0], unquote(r[1]), unquote(r[2]), unquote(r[3])
        max_tier, sort_order = unquote(r[5]), r[6]
        template, value_count, value_groups, source_row = unquote(r[7]), r[8], unquote(r[9]), r[10]

        role = ROLE_MAP[role_raw]
        grade = GRADE_MAP[grade_raw]
        # UUID 이름은 실제 문자열 기준. 리터럴 표현(\\n 등)이 섞이면 값이 달라진다.
        name = sql_unescape(name_raw)
        by_num[num] = (role, name)

        skill_rows.append(
            f"  ({quote(skill_uid(role, name))}, '{role}', {requote(name_raw)}, '{grade}', "
            f"'{max_tier}', {sort_order}, {requote(template)}, {value_count}, "
            f"{requote(value_groups)}, {source_row})"
        )

    tier_rows: list[str] = []
    for r in tiers:
        num, tier, raw_value, estimated = r[0], unquote(r[1]), unquote(r[2]), r[3]
        role, name = by_num[num]
        tier_rows.append(
            f"  ({quote(tier_uid(role, name, tier))}, {quote(skill_uid(role, name))}, "
            f"'{tier}', {requote(raw_value)}, {estimated})"
        )

    value_rows: list[str] = []
    for r in values:
        num, tier, order, val = r[0], unquote(r[1]), int(r[2]), r[3]
        role, name = by_num[num]
        value_rows.append(
            f"  ({quote(value_uid(role, name, tier, order))}, "
            f"{quote(tier_uid(role, name, tier))}, {order}, {val})"
        )

    out: list[str] = [
        "-- 자동 생성 파일. 직접 고치지 말 것 (scripts/convert_skill_seed.py 가 덮어씀).",
        f"-- source: {args.source.name}",
        "-- UUID v5 — 이름에서 계산되므로 다시 생성해도 같은 id 가 나온다.",
        "",
        "SET NAMES utf8mb4;",
        "USE compyafun;",
        "START TRANSACTION;",
        "",
        "DELETE FROM data_player_skill_tier_value;",
        "DELETE FROM data_player_skill_tier;",
        "DELETE FROM data_player_skill;",
        "",
    ]

    emit(
        "data_player_skill",
        "(id, player_role, skill_name, skill_grade, max_tier, sort_order,\n"
        "  description_template, value_count, value_groups, source_row)",
        skill_rows, out,
    )
    emit("data_player_skill_tier", "(id, skill_id, tier, raw_value, estimated)", tier_rows, out)
    emit("data_player_skill_tier_value", "(id, skill_tier_id, value_order, skill_value)", value_rows, out)

    out.append("COMMIT;")
    out.append("")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text("\n".join(out), encoding="utf-8")

    print(f"스킬 {len(skill_rows)} / 티어 {len(tier_rows)} / 수치 {len(value_rows)}")
    print(f"→ {args.out}")

    # 눈으로 확인할 샘플
    sample_role, sample_name = "PITCHER", "투혼"
    print(f"\n예시: {sample_name}({sample_role}) = {skill_uid(sample_role, sample_name)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
