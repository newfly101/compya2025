# 라우트 → Screen 트리

> 진입: `web/src/main.jsx` → `RouterProvider router={router}` → `web/src/app/router/index.jsx` → `AppWrapper` → `MobileLayout` → `<Outlet />`
> 라우터 정의: `web/src/app/router/routes/{PublicRoutes,UserRoutes,AdminRoutes}.jsx`
> 라우트 메타: `web/src/app/router/config/{routePath.js, routeMeta.js}`
> 페이지 wrapper: `web/src/app/page/*Page.jsx` — 거의 모두 1줄 wrapper (도메인 Screen 호출용)
> **PC/모바일 분기 위치**: 라우터 단이 아닌 **`AppWrapper` → `MobileLayout`** 내부. 현재 모든 라우트가 동일하게 `MobileLayout` 으로 감싸짐. 즉 `AppWrapper.jsx:6` 은 `MobileLayout` 만 렌더하고 PC/모바일 분기 코드가 없음 (실제로는 모바일 단일 레이아웃)

## 글로벌 레이아웃

```
AppProvider (Provider + AuthProvider + ResponseListener)         # web/src/app/provider/AppProvider.jsx
└── RouterProvider
    └── AppWrapper                                                # web/src/app/wrapper/AppWrapper.jsx (useGA4PageView)
        └── MobileLayout                                          # web/src/app/wrapper/mobile/MobileLayout.jsx
            ├── TopBarProvider                                    # web/src/app/provider/TopBarProvider.jsx
            ├── TopBar                                            # web/src/app/wrapper/mobile/parts/TopBar.jsx (variant: home|page)
            ├── Drawer                                            # web/src/app/wrapper/mobile/parts/Drawer.jsx (MENU_GROUPS)
            └── Suspense
                └── <Outlet />  ← 라우트 element 마운트 지점
```

## Public 라우트

| Path | element (PageWrapper) | 진입 Screen | depth 2~3 트리 | mock-only? |
|---|---|---|---|---|
| `/` | `HomePage` (`web/src/app/page/HomePage.jsx`) | `HomeScreen` (`web/src/domains/home/components/HomeScreen.jsx`) | HeroSection, QuickSection, QuizSection (mock), CouponListHorizontal (live), NoticeSection (live), EventListHorizontal (live), PostRow×N (mock 인기글), PostRow×N (mock 자유게시판) | **부분 mock** (quiz / 커뮤니티 인기글 / 자유게시판 mock; 나머지는 BE 연결) |
| `/auth/callback` | `AuthCallback` (`web/src/domains/authentication/callback/AuthCallBack.jsx`) | (no UI — `return null`, healthCheck 후 `redirectPath` 로 replace) | — | n/a (인프라) |
| `/coupons` | `CouponPage` | `CouponScreen` (`web/src/domains/coupons/mobile/CouponScreen.jsx`) | SectionBlock×2 → CouponListVertical → CouponCard×N | live (`/coupons` GET) |
| `/events` | `EventPage` | `EventScreen` (`web/src/domains/events/mobile/EventScreen.jsx`) | SectionBlock×2 → EventListVertical → EventCard×N | live (`/events/external` GET) |
| `/notices` | `NoticePage` | `NoticeScreen` (`web/src/domains/notices/mobile/NoticeScreen.jsx`) | SectionBlock×3 → NoticeCard / NoticeListVertical / OfficialNoticeListVertical | live (`/notices` GET) |
| `/notice/:id` | `NoticeDetailPage` | `NoticeDetailScreen` (`web/src/domains/notices/mobile/NoticeDetailScreen.jsx`) | hero img + LabelBadge + 메타/요약/본문 | live (재사용 `/notices` GET) |
| `/mode/history` | `HistoryModePage` | `HistoryModeScreen` (`web/src/domains/historyMode/mobile/HistoryModeScreen.jsx`) | filterSection (Chip×N), summary, StageCard×N, detail | **mock-only** (`@/data/historyMode/*`) |
| `/community` | `CommunityPage` | `CommunityScreen` (`web/src/domains/community/mobile/CommunityScreen.jsx`) | CategoryChip row, 분기: `selectedCategory==="all"` → Section×3 (PostRow / HotPostCard / PostRow), 그 외 → `CategoryScreen` (`web/src/domains/community/mobile/CategoryScreen.jsx`) | **mock-only** (`@/data/community/*`) |

## 인증 보호 (USER+ADMIN)

