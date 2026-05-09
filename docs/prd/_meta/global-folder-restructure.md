# `web/src/global/` 폴더 재구조 제안

> 작성: 2026-05-09 (사용자 요청 — `web/src/global/` 하위 PC legacy 면 삭제 / 활성 코드는 infra 계층 일관성 따라 폴더 재배치 설계)
> 분석 기준: commit `5b16110` (`renewalNoticeModal` 신설) 후 + commit `c2ff814` / `198c199` / `2d566c1` / `c2955b7` 이전 정리분 반영
> 본 문서: read-only 분석 + 권고. **코드 / 폴더 이동 0건**. 권고 채택은 사용자 검토 후 별도 라운드
> 정합 문서: `docs/prd/_meta/global-api-folder-structure.md` (옵션 C — `infra/` 채택), `docs/specs/fe/infra-layers.md` (FE 계층 분석 + global/handler 계층 검증)

---

## 1. 현 상태 — `web/src/global/**` 잔여 구조

### 1.1 폴더 트리 (commit 5b16110 시점)

```
web/src/global/
├── handler/
│   ├── applyAsyncHandlers.js
│   └── VisibleToggleHandler.js
├── hooks/
│   └── useTableModal.js
├── layout/
│   └── callBack/
│       └── AuthCallBack.jsx
├── styles/
│   ├── base/{_base.scss, _typography.scss}
│   ├── components/primitive/{_Badge, _Button, _Input}.module.scss
│   ├── mixins/{_background, _flex, _layout, _media, _table, _typography}.scss
│   ├── semantic/_color.scss
│   ├── variables/{_breakpoints, _colors, _font, _radius, _semantic, _spacing, _zindex}.scss
│   ├── global.scss          # main.jsx 진입점
│   └── index.scss            # vite additionalData (자동 주입)
├── ui/
│   ├── badge/{StatusBadge, LabelBadge, PinnedBadge}.{jsx, module.scss}
│   ├── mobile/section/{SectionBlock, SectionHeader}.jsx + Section.module.scss
│   ├── renewalNoticeModal/{RenewalNoticeModal.jsx, *.module.scss, index.js}
│   ├── responseModal/{ResponseModal.jsx, *.module.scss, useResponseModal.js, index.js}
│   └── visibleToggle/{VisibleToggle.jsx, *.module.scss, index.js}
└── utils/
    ├── crypto/storageCrypto.js
    ├── datetime/{dateUtils, formatDateTyping, parseDateInput, validateModalDate}.js
    ├── skill/{playerSkillPicker, skillProbability, skillScoreCalc}.js
    ├── DateFormatt.js
    ├── parseDate.js
    └── sortCoupons.js
```

### 1.2 이전 라운드 정리 흔적 (참조)

| Commit | 폐기 항목 | 이유 |
|---|---|---|
| `c2ff814` | `global/layout/{adminPageLayout, contentPageLayout, userLayout}` | PC legacy layout — 모바일 전환 |
| `198c199` | `global/ui/{cafeLinkCard, cardSwiper, contentPageHeader, navigationCard, navigation/tabs}` | PC legacy UI |
| `2d566c1` | `global/ui/navigation/tabNav/` | PC legacy nav |
| `c2955b7` | `global/ui/metaHeader/` | PC legacy header |
| `2e277b7` | (보존) `global/ui/visibleToggle/` 신설 | 신규 모바일 컴포넌트 |
| `5b16110` | (보존) `global/ui/renewalNoticeModal/` 신설 | 폐기 도메인 안내 모달 |
| `fa52ef1` | `app/store/APIConfig.js` → `infra/http/client.js`, `infra/uploads/` → `infra/api/uploads/` | 옵션 C 채택 |

---

## 2. 파일별 분류

> **분류 기준**:
> - **A. PC legacy** — 사용처 0건 또는 폐기 도메인만 의존 → 삭제 후보
> - **B. 활성 + 글로벌 위치 OK** — 현 위치 유지
> - **C. 활성 + infra 이전 권고** — Hexagonal/Clean Arch 정합성 따라 `infra/` 또는 `app/store/` 이전
> - **D. 신규 추가 / 명백한 활성** — 보존

### 2.1 `global/handler/`

