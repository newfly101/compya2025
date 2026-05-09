# 도메인: quiz

> ★ requestLatestQuizAnswer dispatch 누락 + admin path 미스매치 명시.

## A.1 현재 상태

- **분류**: **partial-mock** (HomeScreen QuizSection: BE wired but FE dispatch 누락 + path 오타) + **live** (admin)
- **모바일 전환 진척도**: 모바일 화면 자체 없음 (HomeScreen QuizSection 으로 노출). admin 만 PC `/admin/content/quiz`
- 폴더 구조:
  ```
  domains/quiz/
  ├── feature/admin/
  │   ├── pages/AdminQuizPage.jsx
  │   ├── components/
  │   └── hooks/{useAdminQuizTable, useQuizForm}.js
  └── store/
      ├── admin/    { api.js, endpoints.js, thunks.js }
      └── public/   { api.js, endpoints.js, thunks.js }   ★ public thunk 정의만, dispatch 0건
  ```

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| (HomeScreen QuizSection) | `/` 의 일부 | `domains/home/components/section/quiz/QuizSection.jsx` | 모바일 | prop `quiz=null` 만 받음 — 빈 카드 |
| AdminQuizPage | `/admin/content/quiz` | `web/src/domains/quiz/feature/admin/pages/AdminQuizPage.jsx` | PC 어드민 | live |

## A.3 API 엔드포인트

### BE 노출 (도메인 패키지: `domain/quiz/*`)

| METHOD | PATH | 컨트롤러:메서드 (file:line) | auth | 비고 |
|---|---|---|---|---|
| GET | `/api/quiz/latest` | `QuizController#getLatest` (`quiz/controller/QuizController.java:20`) | permitAll | fun_quiz visible=true 의 최신 |
| GET | `/api/admin/quiz` | `AdminQuizController#getAll` (`AdminQuizController.java:21`) | ADMIN | |
| POST | `/api/admin/quiz` | `AdminQuizController#create` (line 28) | ADMIN | |
| PATCH | `/api/admin/quiz/{id}` | `AdminQuizController#update` (line 35) | ADMIN | |
| DELETE | `/api/admin/quiz/{id}` | `AdminQuizController#delete` (line 43) | ADMIN | |

