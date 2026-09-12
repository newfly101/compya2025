# -*- coding: utf-8 -*-
"""노말(투수,타자) 최종본 ↔ 운영 DB 대조.
게임 화면 캡처로 3회 교차 검수한 시트가 정본이다.
구단·연도·이름을 열쇠로 양방향 비교하고, 짝이 맞는 행은 포지션(주·부)도 본다.
DB 덤프는 prod2.tsv (id, 이름, 구단, 연도, 주포지션, 부포지션, 역할)."""
import openpyxl, sys, collections
sys.stdout.reconfigure(encoding='utf-8')

XLSX = "test-docs/노말선수_스탯,구종등급_정리_최종본.xlsx"
DUMP = r"C:/Users/hibee/AppData/Local/Temp/claude/D--NewProjects-com2usbaseball/f0df1c25-df82-4082-875e-993491878b67/scratchpad/prod2.tsv"
TEAM = {'두산':'DOO','롯데':'LOT','빙그레':'BIN','삼미':'SUP','삼성':'SAM','쌍방울':'SSA',
        '청보':'CHU','키움':'KIW','태평양':'PAC','한화':'HAN','해태':'HAE','현대':'HYU','kt':'KT'}

wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
ex = {}
for sheet, role in (("일반_타자", "HITTER"), ("일반_투수", "PITCHER")):
    for r in wb[sheet].iter_rows(min_row=3, values_only=True):
        if not r or not r[0]:
            continue
        pos = [p.strip() for p in str(r[7]).split('/') if p.strip()]
        key = (TEAM.get(str(r[2]).strip(), str(r[2]).strip()), int(float(r[3])), str(r[1]).strip())
        ex[key] = (pos[0], pos[1] if len(pos) > 1 else "", role, r[0])

db = {}
for line in open(DUMP, encoding="utf-8"):
    p = line.rstrip("\n").split("\t")
    if len(p) < 7:
        continue
    db[(p[2], int(p[3]), p[1])] = (p[4], p[5], p[6], p[0])

print(f"엑셀 {len(ex)} / 운영DB {len(db)}")
only_db, only_ex = sorted(set(db) - set(ex)), sorted(set(ex) - set(db))
print(f"DB 에만 {len(only_db)} / 엑셀에만 {len(only_ex)}")

# 같은 구단·연도 안에서 한쪽에만 있는 것끼리 묶으면 이름 오기가 드러난다
g = collections.defaultdict(lambda: ([], []))
for k in only_db: g[(k[0], k[1])][0].append(k[2])
for k in only_ex: g[(k[0], k[1])][1].append(k[2])
paired = lonely = 0
for key in sorted(g):
    d, e = g[key]
    if len(d) == 1 and len(e) == 1:
        paired += 1
        print(f"  이름 {key[0]:4} {key[1]}  {d[0]} → {e[0]}")
    else:
        lonely += max(len(d), len(e))
        print(f"  ⚠️ {key[0]:4} {key[1]}  DB{d}  EX{e}")
print(f"짝지어진 오기 {paired} / 외톨이 묶음 {lonely}")

both = set(db) & set(ex)
mp = [(k, db[k][0], ex[k][0]) for k in both if db[k][0] != ex[k][0]]
sp = [(k, db[k][1], ex[k][1]) for k in both if db[k][1] != ex[k][1]]
rl = [(k, db[k][2], ex[k][2]) for k in both if db[k][2] != ex[k][2]]
print(f"\n주포지션 다름 {len(mp)} / 부포지션 다름 {len(sp)} / 역할 다름 {len(rl)}")
for x in mp: print("   주:", x)
for x in sp[:20]: print("   부:", x)
for x in rl: print("   역:", x)
