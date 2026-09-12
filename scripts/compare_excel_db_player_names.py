#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
엑셀 정본(타자_스탯_입력_시트_정리_최종본.xlsx) ↔ DB 선수 카드 이름 대조.

무엇을 하는가
  1. 엑셀 「일반_타자」·「일반_투수」 두 시트를 읽어 한 행 = 카드 한 원형으로 만든다.
  2. DB 쪽은 data_player_card 시드(INSERT 문)를 파싱해 같은 모양으로 만든다.
     주의 - 운영 DB 에 직접 붙지 않는다 (SQL 실행 금지). 시드가 DB 의 사본이다.
  3. 구단·연도·포지션 을 열쇠로 두 쪽을 묶고, 묶음 안에서 이름 목록을 맞춰 본다.
     이름까지 같으면 짝지음, 한쪽에만 남으면 "이름이 다른 자리" 후보다.
  4. 같은 묶음에서 한쪽에 1명·다른쪽에 1명만 남으면 그게 곧 이름 교체 한 건이다.
     2명 이상 남으면 어느 쪽이 어느 쪽인지 단정할 수 없으므로 따로 표시한다.

구단 표기
  엑셀은 한글 구단명(두산·롯데…)과 영문(LG·KIA…)을 섞어 쓰고, DB 는 세 글자 코드를
  쓴다. 아래 TEAM_MAP 이 그 대응표이며, 구단별 행 수가 양쪽에서 정확히 일치하는 것으로
  검증했다(스크립트 실행 시 매번 다시 검증한다).

쓰는 법
  python scripts/compare_excel_db_player_names.py [--db <INSERT.sql 경로>] [--out <dir>]
