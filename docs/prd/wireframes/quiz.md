# quiz 화면기획서 (Wireframe)

> 입력: `docs/prd/domains/quiz.md` Part B (v2 확정, 2026-05-09) + Figma MCP (node: 2-34)
> 생성: prd-wireframe-generator
> 갱신: 2026-05-09
> **v1 stale 폐기 — 완전 재생성** (v1 은 admin scope 포함 3화면, v2 는 HomeScreen QuizSection 1화면으로 단일화)

---

## 1. 도메인 컨텍스트 (Part A 요약 — read-only)

- **분류**: `partial-mock` — HomeScreen QuizSection: BE wired but FE dispatch 누락 + path 오타 (Part A.1 cite)
- **활성 라우트 / 핵심 화면**: `/` (HomeScreen) 의 `QuizSection` 카드 1개. 모바일 단독 quiz 화면 없음 (Part A.2 cite)
- **알려진 위험 차단성**:
  - 🔥 **R9** (Phase 0 차단): `requestLatestQuizAnswer` thunk dispatch 0건 + FE path `/quiz-answers/latest` ↔ BE `/api/quiz/latest` 미스매치 → HomeScreen 빈 퀴즈 카드 (Part A.6 R9 cite)
  - ⚠ admin path 미스매치 + visible toggle BE 미구현: **본 wireframe scope 외** (B.1 DROP 결정, Phase 3 admin 정리 라운드까지 제외)
  - ⚠ V2 `fun_quiz` 에 `title` 컬럼 없음: **본 wireframe scope 외** (B.7 (b) DROP 결정)

---

## 2. 기능 → 화면 매핑 (Part B → wireframe)

| 기능 (Part B) | 우선순위 | 매핑 화면 | 화면 상태 (state) | figma node |
|---|---|---|---|---|
| 기능 1: 최신 fun_quiz 자동 조회 + 카드 노출 (R9 fix) | P0 | HomeScreen QuizSection (loaded) | loading / loaded / error | 2-34 |
| 기능 2: QuizSection 빈 상태 / 로딩 상태 UX 보존 | P0 | HomeScreen QuizSection (empty / loading) | empty / loading | 2-34 (동일 카드 — 빈 variant) |
| admin 화면 | n/a | n/a — PC 어드민 한정, 본 라운드 scope 외 (B.1 DROP 결정) | n/a | n/a |

---

## 3. 화면별 wireframe

### 3.1 HomeScreen QuizSection 카드

- **라우트**: `/` 의 일부 (HomeScreen 마운트 시 렌더, 독립 라우트 없음. Part A.2 cite)
- **진입 컴포넌트**: `web/src/domains/home/components/section/quiz/QuizSection.jsx` (Part A.2 cite)
- **figma node**: `2-34` (https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=2-34)
- **figma metadata** (node `2-34`, `mcp__figma-dev-mode__get_metadata` 결과):
  - frame: `Quiz Section`, 375 x 251 px
  - 자식:
    - `2:35` Rectangle — 섹션 제목 좌측 액센트 바 (3 x 13 px, bg `#a86af0`)
    - `2:36` Text — 섹션 제목 `"컴프야 퀴즈 888회 정답"` (13px SemiBold, `rgba(255,255,255,0.92)`)
    - `2:38` QuizCard — 343 x 186 px, bg `#1f1a29`, border `rgba(255,255,255,0.12)`, radius 10px, overflow clip
      - `17:1310` 퀴즈 이미지 — 400 x 185 px (카드 폭 초과 가로 확장, object-cover)
      - `5:2` Rectangle — 카드 내부 배경 `#140f1f`, radius 10px
      - `5:3` 빈 상태 아이콘 — hidden=true (empty variant 시 표시)
      - `5:4` 빈 상태 텍스트 `"퀴즈 정답 이미지"` — hidden=true (empty variant 시 표시)
    - `8:4` Text — 안내문 `"※ 매주 금요일에 신규 퀴즈가 등장합니다. 보상은 목요일까지 수령해주세요."` (10px Regular, `rgba(255,255,255,0.6)`)

#### 레이아웃 구성 (top → bottom, 375 px 기준)