> 참고: visible toggle endpoint **없음** (BE 미구현 — `endpoints.md:215-221`)

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook | 트리거 화면 |
|---|---|---|---|---|
| `domains/quiz/store/public/api.js:4` | GET | **`/quiz-answers/latest`** ★ FE path 오타 | `requestLatestQuizAnswer` (정의만, dispatch 0건) | (없음 — HomeScreen QuizSection 은 prop=null 만 받음) |
| `domains/quiz/store/admin/api.js:5` | GET | **`/admin/quiz-answers`** ★ path 미스매치 | `useAdminQuizTable` | `/admin/content/quiz` |
| `domains/quiz/store/admin/api.js:10` | POST | `/admin/quiz-answers` ★ | (admin form) | `/admin/content/quiz` |
| `domains/quiz/store/admin/api.js:14` | PATCH | `/admin/quiz-answers/{id}` ★ | (admin form) | `/admin/content/quiz` |
| `domains/quiz/store/admin/api.js:19` | PATCH | `/admin/quiz-answers/{id}/visible` ★ + ★ BE 미구현 | `useAdminQuizTable` via `VisibleToggleHandler` | `/admin/content/quiz` |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` #8, #31-34)

- **🔴 FE_ONLY (path 미스매치)**: `/quiz-answers/latest` (FE) ↔ `/api/quiz/latest` (BE), `/admin/quiz-answers*` (FE) ↔ `/api/admin/quiz*` (BE)
- **🔴 FE_ONLY + BE 미구현**: PATCH `/admin/quiz-answers/{id}/visible` — BE 에 visible toggle 자체가 없음. admin 화면 토글 누르면 무조건 404
- **HomeScreen 빈 퀴즈 카드 원인**: thunk 정의만 + dispatch 누락 + path 오타 (이중 버그)

## A.4 DB 테이블 + Mapper

| 테이블 | V1/V2 | 분류 | Mapper xml | 비고 |
|---|---|---|---|---|
| `quiz_answers` | V1 | ⚪ legacy(이전완료) | — (mapper 0건) | fun_quiz 로 이전. ⚠ V2 가 `title` 컬럼 없음 (마이그 시 데이터 손실) |
| `fun_quiz` | V2 | 🔵 active | `mapper/fun/quiz/QuizMapper.xml:15,29,41,46,51,61` | 6 stmt |

**dual pair**: `quiz_answers ↔ fun_quiz` — V2 단방향 (이전 완료). `dual-management.md §16`.

## A.5 권한 / 가드

- public (`/api/quiz/latest`): permitAll
- admin (`/api/admin/quiz*`): SecurityConfig URL 가드 `/api/admin/**` hasRole(ADMIN)

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| 🔥 **R9 일부**: `requestLatestQuizAnswer` thunk 정의만 + dispatch 누락 + path `/quiz-answers/latest` ↔ `/api/quiz/latest` 미스매치 | `fe-be-mismatch.md #8`, `fe/dead-suspects.md D` | ★ Phase 0 차단 — HomeScreen 빈 퀴즈 카드 |
| **R9 일부**: admin quiz path 미스매치 (`/admin/quiz-answers*` ↔ `/admin/quiz*`) + visible toggle BE 미구현 | `fe-be-mismatch.md #31-34` | ⚠ admin quiz 화면 진입 시 404. PC 어드민이라 모바일 차단 아님 |
| ⚠ V2 fun_quiz 에 `title` 컬럼 없음 (V1 quiz_answers 의 title 손실) | `dual-management.md §16` | 마이그 또는 frontend 표시 변경 필요 |

### R9 권장 fix (Phase 0)

1. `web/src/domains/quiz/store/public/endpoints.js:2` path 를 `/quiz/latest` 로 변경
2. `HomeScreen.jsx` 마운트 시 `useDispatch(requestLatestQuizAnswer())` 추가
3. `QuizSection` props 로 응답 imageUrl/round 전달

### admin path fix (Phase 3)

- FE endpoint 상수 `/admin/quiz-answers*` → `/admin/quiz*` 일괄 수정
- visible toggle: BE 에 endpoint 추가 또는 FE 토글 제거

## A.7 dead 항목 (이 도메인 안)

- `requestLatestQuizAnswer` thunk: dispatch 0건 (정의만) — `fe/dead-suspects.md D`. 단 위 R9 fix 시 살아남
- visible toggle 관련 thunk (BE 미구현 부분): admin 화면 disable 처리 권장

## A.8 ★ Owner 결정 필요 (도메인 한정)

- visible toggle BE 추가할지, FE 토글 제거할지 (admin quiz 운영 정책)
- V2 `title` 컬럼 손실 처리 (마이그 또는 표시 변경)

---

## B.1 모바일 scope 정의 (v2 — 사용자 4 라운드 대화 확정)

> **v1 대비 변경**: 이전 라운드 (2026-05-09 첫 IA-CONFIRM) 의 admin / 신규 기능 / Owner 결정 보류 항목 (visible toggle / V2 title 컬럼) 은 본 라운드 결정으로 **모두 DROP**. 모바일 quiz scope 는 **HomeScreen QuizSection** 1개 화면으로 단일화.

- **모바일 quiz 화면**: 신규 단독 화면 없음. `/` (HomeScreen) 의 QuizSection 카드 1개로 노출
- **admin 영역**: 본 라운드 scope 외 (Phase 3 미루기 — 모바일 리뉴얼 직접 차단 아님)
- **사용자 접점**: guest / user 가 홈 진입 시 자동 노출되는 카드 1개. 별도 인터랙션 (정답 제출 / 스타 적립 / 상세 페이지 진입) 없음
- **figma node**: `node-id=2-34` (확정)

## B.2 기능 요구사항

### 기능 1: 최신 fun_quiz 1건 자동 조회 + 카드 노출 (R9 fix)

- [ ] **사용자 시나리오**:
  - guest / user 가 `/` 진입 → HomeScreen 마운트 시 최신 visible=true quiz 자동 fetch → QuizSection 카드에 imageUrl + round 표시
  - 응답이 비어있을 때 (DB 0건 또는 visible=true 행 없음) 빈 카드 placeholder 유지
- [ ] **acceptance criteria**:
  - HomeScreen 마운트 시 `requestLatestQuizAnswer` dispatch 1회 발생 (Part A.7 dead chain 해소)
  - FE endpoint 가 `/quiz/latest` (GET, permitAll) 로 호출 (Part A.6 R9 권장 fix #1)
  - 응답 200 + payload 존재 시 `QuizSection` 에 `quiz={imageUrl, round}` props 전달 (`QuizSection.jsx:4` 의 `quiz?.imageUrl` 분기 동작)
  - 응답 204 / 빈 객체 시 빈 카드 fallback 유지 (B.3 기능 2)
- [ ] **의존 API/테이블**: GET `/api/quiz/latest` (Part A.3 BE 노출 1행), `fun_quiz` (Part A.4)
- [ ] **우선순위**: **P0** (모바일 리뉴얼 차단성 — `_overview.md § 7 Phase 0` 명시)
- [ ] **figma node**: `node-id=2-34`

### 기능 2: QuizSection 빈 상태 / 로딩 상태 UX 보존

- [ ] **사용자 시나리오**:
  - 응답 도착 전 (loading) 빈 카드 + 안내문 노출 유지
  - DB 가 비었거나 visible=true 행 없음 → 동일 빈 카드 노출 (사용자 구분 불필요)
- [ ] **acceptance criteria**:
  - `QuizSection.jsx:11-15` 의 empty placeholder 마크업 변경하지 않음
  - 안내문 (`L17-19`) 텍스트 변경하지 않음 (정답/스타 적립 기능 미구현 상태에서 안내만 유지)
- [ ] **의존 API/테이블**: 없음 (FE 컴포넌트 보존)
- [ ] **우선순위**: **P0** (기능 1 의 fallback path)
- [ ] **figma node**: `node-id=2-34` (동일 카드 — 빈 상태 variant)

## B.3 자동화 정책 (사용자 결정 4종)

> 본 라운드 질문 2 답변. 모바일 quiz 가 별도 인터랙션 없는 read-only 카드인 만큼 자동화 4종은 단순 / 검증 가능 형태로 결정.

| # | 자동화 항목 | 결정 | 사유 |
|---|---|---|---|
| 1 | HomeScreen 마운트 시 `requestLatestQuizAnswer` 자동 dispatch | ✅ 채택 | R9 fix 의 핵심. 사용자 액션 없이 카드 자동 표시 |
| 2 | 응답 캐시 / refetch 정책 | 페이지 마운트 1회만 fetch (refetch 없음) | quiz 는 주 1회 갱신 빈도 → SWR / polling 불필요 |
| 3 | 빈 응답 (204 / null) → placeholder fallback 자동 전환 | ✅ 채택 | 사용자 구분 불필요. 동일 빈 카드 |
| 4 | 에러 응답 (4xx/5xx) → placeholder fallback (조용히 실패) | ✅ 채택 | quiz 는 비차단 보조 기능. 에러 토스트 / 재시도 UI 노출 안 함 |

## B.4 우선순위

| 우선순위 | 기능 | Phase 매핑 | 차단성 |
|---|---|---|---|
| **P0** | 기능 1 (R9 fix: path 정정 + dispatch 추가 + props 전달) | Phase 0 | ★ HomeScreen 빈 퀴즈 카드 차단 해소 |
| **P0** | 기능 2 (빈 상태 UX 보존) | Phase 0 | 기능 1 fallback |

> v1 의 P1 / P2 (admin path 정렬, visible toggle, V2 title 컬럼 처리) 모두 DROP — 본 라운드 모바일 scope 외.

## B.5 KPI / 성공지표

- **P0 검증 지표**:
  - HomeScreen 마운트 시 `GET /api/quiz/latest` 호출 1회 발생 (현재 0회) — runtime 검증 가능
  - QuizSection 카드의 imageUrl 표시율 (응답 도착률 — DB 에 visible=true row 존재 시 100%)
- **운영 KPI** (참고): 이번 라운드 범위 밖 — 정답 제출 / 스타 적립 기능 부재로 사용자 engagement 측정 불가

## B.6 디자인 / Figma 참조

- **모바일**: HomeScreen QuizSection — figma `node-id=2-34` 확정
- **기존 스타일**: `web/src/domains/home/components/section/quiz/QuizSection.module.scss` 유지 가정 (wireframe-generator + design-sync 단계에서 figma vs 코드 갭 분석)
- **신규 화면 없음**: 본 라운드 모바일 quiz 단독 화면 신설하지 않음

## B.7 Owner 결정 (도메인 한정 — 본 라운드 해소)

> Part A.8 의 도메인 한정 ★ Owner 결정 항목. v1 IA-CONFIRM 라운드에서 보류 → 본 라운드 해소.

| # | 결정 항목 | v1 상태 | v2 결정 | 사유 |
|---|---|---|---|---|
| (a) | visible toggle BE 추가 vs FE 토글 제거 | ☐ 보류 | ✅ **DROP** | 본 라운드 모바일 scope 외 (admin 영역). Phase 3 admin 정리 라운드까지 본 PRD 에서 제외 |
| (b) | V2 `fun_quiz.title` 컬럼 손실 처리 | ☐ 보류 | ✅ **DROP** | 모바일 QuizSection 은 imageUrl 만 표시 → title 영향 0. admin form 영향만 남음 → admin 정리 라운드에서 결정 |

## B.8 v1 → v2 변경 사항 (재정립 근거)

> 본 라운드 (2026-05-09 두 번째 IA-CONFIRM) 가 첫 라운드와 결정이 다른 이유 추적용.

- **v1 (Auto mode 합리적 가정)**: P0×2 / P1×2 / P2×2 = 6 기능. admin path 정렬 + visible toggle + V2 title 컬럼 처리 포함
- **v2 (사용자 4 라운드 대화 확정)**: P0×2 = 2 기능. admin / 신규 기능 / 도메인 한정 Owner 결정 보류 항목 모두 DROP
- **DROP 사유**: 모바일 리뉴얼 phase 0 의 quiz scope 는 HomeScreen QuizSection R9 fix 단 1건. admin 영역 / 운영 정책은 Phase 3 admin 정리 라운드에서 별도 PRD 라운드 진행
- **figma node 확정**: v1 미정 → v2 `node-id=2-34`
