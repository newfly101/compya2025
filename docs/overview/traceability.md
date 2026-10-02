---
created: 2026-10-02
updated: 2026-10-02
---

<!-- 생성 파일: python .claude/scripts/build-traceability.py — 손으로 고치지 말 것 -->

# 요구사항 추적표 (RTM)

## 1. 이 표를 읽는 법

- **ID 체계** — 요구사항 `REQ-{약어}-{순번}`(spec § 3 그대로) · 화면 `SC-{도메인순번}-{화면순번}`(`overview/domain.md` § 3) · API 경로는 실제 라우트 문자열 · 테이블은 `overview/domain-erd.md` § 2 기준
- **화면(SC) 열** — 그 REQ가 속한 기능이 쓰는 화면 전체(기능 단위). 한 기능이 화면 여러 개를 쓰면 전부 나열
- **API 열** — 그 기능이 쓰는 API 전체 목록(기능 단위). 서버가 없는 기능(odds·guides·policy·error)은 `-`
- **테이블 열** — 기능이 소유한 테이블(`overview/domain-erd.md` § 2). 전용 테이블이 없는 기능은 `-`, 이유는 § 5
- **근거·이력 열** — `spec § 3` 상대 링크 1개 + 그 기능 `history.md` 최상단 항목 날짜. 본문(§ 3)은 150줄 상한을 넘어 기능 그룹 4개로 분리했다 — 아래 표에서 이동

## 2. 약어표

| 기능 | 약어 | 도메인 순번 | 상태 | 버전 |
|---|---|---|---|---|
| admin | ADM | 01 | 운영 | 1.6.0 |
| coupons | CP | 02 | 운영 | 1.1.0 |
| events | EVT | 03 | 운영 | 2.0.0 |
| notices | NTC | 04 | 운영 | 1.0.5 |
| community | CMT | 05 | 동결 | 1.0.1 |
| quiz | QZ | 06 | 운영 | 1.0.3 |
| home | HM | 07 | 운영 | 1.0.4 |
| authentication | AUTH | 08 | 운영 | 1.0.8 |
| users | USR | 09 | 운영 | 1.0.1 |
| odds | ODD | 10 | 운영 | 1.0.1 |
| players | PLR | 11 | 운영 | 1.0.1 |
| error | ERR | 12 | 운영 | 1.0.1 |
| policy | PLC | 13 | 운영 | 1.0.0 |
| historyLegend | HL | 14 | 운영 | 1.0.3 |
| legendStats | LS | 15 | 운영 | 1.0.1 |
| mileage | MLG | 16 | 개발중 | 1.0.1 |
| playerSkills | PSK | 17 | 운영 | 1.0.1 |
| guides | GD | 18 | 운영 | 1.0.2 |
| legendCollections | LCOL | 19 | 운영 | 1.0.5 |
| legendCollectionSkills | LCSK | 20 | 운영 | 1.0.0 |

## 3. 추적표 본문

214개 REQ 전부를 담으면 150줄 상한을 넘어 기능 그룹 4개로 나눴다(`file-split.md` § 2 의미 단위 분리).

| 그룹 | 파일 | 기능 | REQ 수 |
|---|---|---|---|
| 콘텐츠·운영 | [traceability-content-ops.md](./traceability-content-ops.md) | admin·coupons·events·notices·quiz·home | 91 |
| 계정·인증 | [traceability-account.md](./traceability-account.md) | authentication·users·community | 24 |
| 게임 데이터 | [traceability-game-data.md](./traceability-game-data.md) | historyLegend·legendStats·legendCollections·legendCollectionSkills·mileage·players·playerSkills | 77 |
| 정적·기타 | [traceability-static.md](./traceability-static.md) | odds·guides·policy·error | 22 |

## 4. 집계

| 항목 | 값 |
|---|---|
| REQ 총수 | 214 |
| 코드 확인 비율(근거에 `.java`/`.jsx`/`.xml`/`.sql` 파일·줄 참조가 있는 REQ) | 118/214 (55.1%) |
| API 없는 REQ 수(서버 없는 기능) | 22 |
| 미결(❓·🔴) 수(18개 기능 spec·design 합산) | 31 |

## 5. 빈 자리

- **community**(REQ-CMT-01~REQ-CMT-04, 테이블 열) — 전용 테이블 없음 (`features/community/spec.md` § 4)
- **home**(REQ-HM-01~REQ-HM-10, 테이블 열) — 전용 테이블 없음 (`features/home/spec.md` § 4)
- **odds**(REQ-ODD-01~REQ-ODD-05, 테이블 열) — 전용 테이블 없음 (`features/odds/spec.md` § 4)
- **error**(REQ-ERR-01~REQ-ERR-06, 테이블 열) — 전용 테이블 없음 (`features/error/spec.md` § 4)
- **policy**(REQ-PLC-01~REQ-PLC-05, 테이블 열) — 전용 테이블 없음 (`features/policy/spec.md` § 4)
- **mileage**(REQ-MLG-01~REQ-MLG-11, 테이블 열) — 전용 테이블 없음 (`features/mileage/spec.md` § 4)
- **guides**(REQ-GD-01~REQ-GD-06, 테이블 열) — 전용 테이블 없음 (`features/guides/spec.md` § 4)
