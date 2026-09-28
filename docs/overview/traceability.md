---
created: 2026-09-28
updated: 2026-09-28
---

# 요구사항 추적표 (RTM)

## 1. 이 표를 읽는 법

- **ID 체계** — 요구사항 `REQ-{약어}-{순번}`(spec § 3 그대로) · 화면 `SC-{도메인순번}-{화면순번}`(`overview/domain.md` § 3) · API 경로는 실제 라우트 문자열 · 테이블은 `overview/domain-erd.md` § 2 기준
- **화면(SC) 열** — 그 REQ가 속한 기능이 쓰는 화면 전체(기능 단위). 한 기능이 화면 여러 개를 쓰면 전부 나열
- **API 열** — REQ 자신의 근거 텍스트에 특정 엔드포인트가 적혀 있으면 그 값, 없으면 그 기능이 쓰는 API 전체 목록(기능 단위 대체). 서버가 없는 기능(odds·guides·policy·error)은 `-`
- **테이블 열** — 기능이 소유한 테이블(`overview/domain-erd.md` § 2). 전용 테이블이 없는 기능(admin·home 대부분·mileage)은 `-`, 이유는 § 5
- **근거·이력 열** — `spec § 3` 상대 링크 1개 + 그 기능 `history.md` 최상단 항목 날짜. 본문(§ 3)은 150줄 상한을 넘어 기능 그룹 4개로 분리했다 — 아래 표에서 이동

## 2. 약어표

| 기능 | 약어 | 도메인 순번 | 상태 | 버전 |
|---|---|---|---|---|
| admin | ADM | 01 | 운영 | 1.0.4 |
| coupons | CP | 02 | 운영 | 1.0.4 |
| events | EVT | 03 | 운영 | 1.0.4 |
| notices | NTC | 04 | 운영 | 1.0.4 |
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
| playerSkills | PSK | 17 | 운영 | 1.0.0 |
| guides | GD | 18 | 운영 | 1.0.2 |

## 3. 추적표 본문

148개 REQ 전부를 담으면 150줄 상한을 넘어 기능 그룹 4개로 나눴다(`file-split.md` § 2 의미 단위 분리).

| 그룹 | 파일 | 기능 | REQ 수 |
|---|---|---|---|
| 콘텐츠·운영 | [traceability-content-ops.md](./traceability-content-ops.md) | admin·coupons·events·notices·quiz·home | 68 |
| 계정·인증 | [traceability-account.md](./traceability-account.md) | authentication·users·community | 23 |
| 게임 데이터 | [traceability-game-data.md](./traceability-game-data.md) | historyLegend·legendStats·mileage·players·playerSkills | 35 |
| 정적·기타 | [traceability-static.md](./traceability-static.md) | odds·guides·policy·error | 22 |

## 4. 집계

| 항목 | 값 |
|---|---|
| REQ 총수 | 148 |
| 코드 확인 비율(근거에 `.java`/`.jsx`/`.xml`/`.sql` 파일·줄 참조가 있는 REQ) | 139/148 (93.9%) |
| API 없는 REQ 수(odds·guides·policy·error, 서버 없는 기능) | 22 |
| 미결(❓·🔴) 수(18개 기능 spec·design 합산) | 39 |

## 5. 빈 자리

- **admin REQ-ADM-01~07(테이블 열)** — admin은 전용 테이블이 없다. 콘텐츠 도메인(쿠폰·이벤트·공지·퀴즈·유저) 테이블을 그대로 관리만 한다(`features/admin/spec.md` § 4)
- **home REQ 10건 중 9건(테이블 열)** — 후원 클릭 1건(REQ-HM-08 → `statistic_support_click`)만 home 소유 테이블이 있고, 나머지는 다른 도메인 데이터를 화면에 모아보기만 해서 소유 테이블이 없다
- **mileage REQ-MLG-01~05(테이블 열)** — 전용 테이블 없음. `data_player_card`/`data_player_legend_material`을 그때그때 조회만 한다(`features/mileage/spec.md` § 4). 단일 테이블로 못 적어 `-` 처리
- **odds(테이블 열 전체)** — `overview/domain-erd.md` § 2는 `statistic_support_click`을 "odds(확인 필요)" 소유로 표기하지만, 실제 근거(`features/home/spec.md` REQ-HM-08, `StatisticsController.java`)는 home 소유다. 원본 표기 오류로 보고 odds 행은 채우지 않았다 — domain-erd.md 수정은 메인 세션 판단 사항