| Path | element | Screen | mock-only? |
|---|---|---|---|
| `/mypage` | `UserProfile` (`web/src/domains/profile/page/UserProfile.jsx`) | UserProfile (auth state 만 사용, 별도 fetch 없음) | n/a (auth state) |

## ADMIN 라우트

> 모두 AdminPageLayout 안에 mount. **PC 어드민 (Owner 확정: 모바일 전환 대상 아님)**

```
/admin (AdminPageLayout)                                          # web/src/global/layout/adminPageLayout/AdminPageLayout.jsx
├─ index             AdminDashBoardPage                           # web/src/domains/admin/pages/dashboard/AdminDashBoardPage.jsx
├─ users             AdminUserManagePage                          # web/src/domains/admin/pages/user/AdminUserManagePage.jsx
├─ users/:userId     AdminUserDetailPage                          # web/src/domains/admin/pages/user/AdminUserDetailPage.jsx
├─ content           AdminContentPage                             # web/src/global/layout/adminPageLayout/content/AdminContentPage.jsx (Outlet)
│   ├─ notice        AdminNoticeManagePage                        # web/src/domains/notices/feature/components/admin/AdminNoticeManagePage.jsx
│   ├─ player        AdminPlayerPage                              # web/src/domains/playerCard/feature/admin/pages/AdminPlayerPage.jsx
│   └─ quiz          AdminQuizPage                                # web/src/domains/quiz/feature/admin/pages/AdminQuizPage.jsx
└─ community         AdminCommunityPage                           # web/src/domains/community/page/admin/AdminCommunityPage.jsx
                       └── CommunityManagePage                    # web/src/domains/community/feature/components/admin/CommunityManagePage.jsx (BoardAdminTable, PostAdminTable, TagAdminTable + tabs)
```

## 라우트 주석 (구 PC legacy — Owner 확정 = 운영 미사용, 코드 잔존)

`PublicRoutes.jsx` 내 주석 (`web/src/app/router/routes/PublicRoutes.jsx:36-61`):

| 주석 라우트 | 진입 컴포넌트 | 코드 위치 | Live? |
|---|---|---|---|
| `notice` (children) | `NoticeLayout`, `FunNoticeList`, `OfficialNoticeList`, `EventListPage`, `CouponListPage` | (NoticeLayout 만 잔존: `web/src/app/page/notice/NoticeLayout.jsx` — 그 외는 import 자체가 주석) | ❌ |
| `notice/:id` | `FunNoticePage` | (lazy import 자체가 주석) | ❌ |
| `simulate`, `simulate/pitcher`, `simulate/hitter` | `SkillSimulator`, `PitcherSkillChange`, `HitterSkillChange` | `web/src/domains/simulate/page/*.jsx` | ❌ legacy PC |
| `mode/history` (구) | `LegendCalendar` (lazy import 주석, 파일 미존재 추정) | — | ❌ (현재 라우트는 모바일 `HistoryModeScreen` 으로 활성) |
| `privacy` | `PrivacyPolicy` (`web/src/app/page/legal/PrivacyPolicy.jsx`) | 잔존 | ❌ |
| `auth/callback` (중복) | `AuthCallBack` (`web/src/global/layout/callBack/AuthCallBack.jsx`) | 잔존 (실제 라우트는 `web/src/domains/authentication/callback/AuthCallBack.jsx` 가 활성) | ❌ — global/layout 쪽은 dead |
| `community` (구) | `UserCommunityPage` (`web/src/domains/community/page/user/UserCommunityPage.jsx`) → `CommunityPage` (feature/components/user) | 잔존, BE thunk 살아있음 (`requestGetUserBoardLists`, `requestGetUserPostListsByBoardId`) | ❌ legacy PC, 라우트 미등록 |
| `dictionary` (children: home / pitcher / hitter) | `DictionaryHomePage`, `DictionaryPage` | `web/src/domains/dictionary/page/*.jsx` | ❌ legacy PC |
| `kbo` | `KBOLeaguePage` | `web/src/domains/kbo/feature/public/pages/KBOLeaguePage.jsx` | ❌ legacy PC |

`AdminRoutes.jsx` 내 주석:

| 주석 라우트 | 진입 컴포넌트 | Live? |
|---|---|---|
| `admin/content/event` | `AdminEventPage` (lazy import 주석 / 파일 미존재 — `web/src/domains/events/feature/admin/pages/AdminEventPage.jsx` 없음) | ❌ Owner 확정: 디자인 미진행, 일부 페이지 삭제됨 |
| `admin/content/coupon` | `AdminCouponListPage` (lazy import 주석 / 파일 미존재) | ❌ |

