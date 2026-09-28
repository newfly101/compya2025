#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""docs/** 의 8가지 컨벤션 위반을 검사한다. 검사만 — 아무것도 고치지 않는다.
사용법 (저장소 루트에서): python .claude/scripts/docs-check.py [경로...]
  경로를 주면 그 파일만 검사(다른 파일 의존 검사는 항상 전체 기준으로 돈다).
위반은 "파일:줄 | 항목 | 내용" 한 줄씩 stdout, 종료코드는 위반 있으면 1.
"""
import re
import sys
import glob
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
FEATURES_DIR = ROOT / "docs" / "features"
DOMAINS_DIR = ROOT / "web" / "src" / "domains"

SKIP_PREFIXES = ["docs/_legacy", "docs/_deprecated_"]
DEPRECATED_RE = re.compile(
    r"review-code-complete/|consistency-audit/|design-review-v1/|_roadmap/|docs/domain/|"
    r"docs/convention/|global-guide/|00-integration-map|todo-(?:20260927|total|design)|docs/code-review-v2"
)
CAP_BY_BASENAME = {"spec.md": 250, "design.md": 300, "roadmap.md": 250, "README.md": 150}


def rel(p):
    return str(p).replace("\\", "/")


def all_docs():
    files = []
    for f in glob.glob(str(ROOT / "docs" / "**" / "*.md"), recursive=True):
        r = rel(pathlib.Path(f).relative_to(ROOT))
        if any(r.startswith(s) for s in SKIP_PREFIXES):
            continue
        files.append(r)
    files.append("CHANGELOG.md")
    return sorted(files)


def parse_frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---", text, re.S)
    fm = {}
    if m:
        for line in m.group(1).splitlines():
            mm = re.match(r"^(\w+):\s*(.+?)\s*(?:#.*)?$", line)
            if mm:
                fm[mm.group(1)] = mm.group(2).strip()
    return fm


def cap_for(relpath):
    base = pathlib.Path(relpath).name
    if base in CAP_BY_BASENAME:
        return CAP_BY_BASENAME[base]
    if "/overview/" in relpath or "/decisions/" in relpath:
        return 150
    return None


_ESCAPED_PIPE = "\x00PIPE\x00"


def _split_row(line):
    protected = line.replace("\\|", _ESCAPED_PIPE)
    return [c.strip().replace(_ESCAPED_PIPE, "|") for c in protected.strip().strip("|").split("|")]


def table_rows(text, heading_pat):
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


def check_1_frontmatter(files, violations):
    for f in files:
        if f == "CHANGELOG.md":
            continue
        text = (ROOT / f).read_text(encoding="utf-8")
        fm = parse_frontmatter(text)
        if "created" not in fm or "updated" not in fm:
            violations.append(f"{f}:1 | frontmatter | created/updated 누락")
        elif not re.match(r"\d{4}-\d{2}-\d{2}$", fm["created"]) or not re.match(r"\d{4}-\d{2}-\d{2}$", fm["updated"]):
            violations.append(f"{f}:1 | frontmatter | created/updated 날짜 형식 오류")


def check_2_line_cap(files, violations):
    for f in files:
        if f == "CHANGELOG.md":
            continue
        cap = cap_for(f)
        if not cap:
            continue
        n = len((ROOT / f).read_text(encoding="utf-8").splitlines())
        if n > cap:
            violations.append(f"{f}:{n} | 줄상한 | {n}줄 > 상한 {cap}줄")


def check_3_links(files, violations):
    link_re = re.compile(r"\]\(([^)#\s]+)(?:#[^)]*)?\)")
    for f in files:
        path = ROOT / f
        text = path.read_text(encoding="utf-8")
        for i, line in enumerate(text.splitlines(), 1):
            for m in link_re.finditer(line):
                target = m.group(1)
                if re.match(r"^(https?://|mailto:)", target):
                    continue
                resolved = (path.parent / target).resolve()
                if not resolved.exists():
                    violations.append(f"{f}:{i} | 깨진 링크 | {target}")


def check_4_deprecated_refs(files, violations):
    for f in files:
        if "0001-docs-restructure" in f:
            continue
        text = (ROOT / f).read_text(encoding="utf-8")
        for i, line in enumerate(text.splitlines(), 1):
            if DEPRECATED_RE.search(line) and "docs-archive" not in line:  # 보존 태그를 병기한 설명 문장은 정당한 인용
                violations.append(f"{f}:{i} | 폐지경로 인용 | {line.strip()[:80]}")


def check_5_version_sync(violations):
    for fdir in sorted(p for p in FEATURES_DIR.iterdir() if p.is_dir()):
        name = fdir.name
        spec_path = fdir / "spec.md"
        hist_path = fdir / "history.md"
        design_path = fdir / "design.md"
        if not spec_path.exists():
            continue
        spec_fm = parse_frontmatter(spec_path.read_text(encoding="utf-8"))
        spec_version = spec_fm.get("version", "")
        if hist_path.exists():
            htext = hist_path.read_text(encoding="utf-8")
            m = re.search(r"-\s*버전:\s*(.+)", htext)
            if m:
                val = m.group(1).strip()
                if not val.startswith("유지"):
                    vm = re.match(r"(\d+\.\d+\.\d+)", val)
                    hist_version = vm.group(1) if vm else val
                    if hist_version != spec_version:
                        violations.append(
                            f"features/{name}/history.md:1 | 버전 불일치 | "
                            f"spec {spec_version} != history 최상단 {hist_version}"
                        )
        if design_path.exists():
            design_fm = parse_frontmatter(design_path.read_text(encoding="utf-8"))
            sv = design_fm.get("spec_version", "")
            if sv and sv != spec_version:
                violations.append(
                    f"features/{name}/design.md:1 | spec_version 불일치 | design {sv} != spec {spec_version}"
                )


def check_6_req_sync(violations):
    trace_dir = ROOT / "docs" / "overview"
    group_files = list(trace_dir.glob("traceability-*.md"))
    trace_reqs = set()
    for gf in group_files:
        text = gf.read_text(encoding="utf-8")
        trace_reqs |= set(re.findall(r"\| (REQ-[A-Z]+-\d+) \|", text))
    for fdir in sorted(p for p in FEATURES_DIR.iterdir() if p.is_dir()):
        spec_path = fdir / "spec.md"
        if not spec_path.exists():
            continue
        rows = table_rows(spec_path.read_text(encoding="utf-8"), r"## 3\. 규칙")
        spec_reqs = {r.get("ID", "").strip() for r in rows if r.get("ID", "").startswith("REQ-")}
        missing = spec_reqs - trace_reqs
        for rid in sorted(missing):
            violations.append(f"features/{fdir.name}/spec.md:1 | 추적표 누락 | {rid} 가 traceability 그룹 파일에 없음")


def check_7_design_literals(files, violations):
    hex_re = re.compile(r"#[0-9a-fA-F]{3,8}\b")
    px_re = re.compile(r"\b\d+px\b")
    for f in files:
        if pathlib.Path(f).name != "design.md":
            continue
        text = (ROOT / f).read_text(encoding="utf-8")
        in_code = False
        for i, line in enumerate(text.splitlines(), 1):
            if line.strip().startswith("```"):
                in_code = not in_code
                continue
            if in_code:
                continue
            if hex_re.search(line):
                violations.append(f"{f}:{i} | raw hex | {hex_re.search(line).group(0)}")
            if px_re.search(line):
                violations.append(f"{f}:{i} | raw px | {px_re.search(line).group(0)}")


def check_8_domain_folder(violations):
    for fdir in sorted(p for p in FEATURES_DIR.iterdir() if p.is_dir()):
        if not (DOMAINS_DIR / fdir.name).exists():
            violations.append(f"docs/features/{fdir.name}:1 | 도메인 폴더 없음 | web/src/domains/{fdir.name} 없음")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    files = [rel(pathlib.Path(a).resolve().relative_to(ROOT)) for a in args] if args else all_docs()

    violations = []
    check_1_frontmatter(files, violations)
    check_2_line_cap(files, violations)
    check_3_links(files, violations)
    check_4_deprecated_refs(files, violations)
    if not args:
        check_5_version_sync(violations)
        check_6_req_sync(violations)
        check_8_domain_folder(violations)
    check_7_design_literals(files, violations)

    for v in violations:
        print(v)
    print(f"\n검사 파일 {len(files)}개, 위반 {len(violations)}건")
    sys.exit(1 if violations else 0)


if __name__ == "__main__":
    main()