"""

import argparse
import collections
import os
import re
import sys

import openpyxl

XLSX = os.path.join('test-docs', '타자_스탯_입력_시트_정리_최종본.xlsx')
DB_SEED = os.path.join('sql', 'V3', 'data', 'data_player_card_INSERT.sql')

# 엑셀 구단 표기 -> DB team_code
TEAM_MAP = {
    'MBC': 'MBC', 'OB': 'OB', 'LG': 'LG', 'KIA': 'KIA', 'NC': 'NC',
    'SK': 'SK', 'SSG': 'SSG', 'kt': 'KT', 'KT': 'KT',
    '두산': 'DOO', '롯데': 'LOT', '삼성': 'SAM', '한화': 'HAN', '해태': 'HAE',
    '현대': 'HYU', '키움': 'KIW', '빙그레': 'BIN', '삼미': 'SUP', '청보': 'CHU',
    '쌍방울': 'SSA', '태평양': 'PAC',
}

INSERT_RE = re.compile(
    r"^\s*\('([0-9a-f-]{36})',\s*'(.*?)',\s*'(.*?)',\s*(\d+),\s*'(.*?)',\s*'(.*?)',\s*'(.*?)',\s*(\d+|NULL)\)"
)


def load_excel():
    """엑셀 정본 행 목록. 반환 (team, year, pos, role, name, excel_id)"""
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    rows = []
    for sheet, role in (('일반_타자', 'HITTER'), ('일반_투수', 'PITCHER')):
        ws = wb[sheet]
        # 1행 = 그룹 머리글, 2행 = 실제 열 이름, 3행부터 데이터
        for r in ws.iter_rows(min_row=3, values_only=True):
            if r[0] is None:
                continue
            pid, name, team, year, _grade, _ctype, _hp, pos = r[:8]
            rows.append((
                TEAM_MAP[str(team).strip()],
                int(float(year)),            # 1982.0 처럼 실수로 들어있다
                str(pos).strip(),
                role,
                str(name).strip(),
                str(pid).strip(),
            ))
    wb.close()
    return rows


def load_db(path):
    """시드 INSERT 문 -> (team, year, pos, role, name, uuid)"""
    rows = []
    with open(path, encoding='utf-8') as f:
        for line in f:
            m = INSERT_RE.match(line)
            if not m:
                continue
            uid, name, team, year, role, pos, ctype, _sig = m.groups()
            if ctype != 'NORMAL':
                continue
            rows.append((team, int(year), pos, role, name, uid))
    return rows


def bucket(rows):
    d = collections.defaultdict(list)
    for team, year, pos, role, name, ident in rows:
        d[(team, year, pos)].append((name, role, ident))
    return d


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--db', default=DB_SEED)
    ap.add_argument('--out', default=None)
    args = ap.parse_args()

    ex = load_excel()
    db = load_db(args.db)
    print('엑셀 행 %d / DB 행 %d' % (len(ex), len(db)))

    # --- 구단 대응 검증 -------------------------------------------------
    ec = collections.Counter(r[0] for r in ex)
    dc = collections.Counter(r[0] for r in db)
    bad = [t for t in set(ec) | set(dc) if ec[t] != dc[t]]
    print('구단별 행 수 불일치: %s' % (bad or '없음'))

    eb, dbk = bucket(ex), bucket(db)

    matched = 0
    ex_only = collections.defaultdict(list)   # key -> [(name, id)]
    db_only = collections.defaultdict(list)
    keys_ex_missing, keys_db_missing = [], []

    for key in set(eb) | set(dbk):
        e = eb.get(key)
        d = dbk.get(key)
        if e is None:
            keys_db_missing.append(key)
            db_only[key] = [(n, i) for n, _r, i in d]
            continue
        if d is None:
            keys_ex_missing.append(key)
            ex_only[key] = [(n, i) for n, _r, i in e]
            continue
        en = collections.Counter(n for n, _r, _i in e)
        dn = collections.Counter(n for n, _r, _i in d)
        common = en & dn
        matched += sum(common.values())
        for n, c in (en - dn).items():
            for _ in range(c):
                ex_only[key].append((n, next(i for nn, _r, i in e if nn == n)))
        for n, c in (dn - en).items():
            for _ in range(c):
                db_only[key].append((n, next(i for nn, _r, i in d if nn == n)))

    n_ex_only = sum(len(v) for v in ex_only.values())
    n_db_only = sum(len(v) for v in db_only.values())
    print('이름까지 같은 짝: %d' % matched)
    print('엑셀에만 남은 행: %d / DB 에만 남은 행: %d' % (n_ex_only, n_db_only))
    print('엑셀에 없는 구단·연도·포지션 묶음: %d / DB 에 없는 묶음: %d'
          % (len(keys_db_missing), len(keys_ex_missing)))

    # --- 1:1 로 확정되는 이름 교체 --------------------------------------
    pairs = []          # (team, year, pos, db_name, excel_name, excel_id, db_uuid)
    ambiguous = []      # 묶음 안에 2건 이상 남은 것
    for key in sorted(set(ex_only) | set(db_only)):
        e = sorted(ex_only.get(key, []))
        d = sorted(db_only.get(key, []))
        if len(e) == 1 and len(d) == 1:
            pairs.append((key[0], key[1], key[2], d[0][0], e[0][0], e[0][1], d[0][1]))
        else:
            ambiguous.append((key, d, e))

    print('1:1 로 확정되는 이름 교체: %d 건' % len(pairs))
    print('애매한 묶음(2건 이상 남음): %d' % len(ambiguous))

    namepairs = collections.Counter((p[3], p[4]) for p in pairs)
    print('고유 이름쌍: %d' % len(namepairs))
    for (old, new), c in namepairs.most_common():
        print('   %s -> %s  (%d)' % (old, new, c))

    if ambiguous:
        print('')
        print('--- 애매한 묶음 ---')
        for key, d, e in ambiguous[:80]:
            print('  %s %s %s | DB: %s | 엑셀: %s'
                  % (key[0], key[1], key[2], [x[0] for x in d], [x[0] for x in e]))

    # 한 이름이 여러 짝에 걸리는지
    old_multi = collections.defaultdict(set)
    new_multi = collections.defaultdict(set)
    for old, new in namepairs:
        old_multi[old].add(new)
        new_multi[new].add(old)
    for m, label in ((old_multi, 'DB 이름 하나가 엑셀 여러 이름에'),
                     (new_multi, '엑셀 이름 하나가 DB 여러 이름에')):
        multi = dict((k, v) for k, v in m.items() if len(v) > 1)
        if multi:
            print('')
            print('[주의] %s: %s' % (label, multi))

    if args.out:
        os.makedirs(args.out, exist_ok=True)
        with open(os.path.join(args.out, 'name_pairs.tsv'), 'w', encoding='utf-8') as f:
            f.write('team\tyear\tpos\tdb_name\texcel_name\texcel_id\tdb_uuid\n')
            for p in sorted(pairs):
                f.write('\t'.join(str(x) for x in p) + '\n')
        with open(os.path.join(args.out, 'ambiguous.tsv'), 'w', encoding='utf-8') as f:
            f.write('team\tyear\tpos\tdb_names\texcel_names\n')
            for key, d, e in ambiguous:
                f.write('%s\t%s\t%s\t%s\t%s\n'
                        % (key[0], key[1], key[2],
                           ','.join(x[0] for x in d), ','.join(x[0] for x in e)))
        print('')
        print('TSV 저장: %s' % args.out)


if __name__ == '__main__':
    sys.exit(main())
