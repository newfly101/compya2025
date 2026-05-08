# 도메인: historyMode

## A.1 현재 상태

- **분류**: **mock-only** (BE 미연동, 100% 정적 import)
- **모바일 전환 진척도**: 모바일 전용 (`mobile/` 만 존재). 메모상 리뉴얼 완료. 토큰 scss 분리됨 (`fe-map.md` 행 45)
- 폴더 구조:
  ```
  domains/historyMode/
  └── mobile/
      ├── HistoryModeScreen.jsx
      ├── components/{chip, stageCard}/
      └── hooks/useHistoryMode.js
  ```
- store/Redux 사용 없음 (`fe/state-and-data.md:25` — historyMode 슬라이스 자체가 store 에 없음)

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| HistoryModePage → HistoryModeScreen | `/mode/history` | `web/src/domains/historyMode/mobile/HistoryModeScreen.jsx` | 모바일 단일 | mock-only. filterSection (Chip×N), summary, StageCard×N, detail |

> 참고: `PublicRoutes.jsx` 내 주석된 구 `mode/history` 라우트는 `LegendCalendar` (lazy import 자체가 주석, 파일 미존재 추정) — 현재 활성 라우트는 모바일 `HistoryModeScreen`. (`fe/routes-and-screens.md:68`)

## A.3 API 엔드포인트

### BE 노출

해당 도메인의 BE 엔드포인트 **없음**.

### FE 호출

- 호출 없음. mock 만 사용.

| 사용 mock | 위치 |
|---|---|
| `LegendMeta.js` | `web/src/data/historyMode/LegendMeta.js` ↔ `useHistoryMode.js:4` |
| `LegendStuff.js` | `web/src/data/historyMode/LegendStuff.js` ↔ `useHistoryMode.js:3` |

### 매칭 결과

- 매칭됨: 0건 (BE 없음 — mock 단독)
- FE 만 호출: 0
- BE 만 노출: 0

## A.4 DB 테이블 + Mapper

해당 도메인의 DB 테이블 **없음**. mock 단독.

## A.5 권한 / 가드

- 라우트 `/mode/history` permitAll (라우터 단 가드 없음)

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| mock-only 화면 — figma-spec-validator 가 BE schema 와 정합성 검증할 base 없음 (`risk-and-priority.md #10`) | `fe/state-and-data.md:100` | ⚠ figma-spec-validator 단계에서 mock 으로 운영 OK 결론. 향후 dictionary BE 와 연결 결정 시 별도 라운드 |
| 메모상 리뉴얼 완료 — 모바일 4 상태 단일 화면 구조, 데이터 모델·도메인 로컬 토큰 정리 (사용자 메모 `project_history_mode_mobile`) | 사용자 메모 | 안정 (우선순위 낮음) |

## A.7 dead 항목 (이 도메인 안)

- `web/src/data/HistoryMode.js` (대문자 H, 단수) — import 0건 dead. 실제 사용 데이터는 `data/historyMode/` (소문자, 폴더) — `fe/dead-suspects.md A`

## A.8 ★ Owner 결정 필요 (도메인 한정)

- 향후 BE 연동 필요성 (현재 보류 OK, mock 운영 안정)

---

## B.1 기능 요구사항 (미작성 — Owner 채움)

> 이 섹션은 도메인별 상세 기획 시 채울 영역. A 섹션을 사실 baseline 으로 사용.

- [ ] 기능 1: ...
  - 사용자 시나리오:
  - acceptance criteria:
  - 의존 API/테이블:
- [ ] 기능 2: ...

## B.2 신규 기능 (미작성)

- [ ] ...

## B.3 우선순위 (미작성)

- P0 / P1 / P2

## B.4 KPI / 성공지표 (미작성)

## B.5 디자인 / Figma 참조 (미작성)

- figma-spec-validator 단계에서 채워질 영역