| 영역 | 컴포넌트 / node | 위치·사이즈 | 비고 |
|---|---|---|---|
| 글로벌 TopBar | `GlobalTopBar` (MobileLayout) | 화면 최상단 | 도메인 자체 헤더 X (`feedback_no_domain_header`) |
| 섹션 제목 액센트 바 | `Rectangle` (node 2:35) | x=16, y=18, 3 x 13 px, `#a86af0` | 고정 색상 |
| 섹션 제목 텍스트 | `Text` (node 2:36) | x=25, y=16, 13px SemiBold | 동적: `"컴프야 퀴즈 {round}회 정답"` |
| 퀴즈 카드 컨테이너 | `QuizCard` (node 2:38) | x=16, y=42, 343 x 186 px | bg `#1f1a29`, radius 10, border, overflow clip |
| 퀴즈 이미지 (loaded) | `img` (node 17:1310) | 400 x 185 px (overflow clip) | `quiz.imageUrl` → `<img src>`, object-cover |
| 빈 상태 아이콘 (empty/loading/error) | node 5:3 | 카드 중앙 | hidden=true → loaded 시 유지, empty 시 표시 |
| 빈 상태 텍스트 (empty/loading/error) | node 5:4 | 카드 중앙 하단 | hidden=true → empty 시 표시 |
| 안내문 | `Text` (node 8:4) | x=16, y=232, 342 px wide, 10px Regular | 고정 텍스트 — 변경 금지 (B.2 기능 2 ac cite) |

#### 데이터 source

- **API**: `GET /api/quiz/latest` (Part A.3 BE 노출 1행, `QuizController#getLatest`, permitAll)
  - 응답 필드: `imageUrl`, `round` (fun_quiz 테이블 — Part A.4 cite)
  - 호출 시점: HomeScreen 마운트 1회 (`requestLatestQuizAnswer` dispatch — B.3 자동화 1번)
  - 캐시 정책: 없음 (마운트 1회만 fetch, SWR/polling 불필요 — B.3 자동화 2번)
- **테이블**: `fun_quiz` (V2 active, `mapper/fun/quiz/QuizMapper.xml` — Part A.4 cite)
- **Redux slice**: `state.quiz.latest` → `QuizSection` 에 `quiz={imageUrl, round}` props 로 전달

#### 상태 분기

| 상태 | 조건 | QuizCard 표현 | 섹션 제목 텍스트 |
|---|---|---|---|
| **loading** | dispatch 후 응답 도착 전 | 빈 카드 (node 5:3, 5:4 표시) | 빈 문자열 또는 고정 |
| **loaded** | 응답 200 + `imageUrl` 존재 | `<img src={quiz.imageUrl}>` (node 17:1310, object-cover) | `"컴프야 퀴즈 {round}회 정답"` (동적) |
| **empty** | 응답 204 / null / visible=true row 없음 | 빈 카드 placeholder (node 5:3, 5:4 표시) | 빈 문자열 또는 고정 |
| **error** | 4xx / 5xx | 빈 카드 fallback — 조용히 실패, 에러 토스트 X (B.3 자동화 4번) | 빈 문자열 또는 고정 |

> loading / empty / error 는 사용자 구분 불필요 — 동일 빈 카드 표현 (B.3 자동화 3, 4번 cite)

#### 유저 액션

- 탭 / 진입 액션 없음 — read-only 노출 카드 (B.1 cite: "별도 인터랙션 없음")
- 스크롤: HomeScreen 내 다른 섹션과 함께 자연 스크롤 (QuizSection 자체 스크롤 없음)

#### acceptance criteria 매핑 (Part B 기능 1, 기능 2 의 ac 와 정렬)

