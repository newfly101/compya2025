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