| 파일 | 사용처 | 분류 |
|---|---|---|
| `applyAsyncHandlers.js` | 5 도메인 slice (`notices`, `events`, `coupons`, `quiz`, `community`) + `infra/api/uploads/slices.js` | **C** — Redux slice factory. `app/store/utils/` 또는 `infra/redux/` 가 일관 |
| `VisibleToggleHandler.js` | `global/ui/visibleToggle/` 와 짝. admin 전용 dispatch curry — 본문 사용처 0건 (admin UI legacy 폐기 후 dead) | **A** (잠정) — admin UI 신규 기획 시 부활 가능. 현재는 dead |

> ⚠ 사용자가 "global/handler async toast (admin 전용)" 으로 지칭한 코드는 실제로는 `app/store/operation/operationListener.js` + `app/page/commonModal/ResponseListener.jsx` (FE 계층 분석 § 4 참조). `global/handler/` 자체는 toast 와 무관한 slice factory + admin UI helper.

### 2.2 `global/hooks/`

| 파일 | 사용처 | 분류 |
|---|---|---|
| `useTableModal.js` | `domains/community/feature/components/admin/{board, post}/{Board, Post}AdminTable.jsx` (community 도메인 정리 보류 중 — `PublicRoutes.jsx:10` 주석) | **A** (조건부) — community admin UI legacy. community 신규 기획 IA 후 재구현 시 도메인 hook (`domains/community/hooks/`) 으로 흡수 권고. `global/hooks/` 폴더 자체 폐기 후보 |

### 2.3 `global/layout/`

| 파일 | 사용처 | 분류 |
|---|---|---|
| `callBack/AuthCallBack.jsx` | `PublicRoutes.jsx:23` `lazy(...)` import 만 — route 정의에는 미사용 (`PublicRoutes.jsx:31` 은 `domains/authentication/callback/AuthCallBack.jsx` 사용) | **A** — dead chain. `global/layout/callBack/` 폴더 통째 폐기 + PublicRoutes:23 lazy 줄 삭제 |

> FE 계층 분석 § 5 권고 5 와 동일. `domains/authentication/callback/` 가 활성 — 도메인 callback 은 도메인 폴더 내부가 일관.

### 2.4 `global/styles/`

| 항목 | 사용처 | 분류 |
|---|---|---|
| `global.scss` | `main.jsx:3` 진입점 | **B** 보존 |
| `index.scss` | vite `additionalData` (모든 `.module.scss` 자동 주입) | **B** 보존 |
| `variables/{colors, font, spacing, radius, breakpoints, zindex, semantic}` | `index.scss` `@forward` → 모든 .module.scss 에서 사용 | **B** 보존 |
| `mixins/{flex, layout, media, table, background, typography}` | `index.scss` `@forward` | **B** 보존 |
| `base/_base.scss` | `global.scss` `@use` | **B** 보존 |
| `base/_typography.scss` | `global.scss` `@use` (typo 클래스 `text-hero` 등) | **B** 보존 |
| `semantic/_color.scss` | `global.scss` `@use` | **B** 보존 |
| `components/primitive/_Badge.module.scss` | `@use` 사용처 0건. legacy variant table | **A** — PC legacy / 미연결. badge 활성 컴포넌트 (`global/ui/badge/`) 가 별도 SCSS 보유 |
| `components/primitive/_Button.module.scss` | `@use` 사용처 0건 | **A** — PC legacy / 미연결 |
| `components/primitive/_Input.module.scss` | `@use` 사용처 0건 | **A** — PC legacy / 미연결 |
| `mixins/_table.scss` | `index.scss @forward "mixins/table"` 등록되어 있으나 `list-row` / `section-header` 믹스인 사용처 grep 0건 | **A** (잠정) — mobile 활성 화면이 직접 사용 안 함. 후속 audit (모바일 admin 신규 기획 시 부활 가능) |

> `components/primitive/` 폴더 자체 폐기 후보 — 신규 모바일 컴포넌트는 `global/ui/{badge,*}/` 가 자체 SCSS 보유.

### 2.5 `global/ui/`

