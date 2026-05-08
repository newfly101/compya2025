# FE 지도

> 정찰 결과 (넓고 얕게). 상세 분석은 fe-analyzer 단계에서 수행.
> 진입점: `web/src/main.jsx` → `web/src/app/router/index.jsx` → `AppWrapper` → `MobileLayout` (PC/모바일 분기는 MobileLayout 내부에 있는 것으로 추정)

## 라우트 트리

라우터 정의 파일: `web/src/app/router/index.jsx`, `web/src/app/router/routes/{PublicRoutes,UserRoutes,AdminRoutes}.jsx`, `web/src/app/router/config/{routePath.js,routeMeta.js}`

```
/ (AppWrapper → MobileLayout)
├─ /                     index           → HomePage          (→ domains/home/components/HomeScreen)
├─ /auth/callback                        → AuthCallback      (→ domains/authentication/callback/AuthCallBack)
├─ /coupons                              → CouponPage        (→ domains/coupons/mobile/CouponScreen)
├─ /events                               → EventPage         (→ domains/events/mobile/EventScreen)
├─ /notices                              → NoticePage        (→ domains/notices/mobile/NoticeScreen)
├─ /notice/:id                           → NoticeDetailPage  (도메인 추정: notices)
├─ /mode/history                         → HistoryModePage   (→ domains/historyMode/mobile/HistoryModeScreen)
├─ /community                            → CommunityPage     (→ domains/community/mobile/CommunityScreen)
│
├─ [AuthGuard: ADMIN/USER]
│   └─ /mypage                           → UserProfile       (→ domains/profile/page/UserProfile)
│
└─ [AuthGuard: ADMIN] /admin             → AdminPageLayout
    ├─ index                             → AdminDashBoardPage
    ├─ users                             → AdminUserManagePage
    ├─ users/:userId                     → AdminUserDetailPage
    ├─ content                           → AdminContentPage
    │   ├─ notice                        → AdminNoticeManagePage
    │   ├─ player                        → AdminPlayerPage
    │   └─ quiz                          → AdminQuizPage
    └─ community                         → AdminCommunityPage
```

PublicRoutes 내 주석 처리된 라우트들 (현재 비활성, 코드 잔존): `notice`(중첩), `simulate`, `simulate/pitcher`, `simulate/hitter`, `mode/history`(과거 LegendCalendar), `privacy`, `dictionary`(중첩 home/pitcher/hitter), `kbo`. 이들은 `routePath.js`에는 없으나 lazy import로 코드는 살아있음 → ★ 분석 우선순위 신호.

AdminRoutes 내 주석 처리: `admin/content/event`, `admin/content/coupon` (도메인 코드는 아직 일부 존재하나 라우트 미등록).

## 도메인 추정

| 도메인 후보 | 폴더 경로 | 관련 라우트 | PC/모바일/혼재 | 비고 |
|---|---|---|---|---|
| home | `web/src/domains/home/` | `/` | 모바일 (mobile/ 없이 components/만, MOCK_*만 사용) | ★ 진입점. mock 의존 강함, 백엔드 미연결 추정. `domains/mobile/home/`와 중복 의심 |
| community | `web/src/domains/community/` | `/community`, `/admin/community` | 혼재 (mobile/ + page/ + feature/) | ★ 가장 큰 도메인. PC 레거시(feature/admin, page/) + 모바일 신규(mobile/) 공존. store/thunks 다수 |
| historyMode | `web/src/domains/historyMode/` | `/mode/history` | 모바일 전용 (mobile/만) | 리뉴얼 완료 흔적. 토큰 scss 분리됨 |
| events | `web/src/domains/events/` | `/events` | 모바일 (mobile/ + store admin/public 분리) | 라우터에 등록됨. admin 라우트는 주석 |
| coupons | `web/src/domains/coupons/` | `/coupons` | 모바일 (mobile/ + store admin/public 분리) | admin 라우트 주석 처리. `data/CafeNotice.js` 관련 추정 |
| notices | `web/src/domains/notices/` | `/notices`, `/notice/:id`, `/admin/content/notice` | 혼재 (mobile/ + feature/admin) | 모바일 사용자측 + PC 어드민 |
| authentication | `web/src/domains/authentication/` | `/auth/callback` | 분류 불가 (mobile/page 구분 없음, callback/hooks/store만) | 인프라성 도메인 |
| profile | `web/src/domains/profile/` | `/mypage` | 분류 불가 (page/만 존재, mobile/ 없음) | scss 1개. 분량 적음. 모바일 리뉴얼 미진행 추정 |
| admin | `web/src/domains/admin/` | `/admin`, `/admin/users`, `/admin/users/:userId` | PC 전용 (pages/, feature/) | 어드민 진입 도메인. mobile/ 없음 |
| dictionary | `web/src/domains/dictionary/` | (라우트 주석 처리됨) | PC 전용 (page/, feature/) | ⚠️ 라우트 비활성. 코드량은 큼 (skill/recommend/team/coach/player view 다수) |
| kbo | `web/src/domains/kbo/` | (라우트 주석 처리됨) | PC 추정 (feature/public/) | ⚠️ 라우트 비활성. 코드는 신규 추정 (KBO 도메인 메모와 매칭) |
| playerCard | `web/src/domains/playerCard/` | `/admin/content/player` | PC 전용 (feature/admin/) | 어드민 전용. 모바일 미진행 |
| quiz | `web/src/domains/quiz/` | `/admin/content/quiz` | PC 전용 (feature/admin/) | 어드민 전용. public store 존재 (소비처는 home의 MOCK_QUIZ 추정) |
| simulate | `web/src/domains/simulate/` | (라우트 주석 처리됨) | PC 전용 (page/, feature/) | ⚠️ 라우트 비활성. 코드량 큼 (HitterSkillChange/PitcherSkillChange/SkillSimulator) |
| mobile | `web/src/domains/mobile/` | (직접 라우트 없음) | 모바일 (공용 mobile UI/페이지 모음) | ⚠️ "도메인" 이라기보다 모바일 전용 공용 컴포넌트 묶음. `mobile/home/pages/MobileHomePage.jsx`는 사용처 미확인 — `domains/home/`과 충돌 가능 |

