#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""features/*/spec.md + history.md 로부터 docs/overview/traceability*.md(5개)를 생성한다.
사용법 (저장소 루트에서): python .claude/scripts/build-traceability.py [--check]
  --check: 파일을 쓰지 않고 현재 파일과 다르면 diff 를 출력하고 종료코드 1
표준 라이브러리만 사용. 생성 파일 머리에 "손으로 고치지 말 것" 주석이 들어간다.
"""
import re
import sys
import pathlib
import difflib
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parents[2]
FEATURES_DIR = ROOT / "docs" / "features"
OUT_DIR = ROOT / "docs" / "overview"
TODAY = date.today().isoformat()

GROUPS = [
    ("content-ops", "콘텐츠·운영", ["admin", "coupons", "events", "notices", "quiz", "home"]),
    ("account", "계정·인증", ["authentication", "users", "community"]),
    ("game-data", "게임 데이터", ["historyLegend", "legendStats", "mileage", "players", "playerSkills"]),
    ("static", "정적·기타", ["odds", "guides", "policy", "error"]),
]
ALL_FEATURES = [f for _, _, fs in GROUPS for f in fs]

STATUS_KO = {"active": "운영", "frozen": "동결", "deprecated": "중단"}
# roadmap.md 가 원천인 현황 표시. frontmatter status 는 active 뿐이라 여기서만 보정한다.
STATUS_OVERRIDE = {"mileage": "개발중"}

SC_RE = re.compile(r"SC-(\d{2})-(\d{2})")
API_RE = re.compile(r"\b(GET|POST|PUT|PATCH|DELETE)\s+(/api/\S+?)(?=[`,;)\s]|$)")
GEN_COMMENT = "<!-- 생성 파일: python .claude/scripts/build-traceability.py — 손으로 고치지 말 것 -->"


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


_ESCAPED_PIPE = "\x00PIPE\x00"


def _split_row(line):
    # 마크다운 escaped pipe(`\|`, 셀 안 리터럴 파이프)는 셀 구분자로 세지 않는다
    protected = line.replace("\\|", _ESCAPED_PIPE)
    cells = [c.strip().replace(_ESCAPED_PIPE, "|") for c in protected.strip().strip("|").split("|")]
    return cells


def table_rows(text, heading_pat):
    """heading 바로 다음 첫 markdown 표를 [{header: cell}] 리스트로. 표가 없으면 []"""
    m = re.search(heading_pat + r"\n(?:(?!\|)[^\n]*\n)*((?:\|.*\n?)+)", text)
    if not m:
        return []
    lines = [l for l in m.group(1).splitlines() if l.strip().startswith("|")]
    if len(lines) < 2:
        return []
    header = _split_row(lines[0])
    rows = []
    for l in lines[2:]:
        cells = _split_row(l)
        if len(cells) != len(header):
            continue
        rows.append(dict(zip(header, cells)))
    return rows


def domain_path_map():
    """overview/domain.md §3 화면 목록에서 {주소 셀 문자열: SC코드} — 화면(SC) 열에
    SC 코드가 안 적힌 spec(§2)의 화면을 경로로 역추적할 때 쓴다 (예: admin)."""
    text = read(OUT_DIR / "domain.md")
    rows = table_rows(text, r"## 3\. 화면 목록")
    m = {}
    for r in rows:
        code = r.get("화면번호", "").strip()
        path = r.get("경로", "").strip()
        if code and path:
            m[path] = code
    return m


_DOMAIN_PATH_MAP = None


def feature_screens(spec_text):
    """§2 화면 열에서 SC 코드 전부 추출. (오름차순 문자열, 원래 표 첫 행의 도메인번호)
    화면 열에 SC 코드가 없으면(예: admin) 주소 열을 domain.md §3 경로와 대조해 채운다."""
    global _DOMAIN_PATH_MAP
    rows = table_rows(spec_text, r"## 2\. 화면과 진입 경로")
    codes_in_order = []
    for r in rows:
        found = SC_RE.findall(r.get("화면", ""))
        if not found:
            if _DOMAIN_PATH_MAP is None:
                _DOMAIN_PATH_MAP = domain_path_map()
            code = _DOMAIN_PATH_MAP.get(r.get("주소", "").strip())
            if code:
                found = [tuple(code.replace("SC-", "").split("-"))]
        codes_in_order += found
    if not codes_in_order:
        return "-", None
    own_domain = codes_in_order[0][0]
    uniq_sorted = sorted(set(codes_in_order), key=lambda c: (int(c[0]), int(c[1])))
    sc_str = ", ".join(f"SC-{a}-{b}" for a, b in uniq_sorted)
    return sc_str, own_domain


def feature_reqs(spec_text):
    """§3 규칙 표에서 [(REQ-ID, 항목요지)]"""
    rows = table_rows(spec_text, r"## 3\. 규칙")
    out = []
    for r in rows:
        rid = r.get("ID", "").strip()
        item = r.get("항목", "").strip()
        if rid.startswith("REQ-"):
            out.append((rid, item))
    return out


def feature_data(spec_text):
    """§4 데이터 표에서 (api 목록, table 목록) — 기능 전체 합산, 최초 등장 순서 유지"""
    rows = table_rows(spec_text, r"## 4\. 데이터")
    apis, tables = [], []
    for r in rows:
        cell = r.get("테이블 · API", "")
        for verb, path in API_RE.findall(cell):
            item = f"{verb} {path}"
            if item not in apis:
                apis.append(item)
        for tok in re.findall(r"`([^`]+)`", cell):
            if re.match(r"^(site_|data_|fun_)\w*$", tok) and tok not in tables:
                tables.append(tok)
    return apis, tables


def history_top(text):
    m = re.search(r"^## (\d{4}-\d{2}-\d{2})", text, re.M)
    d = m.group(1) if m else "-"
    v = re.search(r"-\s*버전:\s*(.+)", text)
    ver = v.group(1).strip() if v else "-"
    return d, ver


def load_feature(name):
    spec = read(FEATURES_DIR / name / "spec.md")
    hist = read(FEATURES_DIR / name / "history.md")
    fm = parse_frontmatter(spec)
    sc_str, own_domain = feature_screens(spec)
    reqs = feature_reqs(spec)
    apis, tables = feature_data(spec)
    hist_date, _ = history_top(hist)
    return {
        "name": name,
        "fm": fm,
        "sc": sc_str,
        "own_domain": own_domain,
        "reqs": reqs,
        "api": "; ".join(apis) if apis else "-",
        "api_list": apis,
        "table": ", ".join(tables) if tables else "-",
        "hist_date": hist_date,
    }


def build_group_file(group_id, group_title, feats):
    lines = [
        "---",
        f"created: {TODAY}",
        f"updated: {TODAY}",
        "---",
        "",
        GEN_COMMENT,
        "",
        f"# 요구사항 추적표 — {group_title}",
        "",
        "> [overview/traceability.md](./traceability.md) 에서 분리(150줄 상한). "
        "§ 1 읽는 법·§ 2 약어표·§ 4 집계·§ 5 빈 자리는 그 문서에 있다.",
        "",
        "| REQ | 기능 | 규칙 요지 | 화면(SC) | API | 테이블 | 근거·이력 |",
        "|---|---|---|---|---|---|---|",
    ]
    for f in feats:
        for rid, item in f["reqs"]:
            lines.append(
                f"| {rid} | {f['name']} | {item} | {f['sc']} | {f['api']} | {f['table']} | "
                f"[spec §3](../features/{f['name']}/spec.md) · {f['hist_date']} |"
            )
    return "\n".join(lines) + "\n"


def build_main_file(feats_by_name, order):
    # § 2 약어표
    abbr_lines = ["| 기능 | 약어 | 도메인 순번 | 상태 | 버전 |", "|---|---|---|---|---|"]
    for i, name in enumerate(order, start=1):
        f = feats_by_name[name]
        abbr = f["reqs"][0][0].split("-")[1] if f["reqs"] else "-"
        status = STATUS_OVERRIDE.get(name, STATUS_KO.get(f["fm"].get("status"), "-"))
        version = f["fm"].get("version", "-")
        abbr_lines.append(f"| {name} | {abbr} | {i:02d} | {status} | {version} |")

    # § 3 그룹 표
    group_lines = ["| 그룹 | 파일 | 기능 | REQ 수 |", "|---|---|---|---|"]
    total_req = 0
    api_empty = 0
    for group_id, group_title, names in GROUPS:
        feats = [feats_by_name[n] for n in names]
        req_count = sum(len(f["reqs"]) for f in feats)
        total_req += req_count
        for f in feats:
            if not f["api_list"]:
                api_empty += len(f["reqs"])
        fname = f"traceability-{group_id}.md"
        group_lines.append(
            f"| {group_title} | [{fname}](./{fname}) | {'·'.join(names)} | {req_count} |"
        )

    # § 4 집계 — 코드 확인 비율(근거 열에 파일 확장자 참조가 있는 REQ)
    code_ref_re = re.compile(r"\.(java|jsx|xml|sql)\b")
    verified = 0
    for name in order:
        spec = read(FEATURES_DIR / name / "spec.md")
        rows = table_rows(spec, r"## 3\. 규칙")
        for r in rows:
            if code_ref_re.search(r.get("근거", "")):
                verified += 1
    pct = round(100 * verified / total_req, 1) if total_req else 0.0

    unresolved = 0
    for name in order:
        spec = read(FEATURES_DIR / name / "spec.md")
        unresolved += spec.count("❓") + spec.count("🔴")
        design_path = FEATURES_DIR / name / "design.md"
        if design_path.exists():
            d = read(design_path)
            unresolved += d.count("❓") + d.count("🔴")

    # § 5 빈 자리 — 테이블 열이 '-' 인 기능을 기계적으로 나열
    empty_lines = []
    for name in order:
        f = feats_by_name[name]
        if f["table"] == "-" and f["reqs"]:
            ids = [rid for rid, _ in f["reqs"]]
            empty_lines.append(f"- **{name}**({ids[0]}~{ids[-1]}, 테이블 열) — 전용 테이블 없음 (`features/{name}/spec.md` § 4)")
    if not empty_lines:
        empty_lines = ["- 없음"]

    lines = [
        "---",
        f"created: {TODAY}",
        f"updated: {TODAY}",
        "---",
        "",
        GEN_COMMENT,
        "",
        "# 요구사항 추적표 (RTM)",
        "",
        "## 1. 이 표를 읽는 법",
        "",
        "- **ID 체계** — 요구사항 `REQ-{약어}-{순번}`(spec § 3 그대로) · 화면 `SC-{도메인순번}-{화면순번}`(`overview/domain.md` § 3) · "
        "API 경로는 실제 라우트 문자열 · 테이블은 `overview/domain-erd.md` § 2 기준",
        "- **화면(SC) 열** — 그 REQ가 속한 기능이 쓰는 화면 전체(기능 단위). 한 기능이 화면 여러 개를 쓰면 전부 나열",
        "- **API 열** — 그 기능이 쓰는 API 전체 목록(기능 단위). 서버가 없는 기능(odds·guides·policy·error)은 `-`",
        "- **테이블 열** — 기능이 소유한 테이블(`overview/domain-erd.md` § 2). 전용 테이블이 없는 기능은 `-`, 이유는 § 5",
        "- **근거·이력 열** — `spec § 3` 상대 링크 1개 + 그 기능 `history.md` 최상단 항목 날짜. "
        "본문(§ 3)은 150줄 상한을 넘어 기능 그룹 4개로 분리했다 — 아래 표에서 이동",
        "",
        "## 2. 약어표",
        "",
        *abbr_lines,
        "",
        "## 3. 추적표 본문",
        "",
        f"{total_req}개 REQ 전부를 담으면 150줄 상한을 넘어 기능 그룹 4개로 나눴다(`file-split.md` § 2 의미 단위 분리).",
        "",
        *group_lines,
        "",
        "## 4. 집계",
        "",
        "| 항목 | 값 |",
        "|---|---|",
        f"| REQ 총수 | {total_req} |",
        f"| 코드 확인 비율(근거에 `.java`/`.jsx`/`.xml`/`.sql` 파일·줄 참조가 있는 REQ) | {verified}/{total_req} ({pct}%) |",
        f"| API 없는 REQ 수(서버 없는 기능) | {api_empty} |",
        f"| 미결(❓·🔴) 수(18개 기능 spec·design 합산) | {unresolved} |",
        "",
        "## 5. 빈 자리",
        "",
        *empty_lines,
        "",
    ]
    return "\n".join(lines)


def main():
    check = "--check" in sys.argv
    feats_by_name = {name: load_feature(name) for name in ALL_FEATURES}
    # README/약어표 순서: (created 오름차순, 이름 오름차순)
    order = sorted(ALL_FEATURES, key=lambda n: (feats_by_name[n]["fm"].get("created", ""), n))

    outputs = {"traceability.md": build_main_file(feats_by_name, order)}
    for group_id, group_title, names in GROUPS:
        feats = [feats_by_name[n] for n in names]
        outputs[f"traceability-{group_id}.md"] = build_group_file(group_id, group_title, feats)

    changed = False
    for fname, content in outputs.items():
        path = OUT_DIR / fname
        old = read(path) if path.exists() else ""
        if old != content:
            changed = True
            if check:
                diff = difflib.unified_diff(
                    old.splitlines(keepends=True), content.splitlines(keepends=True),
                    fromfile=str(path), tofile=f"{fname} (생성)"
                )
                sys.stdout.writelines(diff)
            else:
                path.write_text(content, encoding="utf-8")
                print(f"썼음: {path}")
    if check and changed:
        sys.exit(1)
    if not changed:
        print("변경 없음 (이미 최신)")


if __name__ == "__main__":
    main()