| 폴더 | 사용처 | 분류 |
|---|---|---|
| `badge/{StatusBadge, LabelBadge, PinnedBadge}` | community / notices 컴포넌트 6 파일 (notices NoticeDetailScreen / OfficialNoticeCard / NoticeCard, community CommunityBadge) | **B** 보존 |
| `mobile/section/{SectionBlock, SectionHeader}` | home / events / coupons / notices Screen (총 4 화면) | **B** 보존 |
| `renewalNoticeModal/` | home QuickSection + Drawer (commit `5b16110`) | **D** 신규 — 보존 |
| `responseModal/{ResponseModal, useResponseModal}` | `app/page/commonModal/ResponseListener.jsx` (전역 toast 출력 컴포넌트) — `useResponseModal` hook 자체 사용처 0건 (legacy admin 잔여) | **B** 보존 (`ResponseModal`) / `useResponseModal.js` 는 **A** 후보 (사용처 0건) |
| `visibleToggle/` | `global/handler/VisibleToggleHandler.js` 와 짝. admin UI 폐기 후 사용처 0건 | **D** (재기획 시 사용) — 보존 권장. `VisibleToggleHandler.js` 는 함께 보존/폐기 결정 |

### 2.6 `global/utils/`

| 파일 | 사용처 | 분류 |
|---|---|---|
| `datetime/dateUtils.js` (`expired`, `formatNow`) | `domains/events/mobile/hooks/useEventList.js`, `domains/coupons/mobile/hooks/useCouponList.js`, `domains/community/store/thunks/tagThunks.js` (KST 정합 fix `e8a07d3` 적용) | **B** 보존 — 모바일 활성 |
| `datetime/parseDateInput.js` | grep 0건 (admin 폐기 후 dead) | **A** — admin UI legacy |
| `datetime/formatDateTyping.js` | grep 0건 | **A** — admin UI legacy |
| `datetime/validateModalDate.js` | grep 0건 | **A** — admin UI legacy |
| `crypto/storageCrypto.js` | grep 0건 (`encrypt(`/`decrypt(` 호출 0건) | **A** — dictionary/simulate 폐기 후 dead 의심 (storageCrypto 만 import 검색에도 0건) |
| `skill/playerSkillPicker.js` | self-only (skill/ 폴더 자체 self-reference) | **A** — simulate 도메인 폐기 (`bc147f9`) 후 dead |
| `skill/skillProbability.js` | self-only | **A** — simulate 폐기 후 dead |
| `skill/skillScoreCalc.js` | self-only (`@/data/skill/...` import 함 — `web/src/data/skill/` 도 dead 의심) | **A** — simulate / dictionary 폐기 후 dead |
| `parseDate.js` | `global/utils/sortCoupons.js` 만 import (sortCoupons 도 dead) | **A** — sortCoupons 와 함께 dead |
| `DateFormatt.js` (`formatDateLabel`, `isSameDate`) | grep 0건 (외부 import 0건) | **A** — dead |
| `sortCoupons.js` | grep 0건 (외부 import 0건) | **A** — coupons admin UI 폐기 후 dead |

> `global/utils/skill/` 은 simulate 도메인이 폐기된 후 함께 정리되어야 했던 파일. `data/skill/` 폴더와 함께 audit 필요.

---

## 3. 분류 요약

### A — PC legacy / dead 삭제 후보 (15 파일 + 2 폴더)

1. `global/handler/VisibleToggleHandler.js` (admin UI 폐기 후 dead — admin 신규 기획 시 부활 가능 → 보류 옵션)
2. `global/hooks/useTableModal.js` (community admin legacy — community IA 재개 시 도메인 hook 흡수)
3. `global/hooks/` (빈 폴더)
4. `global/layout/callBack/AuthCallBack.jsx` (PublicRoutes:23 dead lazy import — `domains/authentication/callback/` 가 활성)
5. `global/layout/callBack/`, `global/layout/` (빈 폴더)
6. `global/styles/components/primitive/_Badge.module.scss`
7. `global/styles/components/primitive/_Button.module.scss`
8. `global/styles/components/primitive/_Input.module.scss`
9. `global/styles/components/primitive/`, `global/styles/components/` (빈 폴더)
10. `global/styles/mixins/_table.scss` + `index.scss` `@forward "mixins/table"` 줄 (조건부 — 모바일 admin 재기획 시 부활 가능 → 보류 옵션)
11. `global/ui/responseModal/useResponseModal.js` (사용처 0건 — `ResponseListener` 는 `ResponseModal` 만 사용)
12. `global/utils/crypto/storageCrypto.js` + `crypto/` 폴더
13. `global/utils/datetime/parseDateInput.js`
14. `global/utils/datetime/formatDateTyping.js`
15. `global/utils/datetime/validateModalDate.js`
16. `global/utils/skill/{playerSkillPicker, skillProbability, skillScoreCalc}.js` + `skill/` 폴더
17. `global/utils/parseDate.js`
18. `global/utils/DateFormatt.js`
19. `global/utils/sortCoupons.js`

