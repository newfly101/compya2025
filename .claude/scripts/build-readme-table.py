#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""features/*/spec.md frontmatter 로 docs/README.md § 3 기능표(18행)를 다시 만든다.
사용법 (저장소 루트에서): python .claude/scripts/build-readme-table.py [--check]
표 앞뒤 <!-- readme-table:start/end --> 마커 사이만 교체한다. 마커가 없으면 기존 표를 찾아 마커를 감싼다.
설명 열은 현재 표의 값을 그대로 유지한다(스크립트가 새로 쓰지 않음). 루트 README.md 는 건드리지 않는다.
"""
import re
import sys
import pathlib
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parents[2]
README = ROOT / "docs" / "README.md"
FEATURES_DIR = ROOT / "docs" / "features"
TODAY = date.today().isoformat()

FEATURES = [
    "admin", "coupons", "events", "notices", "community", "quiz", "home",
    "authentication", "users", "odds", "players", "error", "policy",
    "historyLegend", "legendStats", "mileage", "playerSkills", "guides",
    "legendCollections",
]
STATUS_KO = {"active": "운영", "frozen": "동결", "deprecated": "중단"}
STATUS_OVERRIDE = {"mileage": "개발중"}  # roadmap.md 현재값 — frontmatter status 는 active

START = "<!-- readme-table:start -->"
END = "<!-- readme-table:end -->"


def read(p):
    return pathlib.Path(p).read_text(encoding="utf-8")


def parse_frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---", text, re.S)
    fm = {}
    if m:
        for line in m.group(1).splitlines():
            mm = re.match(r"^(\w+):\s*(.+?)\s*(?:#.*)?$", line)
            if mm:
                fm[mm.group(1)] = mm.group(2).strip()
    return fm


def current_descriptions(readme_text):
    """현재 § 3 표에서 {기능: 설명} 을 뽑아 유지한다. 행이 없으면 spec.md 로 못 채우니 '-'."""
    out = {}
    for line in readme_text.splitlines():
        m = re.match(r"^\|\s*(\w+)\s*\|\s*(.+?)\s*\|", line)
        if m and m.group(1) in FEATURES:
            out[m.group(1)] = m.group(2)
    return out


def build_table(readme_text):
    desc = current_descriptions(readme_text)
    order = sorted(FEATURES, key=lambda n: (parse_frontmatter(read(FEATURES_DIR / n / "spec.md")).get("created", ""), n))
    lines = ["| 기능 | 설명 | 상태 | 시작일 | 버전 | 문서 |", "|---|---|---|---|---|---|"]
    for name in order:
        fm = parse_frontmatter(read(FEATURES_DIR / name / "spec.md"))
        status = STATUS_OVERRIDE.get(name, STATUS_KO.get(fm.get("status"), "-"))
        created = fm.get("created", "-")
        version = fm.get("version", "-")
        d = desc.get(name, "-")
        docs_link = (
            f"[spec](features/{name}/spec.md) · [design](features/{name}/design.md) · "
            f"[history](features/{name}/history.md)"
        )
        lines.append(f"| {name} | {d} | {status} | {created} | {version} | {docs_link} |")
    return "\n".join(lines)


def splice(readme_text, new_table):
    if START in readme_text and END in readme_text:
        pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
        return pattern.sub(f"{START}\n{new_table}\n{END}", readme_text)
    # 마커가 없으면 기존 "| 기능 | 설명 | ..." 표를 찾아 마커로 감싼다 (최초 1회)
    m = re.search(r"(\| 기능 \| 설명 \|.*?\n)((?:\|.*\n)+)", readme_text)
    if not m:
        raise SystemExit("README.md 에서 § 3 기능표를 찾지 못했다 — 헤더가 바뀌었는지 확인")
    return readme_text[: m.start()] + f"{START}\n{new_table}\n{END}\n" + readme_text[m.end():]


def main():
    check = "--check" in sys.argv
    old = read(README)
    new_table = build_table(old)
    new_text = splice(old, new_table)
    if new_text == old:
        print("변경 없음 (이미 최신)")
        return
    if check:
        print("README.md § 3 표가 최신 spec 과 다르다 (diff 는 --check 없이 실행해 확인)")
        sys.exit(1)
    README.write_text(new_text, encoding="utf-8")
    print(f"썼음: {README}")


if __name__ == "__main__":
    main()
