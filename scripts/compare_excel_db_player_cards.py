#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
엑셀 정본(타자_스탯_입력_시트_정리_최종본.xlsx) ↔ 선수 카드 전수 대조 — 구단·연도·이름 열쇠.

앞선 대조(compare_excel_db_player_names.py)와 각도가 다르다.
  - 앞: 구단·연도·포지션 으로 묶고 「이름이 다른 자리」를 찾았다.
  - 이번: 구단·연도·이름 으로 묶고 「짝이 아예 없는 행」을 양방향으로 찾는다.
    한쪽에만 있는 행끼리 같은 구단·연도에서 다시 묶어, 어느 것이 오기 한 쌍이고
    어느 것이 진짜 외톨이인지 갈라낸다.

함께 보는 것
  - 포지션 : 엑셀은 겸업을 「1B/3B」처럼 한 칸에 슬래시로 적는다. 앞이 주, 뒤가 부다.
             DB 는 주포지션 한 개만 갖는다. 주포지션 불일치와, DB 가 부포지션을
             주포지션 자리에 갖고 있는 경우를 따로 센다.
  - 역할   : 타자/투수 가 어긋나는 행.
  - 에픽   : 엑셀 에픽 시트 명단이 일반 시트 안에 있는지만 확인한다(적재는 범위 밖).

주의
  - 운영 DB 에 질의하지 않는다 (SQL 실행 금지). DB 쪽은 시드 파일을 사본으로 쓴다.
  - 기본값은 커밋된 시드(git HEAD)다. 작업본 시드는 앞 라운드 이름 수정 18행이 이미
    반영돼 있어 운영 DB 와 다르다. --db 로 바꿔 넣을 수 있다.

쓰는 법
  python scripts/compare_excel_db_player_cards.py --db <INSERT.sql> [--out <dir>]