### B — 활성 + 글로벌 위치 OK (보존)

- `global/styles/` 본체 (variables / mixins / base / semantic / global.scss / index.scss)
- `global/ui/badge/{StatusBadge, LabelBadge, PinnedBadge}` (notices / community 활성)
- `global/ui/mobile/section/{SectionBlock, SectionHeader}` (home / events / coupons / notices 활성)
- `global/ui/responseModal/ResponseModal.jsx` + `*.module.scss` + `index.js` (ResponseListener 사용)
- `global/utils/datetime/dateUtils.js` (events / coupons / community 활성)

### C — 활성 + infra/app 이전 권고

| 파일 | 현 위치 | 권고 위치 | 사유 |
|---|---|---|---|
| `applyAsyncHandlers.js` | `global/handler/` | `app/store/utils/applyAsyncHandlers.js` (또는 `infra/redux/applyAsyncHandlers.js`) | Redux slice extraReducer factory — `app/store/` 영역 (Redux store 인프라). `global/` = 도메인 횡단 UI/util. 폴더명 "handler" 가 toast/error handler 와 혼동 유발 |

### D — 신규 추가 / 명백한 활성 (보존)

- `global/ui/visibleToggle/` (commit `2e277b7` — admin 신규 기획 사용 예정)
- `global/ui/renewalNoticeModal/` (commit `5b16110` — home QuickSection / Drawer 활성)

---

## 4. infra 계층 재배치 제안

### 4.1 옵션 C 현 상태 (`global-api-folder-structure.md` 채택 — commit `fa52ef1`)

```
web/src/infra/
├── api/
│   └── uploads/         # S3 횡단 (events / quiz admin)
└── http/
    └── client.js         # axios instance + interceptor
```

### 4.2 본 라운드 + FE 계층 분석 통합 제안

```
web/src/infra/
├── api/
│   └── uploads/
├── http/
│   └── client.js
├── analytics/             # ⭐ FE 계층 § 5 권고 1 — app/analytics/ 이전 (Q5 후속)
│   ├── ga.js
│   ├── events/{auth, coupon, event}Events.js
│   ├── hooks/useGA4PageView.js
│   ├── index.js           # barrel
│   └── README.md
├── redux/                 # ⭐ 본 라운드 권고 — global/handler/applyAsyncHandlers.js 흡수
│   └── applyAsyncHandlers.js  # (또는 app/store/utils/applyAsyncHandlers.js)
├── storage/               # ⭐ 후속 (옵션) — global/utils/crypto/storageCrypto.js 가 live 면
│   └── storageCrypto.js
└── config/                # 향후 예약 (env / runtime config)
```

> `auth/` (token 관리) 후보는 — 현재 `infra/http/client.js` interceptor + `domains/authentication/` 가 분담. 별도 폴더 불요 (FE 계층 § 5 권고 7 참조).

### 4.3 글로벌 vs infra 경계 (재확인)

- `global/ui/` — UI 컴포넌트 (라우트/도메인 횡단). 외부 시스템 통신 X → **global 유지**
- `global/utils/` — 순수 함수 (datetime / formatters). 외부 의존 X → **global 유지**
- `global/styles/` — SCSS 토큰 / 믹스인 → **global 유지**
- `global/handler/` — Redux slice factory + admin UI dispatch curry. 사용자가 인지한 "async toast" 와 다른 코드 → **폐기 권고** (분리 이전)
- `global/hooks/` — `useTableModal` 1개 (community admin legacy) → **폐기 권고**
- `global/layout/` — `callBack/` 잔여 (dead) → **폐기 권고**
- 외부 시스템 통신 (axios / S3 / GA4 / sessionStorage AES 등) → **infra 영역**