**기능 1 (R9 fix) — P0**
- [ ] HomeScreen 마운트 시 `requestLatestQuizAnswer` dispatch 1회 발생 (현재 0회 dead chain 해소 — Part A.7 cite)
- [ ] FE endpoint 가 `/quiz/latest` (GET, permitAll) 로 호출 (Part A.6 R9 권장 fix #1: `endpoints.js:2` path 변경)
- [ ] 응답 200 + payload 존재 시 `QuizSection` 에 `quiz={imageUrl, round}` props 전달 (`QuizSection.jsx:4` 의 `quiz?.imageUrl` 분기 동작)
- [ ] 응답 204 / 빈 객체 시 빈 카드 fallback 유지

**기능 2 (빈 상태 UX 보존) — P0**
- [ ] `QuizSection.jsx:11-15` 의 empty placeholder 마크업 변경하지 않음
- [ ] 안내문 (`L17-19`) 텍스트 변경하지 않음 (정답/스타 적립 기능 미구현 상태에서 안내만 유지)

---

## 4. 컴포넌트 재사용 매핑 (이미 구현된 부분)

| 재사용 후보 (표준 패턴) | quiz 도메인 매핑 여부 | 비고 |
|---|---|---|
| `GlobalTopBar` (MobileLayout) | 필수 재사용 | 도메인 자체 헤더 금지 (`feedback_no_domain_header`) |
| `SectionBlock` (coupons/events 섹션 구획) | 부분 매칭 — 섹션 제목 액센트 바 + 텍스트 패턴 동일 (`#a86af0` 바) | `QuizSection` 이 이미 동일 패턴 구현 중 — 재사용보다 기존 코드 보존 |
| `CouponCard` / `EventCard` | 매칭 안 됨 | `QuizCard` (node 2:38) 는 단일 이미지 full-bleed 구조, 텍스트 없음 — 별도 패턴 |
| `LabelBadge`, `Chip` | 해당 없음 | quiz 카드에 badge/chip 없음 |

> 이미 구현된 화면 (`QuizSection.jsx`, `QuizSection.module.scss`) 이 있으므로 **design-sync 단계에서 figma vs 코드 비교 필요**

---

## 5. 신규 컴포넌트

없음.

> v2 scope 에서 모바일 단독 quiz 화면 신설 없음. `QuizSection.jsx` + 기존 스타일 보존 + R9 fix (dispatch 추가 + path 수정 + props 전달) 로 완결. 신규 컴포넌트 생성 필요 없음.

---

## 6. figma 미반영 사항

없음 (본 라운드 v2 scope 기준).

> IA 에서 정한 기능 (기능 1: R9 fix, 기능 2: 빈 상태 보존) 은 모두 figma node `2-34` 로 매칭됨.
> admin 화면 (AdminQuizPage `/admin/content/quiz`) 은 본 라운드 scope 외 (B.1 n/a) — figma frame 추가 불필요 (PC 어드민, Phase 3 admin 정리 라운드).

---

## 7. design-sync 입력

- **도메인 분류**: `partial-mock` (Part A.1 cite) — BE wired, FE dispatch 누락 + path 오타. **R9 fix 이후 design-sync 진행 권장**
- **권장 시점**: Phase 0 R9 fix (dispatch 추가 + path 수정) 완료 후 즉시

| 비교 대상 화면 라우트 | figma node | 코드 진입점 | 비고 |
|---|---|---|---|
| `/` (HomeScreen QuizSection) | `2-34` | `web/src/domains/home/components/section/quiz/QuizSection.jsx` | R9 fix 후 실제 이미지 노출 여부 + 스타일 갭 분석 |

- **admin 화면**: design-sync 미진행 — PC 어드민, figma scope 외 (Phase 3 admin 정리 라운드에서 별도 진행)

---

## 부록 A. R9 fix 상세 (Phase 0 — wireframe 연계)

> `quiz.md A.6 R9 권장 fix` 3단계를 화면 컴포넌트와 연계한 요약.

| 단계 | 대상 파일 | 현재 값 | 수정 값 | 화면 영향 |
|---|---|---|---|---|
| 1 | `web/src/domains/quiz/store/public/endpoints.js:2` | `"/quiz-answers/latest"` | `"/quiz/latest"` | QuizSection fetch 경로 정상화 |
| 2 | `HomeScreen.jsx` (마운트 위치) | dispatch 없음 | `useEffect(() => { dispatch(requestLatestQuizAnswer()) }, [])` 추가 | QuizSection 초기 로딩 트리거 |
| 3 | `HomeScreen.jsx` → `QuizSection` | `quiz={null}` (또는 미전달) | `quiz={latestQuiz}` (`state.quiz.latest` 매핑) | QuizSection loaded 상태 활성화 |