## 비도메인 폴더

- `web/src/app/` — 진입점, 라우터, AppWrapper, MobileLayout, AppProvider, store/operation, analytics, page wrapper(`HomePage`, `CommunityPage` 등 도메인 Screen 호출용 얇은 래퍼), wrapper/parts(Header/Footer 레거시 PC 부품 추정)
- `web/src/global/` — layout(adminPageLayout, contentPageLayout, userLayout, callBack), ui(badge, cardSwiper, navigationCard, contentPageHeader, mobile/section, navigation/tabs, responseModal, metaHeader 등), styles(base/components/mixins/semantic/variables — 디자인 토큰), utils(crypto, datetime, skill), handler, hooks
- `web/src/core/` — `filters/` (CoreStatusFilter/CoreVisibleFilter/CoreSearchFilter + useFilterPipline). 어드민 테이블 필터 공용
- `web/src/meta/` — `usePageMeta` 훅 + `pages/dictionary.meta.js` (페이지 메타/타이틀)
- `web/src/shared/` — `hooks/useScrollLock.js` 만 존재. ⚠️ 거의 빈 폴더
- `web/src/infra/` — `uploads/store/` (업로드 인프라 store)
- `web/src/assets/` — 정적 리소스 (dictionary, legend, new, quiz)
- `web/src/data/` — mock/정적 데이터 (아래 섹션 참고)

## mock 데이터 위치

- `web/src/data/CafeNotice.js`
- `web/src/data/FunNotice.js`
- `web/src/data/HistoryMode.js`
- `web/src/data/community/{categories.js, hotPosts.js, notices.js, posts.js}`
- `web/src/data/historyMode/{LegendMeta.js, LegendStuff.js}`
- `web/src/data/skill/{HITTER_POINTS.js, HITTER_RECOMMEND.js, HITTER_SKILLS.js, PITCHER_RECOMMEND.js, pitcherComboPresets.js, pitcherPositionScore.js, pitcherSkillMeta.js}`
- `web/src/domains/home/config/{MOCK_POSTS.js, MOCK_QUIZ.js, MOCK_TEAM_POSTS.js, QUICK_MENUS.js}` — home 도메인 로컬 mock

## 모호한 영역

- `web/src/domains/mobile/` — 도메인이라기보다 **모바일 공용 컴포넌트 모음**. `mobile/home/pages/MobileHomePage.jsx`가 라우트에서 직접 참조되지 않음 → `domains/home/`과 역할 중복 의심. ⚠️ analyzer에서 사용처 체크 필요
- `web/src/domains/home/` — `mobile/` 하위가 없고 `components/`에 바로 `HomeScreen`이 있음. 다른 도메인은 `mobile/` 폴더로 모바일을 분리하는데 home만 다름 → 컨벤션 불일치
- `web/src/domains/authentication/` — `callback/`, `hooks/`, `store/`만 존재. mobile/page/feature 구분 안 함. **인프라성** 도메인
- `web/src/domains/profile/` — `page/`만 존재. PC/모바일 둘 다 아닌 단일. 분류 불가
- `web/src/shared/` — 훅 1개. 빈 폴더 수준 (사용 흔적 거의 없음)
- `web/src/app/wrapper/parts/{Header.jsx, Footer.jsx}` — PC 레거시 파트로 추정되나 실제 사용처는 코드 헤더만으로 미확인
- `web/src/domains/dictionary/`, `web/src/domains/kbo/`, `web/src/domains/simulate/` — 라우트가 모두 주석 처리됨. 코드는 살아있고 store도 정상 → **재진입 대기 / 마이그레이션 보류** 상태로 추정
- `web/src/domains/community/feature/components/user/post/{pc,mobile}/` — 한 도메인 내부에서 PC/모바일이 추가로 갈리는 패턴 (혼재의 끝판). analyzer 시 정리 필요