---

## 5. 마이그레이션 영향도

| 권고 항목 | 변경 파일 수 | 영향 | 위험도 |
|---|---|---|---|
| A.1 ~ A.18 dead 파일 통째 삭제 | 14 파일 + 4 빈 폴더 | import 0건 검증 완료 | 낮음 |
| A.4 `global/layout/callBack/AuthCallBack.jsx` 삭제 | 1 파일 + PublicRoutes:23 lazy 줄 1 줄 | route 동작 영향 0 (이미 dead chain) | 낮음 |
| A.6~A.8 `styles/components/primitive/_*` 삭제 | 3 파일 + 2 빈 폴더 | `@use` 0건 검증 — SCSS 컴파일 영향 0 | 낮음 |
| A.10 `mixins/_table.scss` 삭제 (조건부) | 1 파일 + index.scss @forward 1 줄 | 사용처 0건 — 모바일 admin 재기획 시 재신설 가능 | 낮음 (보류 권장) |
| A.11 `useResponseModal.js` 삭제 | 1 파일 | 사용처 0건 (ResponseListener 가 ResponseModal 만 사용) | 낮음 |
| A.12~A.16 `global/utils/{skill, crypto, parseDate, DateFormatt, sortCoupons, datetime/{parseDateInput, formatDateTyping, validateModalDate}}` 삭제 | 9 파일 + 2 빈 폴더 | 외부 import 0건 검증 (admin UI / simulate / dictionary 폐기 후 dead) | 낮음 |
| C.1 `applyAsyncHandlers.js` 이전 | 1 파일 이동 + 6 import 갱신 (notices, events, coupons, quiz, community, infra/api/uploads slices) | slice extraReducer 동작 영향 0 (경로만 변경) | 낮음 |
| C.1 부수 — `global/handler/` 빈 폴더 정리 | 폴더 1개 | — | 낮음 |
| C.2 (FE 계층 권고 1) `app/analytics/` → `infra/analytics/` | 13 파일 import 갱신 + barrel 추가 | GA4 호출 동작 영향 0 (경로만 변경) | 낮음 |
| (조건부) D.1 `visibleToggle/` 보존 | — | admin 신규 기획 시 사용 | — |

> 누적: 약 **25 파일 삭제 / 1+13 = 14 파일 이전 / 약 25 import 갱신**.

---

## 6. 사용자 확인 항목

| 옵션 | 채택 여부 | 마이그 시점 |
|---|---|---|
| **옵션 1** — A.1 ~ A.18 dead 일괄 삭제 (확실한 dead 만) | ☐ | 즉시 / 별도 라운드 |
| **옵션 2** — A.10 `mixins/_table.scss` 보류 (admin 재기획 대기) | ☐ | 보류 권장 |
| **옵션 3** — `global/handler/VisibleToggleHandler.js` + `global/ui/visibleToggle/` 보류 (admin 신규 기획 시 부활) | ☐ | 보류 권장 |
| **옵션 4** — C.1 `applyAsyncHandlers.js` 이전 위치 확정: `app/store/utils/` vs `infra/redux/` | ☐ | 사용자 결정 필요 |
| **옵션 5** — C.2 (FE 계층 권고 1) `app/analytics/` → `infra/analytics/` 통합 진행 | ☐ | 즉시 / 별도 라운드 |
| **옵션 6** — `global/utils/crypto/storageCrypto.js` 이전 vs 삭제 (사용처 재확인 후) | ☐ | 별도 audit |
| **옵션 7** — 마이그 시점: 즉시 / 다른 라운드 후 / community IA 재개 시 동시 |  | 사용자 결정 |
| **옵션 8** — FE 계층 분석 (`docs/specs/fe/infra-layers.md`) 권고와의 통합: 단일 라운드 vs 권고별 분리 라운드 | ☐ | 사용자 결정 |

---

## 7. 관련 문서 / Commit

### 문서

- `docs/prd/_meta/global-api-folder-structure.md` — 옵션 C (`infra/`) 채택 (commit `ee57758`)
- `docs/specs/fe/infra-layers.md` — FE 계층 분석 (Q5 후속, global/handler async toast 검증 — § 4)
- `docs/specs/fe/dead-suspects.md` — dead 후보 audit
- `docs/specs/fe/api-calls.md` — 도메인별 endpoint 카탈로그
- `docs/specs/fe/state-and-data.md` — Redux store 등록 reducer 표