"""

import argparse
import collections
import os
import re
import sys

import openpyxl

XLSX = os.path.join('test-docs', '타자_스탯_입력_시트_정리_최종본.xlsx')
DB_SEED = os.path.join('sql', 'V3', 'data', 'data_player_card_INSERT.sql')

# 엑셀 구단 표기 -> DB team_code (앞 라운드에서 쓴 것과 같다. 실행할 때마다 다시 검증한다)
TEAM_MAP = {
    'MBC': 'MBC', 'OB': 'OB', 'LG': 'LG', 'KIA': 'KIA', 'NC': 'NC',
    'SK': 'SK', 'SSG': 'SSG', 'kt': 'KT', 'KT': 'KT',
    '두산': 'DOO', '롯데': 'LOT', '삼성': 'SAM', '한화': 'HAN', '해태': 'HAE',
    '현대': 'HYU', '키움': 'KIW', '빙그레': 'BIN', '삼미': 'SUP', '청보': 'CHU',
    '쌍방울': 'SSA', '태평양': 'PAC',
}

ROLE_MAP = {'타자': 'HITTER', '투수': 'PITCHER'}

INSERT_RE = re.compile(
    r"^\s*\('([0-9a-f-]{36})',\s*'(.*?)',\s*'(.*?)',\s*(\d+),\s*'(.*?)',\s*'(.*?)',\s*'(.*?)',\s*(\d+|NULL)\)"
)

SHEETS_NORMAL = (('일반_타자', 'HITTER'), ('일반_투수', 'PITCHER'))
SHEETS_EPIC = (('에픽_타자', 'HITTER'), ('에픽_투수', 'PITCHER'))


class Row(object):
    """한 행 = 카드 한 원형."""

    __slots__ = ('team', 'year', 'name', 'pos_raw', 'pos_main', 'pos_sub', 'role', 'ident')

    def __init__(self, team, year, name, pos_raw, role, ident):
        self.team = team
        self.year = year
        self.name = name
        self.pos_raw = pos_raw
        parts = [p.strip() for p in pos_raw.split('/') if p.strip()]
        self.pos_main = parts[0] if parts else ''
        self.pos_sub = parts[1] if len(parts) > 1 else ''
        self.role = role
        self.ident = ident

    @property
    def key(self):
        return (self.team, self.year, self.name)


def read_sheets(wb, sheets):
    rows = []
    for sheet, role in sheets:
        ws = wb[sheet]
        # 1행 = 그룹 머리글, 2행 = 실제 열 이름, 3행부터 데이터
        for r in ws.iter_rows(min_row=3, values_only=True):
            if r[0] is None:
                continue
            pid, name, team, year, _grade, _ctype, role_kr, pos = r[:8]
            team_kr = str(team).strip()
            if team_kr not in TEAM_MAP:
                raise SystemExit('구단 대응표에 없는 표기: %r (%s)' % (team_kr, sheet))
            role_cell = ROLE_MAP.get(str(role_kr).strip(), role)
            if role_cell != role:
                raise SystemExit('시트 %s 에 %s 행: %s' % (sheet, role_cell, pid))
            rows.append(Row(
                TEAM_MAP[team_kr],
                int(float(year)),            # 1982.0 꼴로 들어 있다
                str(name).strip(),
                str(pos).strip(),
                role,
                str(pid).strip(),
            ))
    return rows


def load_excel(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    normal = read_sheets(wb, SHEETS_NORMAL)
    epic = read_sheets(wb, SHEETS_EPIC)
    wb.close()
    return normal, epic


def load_db(path):
    rows = []
    with open(path, encoding='utf-8') as f:
        for line in f:
            m = INSERT_RE.match(line)
            if not m:
                continue
            uid, name, team, year, role, pos, ctype, _sig = m.groups()
            if ctype != 'NORMAL':
                continue
            rows.append(Row(team, int(year), name, pos, role, uid))
    return rows


def index(rows):
    d = collections.defaultdict(list)
    for r in rows:
        d[r.key].append(r)
    return d


def section(title):
    print('')
    print('=' * 72)
    print(title)
    print('=' * 72)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--db', default=DB_SEED)
    ap.add_argument('--xlsx', default=XLSX)
    ap.add_argument('--out', default=None)
    args = ap.parse_args()

    ex, ex_epic = load_excel(args.xlsx)
    db = load_db(args.db)

    section('0. 규모 · 구단 대응 검증')
    print('엑셀 일반(타자+투수) %d행 / DB 노말 카드 %d행' % (len(ex), len(db)))
    ec = collections.Counter(r.team for r in ex)
    dc = collections.Counter(r.team for r in db)
    bad = sorted(t for t in set(ec) | set(dc) if ec[t] != dc[t])
    if bad:
        for t in bad:
            print('  구단 행 수 불일치 %s: 엑셀 %d / DB %d' % (t, ec[t], dc[t]))
    else:
        print('구단 %d개 전부 행 수 일치 — 대응표 유효' % len(ec))

    ei, di = index(ex), index(db)
    dup_ex = {k: v for k, v in ei.items() if len(v) > 1}
    dup_db = {k: v for k, v in di.items() if len(v) > 1}
    print('구단·연도·이름 중복 — 엑셀 %d건 / DB %d건' % (len(dup_ex), len(dup_db)))
    for k, v in sorted(dup_db.items()):
        print('  [DB 중복] %s %s %s -> %s' % (k[0], k[1], k[2], [r.pos_raw for r in v]))
    for k, v in sorted(dup_ex.items()):
        print('  [엑셀 중복] %s %s %s -> %s' % (k[0], k[1], k[2], [r.pos_raw for r in v]))

    # --- 1. 양방향 미매칭 ------------------------------------------------
    section('1. 구단·연도·이름 양방향 대조')
    keys_both = set(ei) & set(di)
    ex_only = sorted(set(ei) - set(di))
    db_only = sorted(set(di) - set(ei))
    print('양쪽에 다 있는 열쇠: %d' % len(keys_both))
    print('엑셀에만 있는 열쇠: %d' % len(ex_only))
    print('DB 에만 있는 열쇠: %d' % len(db_only))

    # --- 2. 같은 구단·연도 안에서 외톨이끼리 짝짓기 -----------------------
    section('2. 오기 짝짓기 (같은 구단·연도에서 한쪽에만 남은 것끼리)')
    by_ty_ex = collections.defaultdict(list)
    by_ty_db = collections.defaultdict(list)
    for k in ex_only:
        by_ty_ex[(k[0], k[1])].append(k)
    for k in db_only:
        by_ty_db[(k[0], k[1])].append(k)

    pairs = []        # (team, year, db_row, ex_row, 근거)
    ambiguous = []    # (team, year, [db_rows], [ex_rows])
    lone_db = []
    lone_ex = []
    for ty in sorted(set(by_ty_ex) | set(by_ty_db)):
        drows = [r for k in by_ty_db.get(ty, []) for r in di[k]]
        erows = [r for k in by_ty_ex.get(ty, []) for r in ei[k]]
        if not drows:
            lone_ex.extend(erows)
            continue
        if not erows:
            lone_db.extend(drows)
            continue
        if len(drows) == 1 and len(erows) == 1:
            d, e = drows[0], erows[0]
            why = []
            if d.pos_raw == e.pos_raw:
                why.append('포지션 같음')
            elif d.pos_raw == e.pos_main:
                why.append('주포지션 같음')
            elif d.pos_raw in (e.pos_main, e.pos_sub):
                why.append('부포지션 같음')
            else:
                why.append('포지션 %s vs %s' % (d.pos_raw, e.pos_raw))
            if d.role == e.role:
                why.append('역할 같음')
            else:
                why.append('역할 %s vs %s' % (d.role, e.role))
            pairs.append((ty[0], ty[1], d, e, ' · '.join(why)))
            continue
        # 2건 이상 — 포지션이 같은 것끼리 먼저 붙여 본다
        used_e = set()
        rest_d = []
        for d in drows:
            cand = [i for i, e in enumerate(erows)
                    if i not in used_e and e.pos_main == d.pos_raw and e.role == d.role]
            if len(cand) == 1:
                e = erows[cand[0]]
                used_e.add(cand[0])
                pairs.append((ty[0], ty[1], d, e, '포지션·역할로 확정 (묶음 %d:%d)'
                              % (len(drows), len(erows))))
            else:
                rest_d.append(d)
        rest_e = [e for i, e in enumerate(erows) if i not in used_e]
        if rest_d or rest_e:
            ambiguous.append((ty[0], ty[1], rest_d, rest_e))

    print('1:1 로 확정되는 이름 오기: %d 건' % len(pairs))
    print('짝을 못 지은 묶음(양쪽에 2건 이상 남음): %d' % len(ambiguous))
    print('진짜 외톨이 — DB 에만 (그 구단·연도에 엑셀 짝 없음): %d' % len(lone_db))
    print('진짜 외톨이 — 엑셀에만 (그 구단·연도에 DB 짝 없음): %d' % len(lone_ex))

    if pairs:
        print('')
        print('--- 짝지어진 오기 ---')
        namepair = collections.Counter((p[2].name, p[3].name) for p in pairs)
        for (old, new), c in namepair.most_common():
            where = ', '.join('%s %s %s' % (p[0], p[1], p[2].pos_raw)
                              for p in pairs if p[2].name == old and p[3].name == new)
            print('  DB %s -> 엑셀 %s (%d) : %s' % (old, new, c, where))

    for label, rows in (('DB 에만', lone_db), ('엑셀에만', lone_ex)):
        if rows:
            print('')
            print('--- 진짜 외톨이 (%s) ---' % label)
            for r in sorted(rows, key=lambda x: (x.team, x.year, x.name)):
                print('  %s %s %s %s %s %s' % (r.team, r.year, r.name, r.pos_raw, r.role, r.ident))

    if ambiguous:
        print('')
        print('--- 짝을 단정 못한 묶음 ---')
        for t, y, drows, erows in ambiguous:
            print('  %s %s | DB: %s | 엑셀: %s'
                  % (t, y,
                     [(r.name, r.pos_raw) for r in drows],
                     [(r.name, r.pos_raw) for r in erows]))

    # --- 3. 이름이 맞는 행의 포지션·역할 -----------------------------------
    section('3. 이름이 맞는 행 — 포지션 · 역할')
    pos_same = 0
    pos_main_diff = []     # DB 가 엑셀 주포지션과 다르고 부포지션도 아님
    pos_sub_as_main = []   # DB 가 엑셀 부포지션을 갖고 있음
    dual_ok = []           # 겸업인데 DB 가 주포지션을 제대로 가짐
    role_diff = []
    for k in sorted(keys_both):
        erows, drows = list(ei[k]), list(di[k])
        # 같은 구단·연도·이름이 여러 행인 경우(김성한B·김정수C) 주포지션이 같은 것끼리 먼저 붙인다
        rest_d = []
        for d in drows:
            hit = next((e for e in erows if e.pos_main == d.pos_raw), None)
            if hit is None:
                rest_d.append(d)
                continue
            erows.remove(hit)
            pos_same += 1
            if hit.pos_sub:
                dual_ok.append((d, hit))
            if d.role != hit.role:
                role_diff.append((d, hit))
        for d in rest_d:
            e = erows.pop(0) if erows else None
            if e is None:
                pos_main_diff.append((d, d))
                continue
            if d.role != e.role:
                role_diff.append((d, e))
            if e.pos_sub and d.pos_raw == e.pos_sub:
                pos_sub_as_main.append((d, e))
            else:
                pos_main_diff.append((d, e))

    dual_total = sum(1 for r in ex if r.pos_sub)
    print('엑셀 겸업(슬래시) 행: %d' % dual_total)
    print('포지션 일치(DB = 엑셀 주포지션): %d' % pos_same)
    print('  그중 겸업 행: %d — DB 가 주포지션을 제대로 갖고 있다' % len(dual_ok))
    print('DB 가 엑셀 부포지션을 주포지션 자리에 가진 행: %d' % len(pos_sub_as_main))
    print('주포지션 불일치(부포지션도 아님): %d' % len(pos_main_diff))
    print('역할(타자/투수) 불일치: %d' % len(role_diff))
    for d, e in pos_sub_as_main[:40]:
        print('  [부→주] %s %s %s : DB %s / 엑셀 %s' % (d.team, d.year, d.name, d.pos_raw, e.pos_raw))
    for d, e in pos_main_diff[:60]:
        print('  [주불일치] %s %s %s : DB %s / 엑셀 %s' % (d.team, d.year, d.name, d.pos_raw, e.pos_raw))
    for d, e in role_diff[:40]:
        print('  [역할] %s %s %s : DB %s / 엑셀 %s' % (d.team, d.year, d.name, d.role, e.role))

    # 부포지션 분포
    subc = collections.Counter(r.pos_sub for r in ex if r.pos_sub)
    mainc = collections.Counter(r.pos_main for r in ex if r.pos_sub)
    print('')
    print('겸업 주포지션 분포: %s' % dict(mainc.most_common()))
    print('겸업 부포지션 분포: %s' % dict(subc.most_common()))
    print('슬래시 2개 넘는 행: %d'
          % sum(1 for r in ex if r.pos_raw.count('/') > 1))

    # --- 4. 에픽 -----------------------------------------------------------
    section('4. 에픽 시트 (범위 밖 — 사실만)')
    ekeys = collections.Counter(r.key for r in ex_epic)
    print('에픽 타자 %d행 / 에픽 투수 %d행 = %d'
          % (sum(1 for r in ex_epic if r.role == 'HITTER'),
             sum(1 for r in ex_epic if r.role == 'PITCHER'),
             len(ex_epic)))
    not_in_normal = [r for r in ex_epic if r.key not in ei]
    print('에픽 행 중 일반 시트에 같은 구단·연도·이름이 없는 것: %d' % len(not_in_normal))
    for r in not_in_normal[:20]:
        print('  %s %s %s %s' % (r.team, r.year, r.name, r.pos_raw))
    print('DB 카드 종류 분포: %s'
          % dict(collections.Counter('NORMAL' for _ in db)))

    # --- 5. TSV ------------------------------------------------------------
    if args.out:
        os.makedirs(args.out, exist_ok=True)

        def w(fn, header, lines):
            with open(os.path.join(args.out, fn), 'w', encoding='utf-8') as f:
                f.write(header + '\n')
                for ln in lines:
                    f.write(ln + '\n')

        w('pairs_by_name.tsv',
          'team\tyear\tdb_name\tdb_pos\texcel_name\texcel_pos\texcel_id\tdb_uuid\t근거',
          ['%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s'
           % (t, y, d.name, d.pos_raw, e.name, e.pos_raw, e.ident, d.ident, why)
           for t, y, d, e, why in sorted(pairs, key=lambda p: (p[0], p[1]))])
        w('lone_db.tsv', 'team\tyear\tname\tpos\trole\tuuid',
          ['%s\t%s\t%s\t%s\t%s\t%s' % (r.team, r.year, r.name, r.pos_raw, r.role, r.ident)
           for r in sorted(lone_db, key=lambda x: (x.team, x.year, x.name))])
        w('lone_excel.tsv', 'team\tyear\tname\tpos\trole\texcel_id',
          ['%s\t%s\t%s\t%s\t%s\t%s' % (r.team, r.year, r.name, r.pos_raw, r.role, r.ident)
           for r in sorted(lone_ex, key=lambda x: (x.team, x.year, x.name))])
        w('pos_diff.tsv', 'kind\tteam\tyear\tname\tdb_pos\texcel_pos\tuuid',
          ['%s\t%s\t%s\t%s\t%s\t%s\t%s' % (kind, d.team, d.year, d.name, d.pos_raw, e.pos_raw, d.ident)
           for kind, lst in (('부포지션을_주로', pos_sub_as_main), ('주포지션_불일치', pos_main_diff))
           for d, e in lst])
        w('dual_position.tsv', 'team\tyear\tname\tmain\tsub\trole\texcel_id',
          ['%s\t%s\t%s\t%s\t%s\t%s\t%s' % (r.team, r.year, r.name, r.pos_main, r.pos_sub, r.role, r.ident)
           for r in sorted((x for x in ex if x.pos_sub), key=lambda x: (x.team, x.year, x.name))])
        print('')
        print('TSV 저장: %s' % args.out)

    return 0


if __name__ == '__main__':
    sys.exit(main())