## 분석 우선순위 제안

1. ★ **community** — 가장 큰 도메인. PC(`feature/`+`page/`) + 모바일(`mobile/`) + 어드민이 모두 살아있고 혼재. store/thunks 4개로 분할. 모바일 전환 시급도 **높음** (currentTask가 community 모바일 리뉴얼 중)
2. ★ **home** — 라우트 진입점이고 mock 의존 강함. `domains/mobile/home/`과 중복 가능성 → 정리 필요
3. ★ **dictionary** / **simulate** / **kbo** — 라우트 주석 처리됨. 살릴지 버릴지 결정 필요. 코드량은 dictionary, simulate 둘 다 큼 (⚠️)
4. **notices** — mobile + feature/admin 혼재. 모바일 진영은 안정화된 패턴(Screen + components + containers + hooks)
5. **events / coupons** — 모바일 패턴이 깔끔(mobile/ + store admin/public 분리). admin 라우트만 주석 → 어드민 미구현
6. **historyMode** — 모바일 단일, 메모상 리뉴얼 완료. 우선순위 낮음 (안정)
7. **admin / playerCard / quiz** — PC 어드민 진영. 모바일 전환 대상 아님 (전환 시급도 낮음)
8. **profile / authentication** — 분량 작음. 모바일 전환 시 단일 화면 패턴 결정만 하면 됨
9. **mobile (도메인)** — ⚠️ 도메인이 아닐 가능성. analyzer가 결정해야 함 (공용으로 승격 vs 흡수 vs 폐기)

### PC/모바일 분기 핵심 패턴 (요약)

- **공식 패턴**: `domains/{name}/mobile/` 신규 + `domains/{name}/{feature,page}/` PC 레거시 공존. 진입은 `app/page/{Name}Page.jsx`라는 얇은 wrapper가 mobile Screen을 호출 (예: `HomePage → HomeScreen`, `CommunityPage → CommunityScreen`)
- **PC/모바일 분기 위치**: 라우터 단이 아닌 **`AppWrapper` → `MobileLayout`** 내부에서 분기 (현재 코드상 모든 라우트가 MobileLayout으로 감싸짐)
- **변종**: `home`은 `mobile/` 없이 `components/`에 바로 Screen, `dictionary/simulate/kbo`는 `mobile/`이 아예 없는 PC 전용 (라우트 주석 처리)
- **community 내부**: `feature/components/user/post/{pc,mobile}/`처럼 한 도메인 안에서 추가 분기되는 케이스도 존재

---

## ★ Owner 확정 (오너 의도 — 모호 영역 해소)

> Scout 가 추정/모호로 남긴 항목에 대한 오너 의도. analyzer 단계는 이걸 사실(constraint)로 받아들이고 진행한다.

### 1. 라우트 주석 처리 (`dictionary`, `simulate`, `kbo`, 일부 admin) — **구 legacy PC 라우터**
- 의도: 주석 처리된 라우트는 모두 **구 legacy PC 버전 라우터**. 모바일 기준으로 신규로 찍은 애들만 살아있음
- 현재 상태:
  - `dictionary` / `simulate` / `kbo` — **PC 레거시. 거의 미사용**. 코드는 기능 참고 용도로 잔존
  - admin 쪽 주석화 (`admin/content/event`, `admin/content/coupon`) — 디자인이 없어서 일단 api 연결된 채로 두거나 일부 admin 페이지는 삭제됨 (구분해서 확인 필요)
- 후속 결정:
  - dictionary/simulate/kbo: 살릴지 버릴지 결정 미정. 살린다면 모바일 기준으로 재작성 필요
  - admin: 디자인 확정 후 신규 진행 (현재는 미진행)
- analyzer 가 알아야 할 점:
  - 주석 라우트 = "운영 미사용" 으로 전제 OK
  - **완전 삭제 금지** — 코드는 기능 참고 용도라 살려둠 (PC 어떻게 동작했는지 보는 용)

### 2. 한 도메인 내부 PC/모바일 추가 분기 (예: `community/feature/components/user/post/{pc,mobile}/`) — **PC 코드 기능 참고용 잔존**
- 의도: PC 코드를 유지하면서 **기능이 어떻게 생겨먹었는지 보려고** 둔 케이스. 거의 PC 버전은 안 씀
- PC 버전 사용 형태: 사용한다면 **구현된 api 정도만**. sample 작업 후 추후 변경하는 방식
- 후속 결정: 모바일 신규 작업 마무리되면 PC 부분 정리. 지금은 참고용으로 보존
- analyzer 가 알아야 할 점:
  - 이런 PC 분기는 **운영 트래픽 거의 0** 으로 전제
  - "BE api 호출 흔적이 있다" = 라이브 운영 의미가 아니라 "신규 작업 시 참고용 호출" 일 수 있음 → reconciler 가 BE 측 cite 보고 판정