### Commit

- `fa57ef1` — `infra/api/uploads/` + `infra/http/client.js` 마이그
- `c2ff814` — `global/layout/{adminPageLayout, contentPageLayout, userLayout}` 폐기
- `198c199` — `global/ui/{cafeLinkCard, cardSwiper, contentPageHeader, navigationCard, navigation/tabs}` 폐기
- `2d566c1` — `global/ui/navigation/tabNav/` 폐기
- `c2955b7` — `global/ui/metaHeader/` 폐기
- `2e277b7` — `global/ui/visibleToggle/` 신설 (보존)
- `5b16110` — `global/ui/renewalNoticeModal/` 신설 (보존)
- `bc147f9` — simulate 도메인 폐기 (skill/ utils dead 원인)
- `823c6ac` — dictionary 도메인 폐기 (storageCrypto dead 원인 의심)

---

## 8. 후속 라운드 권고 (우선순위)

| 우선순위 | 항목 | 사유 |
|---|---|---|
| **P1** | 옵션 1 — A 카테고리 dead 일괄 삭제 (A.10, A.11 제외 보류 결정 후) | 확실한 dead — 위험도 낮음. 폴더 정리 효과 큼 |
| **P1** | 옵션 4 — C.1 `applyAsyncHandlers.js` 이전 위치 결정 + 이전 | slice factory 위치 일관성. 6 도메인 import 갱신 동시 |
| **P1** | 옵션 5 — C.2 `app/analytics/` → `infra/analytics/` (FE 계층 권고 1) | 외부 통신 어댑터 일관 — 본 라운드와 함께 묶어 진행 시 효율 |
| **P2** | 옵션 6 — `storageCrypto.js` 사용처 재확인 후 dead 면 삭제 / live 면 `infra/storage/` 이전 | live 여부 미확정 |
| **P2** | community IA 재개 시 `useTableModal` 도메인 흡수 + admin UI 신규 기획 | community 정리 보류 후 결정 |
| **P3** | A.10 `mixins/_table.scss` / 옵션 3 visibleToggle / VisibleToggleHandler — admin 신규 기획 후 결정 | 부활 가능성 있어 보류 권장 |

---

## 9. 정리 — 통합 로드맵 (FE 계층 분석 + 본 라운드)

본 문서 권고 + `docs/specs/fe/infra-layers.md` 권고를 통합한 단일 라운드 시나리오:

```
[Round N — global + infra 통합 정리]

1. dead 일괄 삭제 (A 카테고리)
   - global/utils/{skill/, crypto/, parseDate.js, DateFormatt.js, sortCoupons.js, datetime/{parseDateInput, formatDateTyping, validateModalDate}.js}
   - global/styles/components/primitive/{_Badge, _Button, _Input}.module.scss
   - global/layout/callBack/AuthCallBack.jsx + PublicRoutes:23 lazy 줄
   - global/ui/responseModal/useResponseModal.js
   - 빈 폴더 정리 (global/{layout, hooks}, global/styles/components, global/utils/{crypto, skill})

2. 이전 (C 카테고리)
   - global/handler/applyAsyncHandlers.js → {app/store/utils 또는 infra/redux} (사용자 결정)
   - app/analytics/** → infra/analytics/** (FE § 5 권고 1)
   - app/page/commonModal/ResponseListener.jsx → app/store/operation/ResponseListener.jsx (FE § 5 권고 4 일부)

3. 보류 (admin 신규 기획 시 결정)
   - global/handler/VisibleToggleHandler.js
   - global/ui/visibleToggle/
   - global/styles/mixins/_table.scss + index.scss @forward
   - global/hooks/useTableModal.js (community IA 재개 시)
   - global/utils/crypto/storageCrypto.js (사용처 재확인 후)

4. operationListener admin 분기 명시화 (FE § 5 권고 3 — 별도 검토)

5. Q2/Q5/Q6 후속 (FE § 5 권고 6, 7) — specs/fe 영역 별도 라운드
```

> ⚠ 코드 / 폴더 이동 미진행 — 사용자 확인 후 별도 라운드에서 적용.