## PC/모바일 분기 정리

- **라우터 단 분기 없음**: 한 path 당 한 Screen. `MobileLayout` 단일 레이아웃
- **도메인 단 분기 (모바일 표준)**: `domains/{name}/mobile/{Name}Screen.jsx` 가 진입 (coupons/events/notices/historyMode/community) — `app/page/{Name}Page.jsx` 는 1줄 wrapper
- **변종 (home)**: `domains/home/mobile/` 가 없고 `domains/home/components/HomeScreen.jsx` 가 직접 진입
- **혼재 (community 한정)**: `feature/components/user/post/{pc,mobile}/` 처럼 도메인 내부에서 PC/모바일 분기. 단 이 코드는 라우트에 등록되지 않은 PC `UserCommunityPage` 에서만 사용 (Owner 확정: PC 코드 기능 참고용 잔존)

## coupons/events 표준 패턴 (★ 정렬 기준)

```
domains/{coupons|events}/
├── mobile/
│   ├── {Coupon|Event}Screen.jsx       # 라우트 진입
│   ├── components/
│   │   └── {couponCard|eventCard}/    # 단일 카드 컴포넌트
│   ├── containers/
│   │   └── public/
│   │       ├── {Coupon|Event}ListHorizontal.jsx   # home 미니
│   │       └── {Coupon|Event}ListVertical.jsx     # 전체 리스트
│   └── hooks/
│       └── use{Coupon|Event}List.js   # dispatch + selector
└── store/
    ├── admin/    { api.js, endpoints.js, thunks.js }
    ├── public/   { api.js, endpoints.js, thunks.js }
    ├── slices.js (admin/public 통합 reducer)
    └── dto.js (events 만)
```

## 도메인별 표준 일치도 (coupons/events 기준)

| 도메인 | mobile/Screen | mobile/components | mobile/containers | mobile/hooks | store admin/public 분리 | 일치도 |
|---|---|---|---|---|---|---|
| **coupons** | ✅ | ✅ | ✅ | ✅ | ✅ | ★ 표준 |
| **events** | ✅ | ✅ | ✅ | ✅ | ✅ | ★ 표준 |
| **notices** | ✅ | ✅ (noticeCard, officialNoticeCard) | ✅ (NoticeListVertical, OfficialNoticeListVertical) | ✅ (useNoticeList, useNoticeDetail) | ✅ | **표준 거의 일치** (admin 구조만 `feature/components/admin/` 로 다른 위치) |
| **historyMode** | ✅ | ✅ (chip, stageCard) | ❌ | ✅ (useHistoryMode) | ❌ store 자체 없음 (mock-only) | mock 단독, 표준과 다름 — 메모상 리뉴얼 완료 |
| **community** | ✅ (CommunityScreen + CategoryScreen) | ✅ (boardTagBadge, categoryChip, communityBadge, hotPostCard, postRow, section) | ❌ (containers 폴더 없음) | ✅ (useCommunity, useCategoryFeed) | ✅ (admin/user thunks 분리, slices 통합) | **부분 일치** — mobile 화면은 mock, BE thunks 는 PC 레거시 전용 |
| **home** | ❌ (`mobile/` 없음, `components/` 직접) | (section/{hero,notice,quick,quiz}) | ❌ (다른 도메인의 containers 차용) | ❌ (다른 도메인의 hooks 차용) | ❌ store 자체 없음 | **변종** — 표준과 거리 있음 |
| **profile** | ❌ (`page/UserProfile.jsx` 만, mobile 폴더 없음) | ❌ | ❌ | ❌ | ❌ | 단일 화면, 분량 작음 |
| **authentication** | n/a (인프라성, callback/hooks/store) | — | — | ✅ (useAuthentication) | store/ flat (admin/public 분리 없음) | n/a |
| **admin** | ❌ (PC 전용, pages/) | feature/components/toggle | ❌ | ❌ | store flat | PC 어드민 단독 — 모바일 전환 대상 아님 |
| **dictionary / simulate / kbo** | ❌ (PC 전용, page/feature/) | feature/components | ❌ | feature/hooks | store flat (kbo 만 public 분리) | legacy PC, 라우트 주석 |
| **playerCard / quiz** | ❌ (PC 어드민 전용) | feature/admin/components | ❌ | feature/admin/hooks | ✅ admin/public 분리 (quiz), admin only (playerCard) | PC 어드민 단독 |