### 3. `community` 도메인 거대화 — **분석 후 별도 계획 예정**
- 의도: 도메인이 너무 커서 오너 본인도 헷갈리는 상태
- 후속 결정: **분석(analyzer/reconciler) 끝난 다음 별도 계획 잡을 예정**
- analyzer 가 알아야 할 점:
  - community 는 우선순위 1 로 분석하되, 결론에 "정리 권장" 만 적고 **구체적 정리 액션은 보류**
  - PC(`feature/`+`page/`) + 모바일(`mobile/`) + 어드민 + store/thunks 4개 모두 살아있음 — 그대로 매핑만 하고 판단은 별도 라운드

### 4. `coupons` / `events` — **신규 모바일 폴더/jsx 구조의 표준 (다른 도메인 정렬 기준)**
- 의도: `domains/coupons/` 와 `domains/events/` 는 **신규 모바일 기준 폴더/jsx/js 구조를 아주 잘 잡아둔 상태**. 이것이 **다른 도메인 정렬 기준**
- 표준 구조 요점 (오너 확정):
  - `mobile/` 하위에 Screen + components + containers + hooks
  - `store/` 는 `admin/` 와 `public/` 분리
  - admin 라우트 주석 처리 = admin 화면 디자인 미진행 상태 (코드만 일부 잔존)
- 후속 결정: 다른 도메인을 이 패턴으로 맞춰가야 함. **admin 영역만 추가 필요**
- analyzer 가 알아야 할 점:
  - 분석 보고서에 "coupons/events 패턴과의 일치도" 컬럼 또는 항목을 넣으면 reconciler 단계에서 정리 우선순위 자동 도출 가능

### 5. `home` — **공식 패턴 변종 (`mobile/` 없이 `components/`)**
- 의도: home 만 다른 도메인과 컨벤션 다름. 진입점이라 일찍 만들어졌고, 그 후 다른 도메인이 `mobile/` 패턴으로 정착하는 동안 정리 안 됨 (오너 추정 — 명시 의도는 없음)
- 후속 결정: 표준 패턴(`coupons/events`) 으로 맞춰갈 후보. 단 진입점이라 이동 시 영향 큼
- analyzer 가 알아야 할 점:
  - `domains/home/components/HomeScreen.jsx` 가 사실상의 모바일 Screen
  - `domains/mobile/home/pages/MobileHomePage.jsx` 와 역할 중복 의심 → 사용처 확인 필요 (둘 중 하나는 dead 가능성)

### 6. `domains/mobile/` — **도메인 아닌 모바일 공용 컴포넌트 묶음 추정**
- 의도 (오너 명시는 없으나 위 5번과 연결): 모바일 공용 모음 폴더로 보임. 단 `mobile/home/pages/MobileHomePage.jsx` 가 home 도메인과 중복되어 정리 필요
- 후속 결정: analyzer 단계에서 사용처 확인 후 (a) 공용으로 승격 vs (b) `domains/home/` 등 해당 도메인으로 흡수 vs (c) 폐기 결정

---

## ★ 정정 사항 (fe-map.md 본문 추정 → Owner 확정 기준 갱신)

| 본문 추정 | Owner 확정 후 분류 |
|---|---|
| 주석 처리 라우트 ★ "분석 우선순위 신호" | **구 legacy PC 라우터, 거의 미사용**. 살릴지 버릴지 별도 결정 |
| admin 라우트 주석 = "어드민 미구현" | **디자인 미진행 + 일부 페이지 삭제됨**. 코드 일부만 잔존 |
| 한 도메인 내부 PC/모바일 추가 분기 = "혼재의 끝판" | **PC 기능 참고용 잔존, 거의 트래픽 0** |
| community 분석 우선순위 1 | 우선순위 1 유지, 단 **결론은 매핑까지만** (정리 액션은 별도 라운드) |
| coupons / events = 단순 모바일 도메인 | ★ **표준 패턴 (다른 도메인 정렬 기준)** |

---

## ★ 분석 진입 전 필요 작업 (오너 결정사항)

- [ ] `be-map.md` 수정 보류 — 오너가 직접 결정 (DB 변경점 + FE 변경점 반영 필요)
- [ ] `domains.md` 작성 — 위 Owner 확정 반영 + 표준 패턴(coupons/events) 기준으로 도메인 정의
- [ ] community 분석 결과 보고 후 별도 계획 라운드 일정
