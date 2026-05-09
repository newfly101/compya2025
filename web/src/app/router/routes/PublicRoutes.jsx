import React, { lazy } from "react";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
import AuthCallback from "@/domains/authentication/callback/AuthCallBack.jsx";
const HomePage = lazy(() => import("@/domains/home/components/HomeScreen.jsx"));
const CouponPage = lazy(() => import("@/domains/coupons/mobile/CouponScreen.jsx"));
const EventPage = lazy(() => import("@/domains/events/mobile/EventScreen.jsx"));
const NoticePage = lazy(() => import("@/domains/notices/mobile/NoticeScreen.jsx"));
const NoticeDetailPage = lazy(() => import("@/domains/notices/mobile/NoticeDetailScreen.jsx"));
const HistoryModePage = lazy(() => import("@/domains/historyMode/mobile/HistoryModeScreen.jsx"));
// community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조)
// CommunityPage 는 community IA 재개 시 도메인 mobile/feature 흡수 후 재도입

// LEGACY kbo 도메인 잠정 보류 — 2026-05-09 (frontend kbo 화면 폐기. BE API 미구현 / DB 는 kbocrol 운영)
// const KBOLeaguePage = lazy(() => import("@/domains/kbo/feature/public/pages/KBOLeaguePage.jsx"));
// const EventListPage = lazy(() => import("@/domains/events/feature/public/pages/EventListPage.jsx"));


// simulate 도메인 폐기 (legacy PC) — 2026-05-09 (사용자 특화 컨텐츠 240명 user 기반 신규 기획 IA 후 모바일 재구현. docs/prd/domains/simulate.md TODO 참조)
// const SkillSimulator = lazy(() => import("@/domains/simulate/page/SkillSimulator.jsx"));
// const PitcherSkillChange = lazy(() => import("@/domains/simulate/page/skillChange/PitcherSkillChange.jsx"));
// const HitterSkillChange = lazy(() => import("@/domains/simulate/page/skillChange/HitterSkillChange.jsx"));
// PrivacyPolicy 폐기 (2026-05-09) — line 54 dead route chain (`{ path: "privacy", ... }` 주석) 만 사용. `app/page/legal/` 폴더 통째 폐기
// dictionary 도메인 폐기 (legacy PC) — 2026-05-09 (기획 IA 후 모바일 재구현. docs/prd/domains/dictionary.md TODO 참조)
// const DictionaryHome = lazy(() => import("@/domains/dictionary/page/DictionaryHomePage.jsx"));
// const Dictionary = lazy(() => import("@/domains/dictionary/page/DictionaryPage.jsx"));


export const PublicRoutes = [
  { index: true, element: <HomePage />, handle: ROUTE_META.HOME.title },
  { path: ROUTE_META.AUTH_CALL_BACK.path, element: <AuthCallback /> },
  { path: ROUTE_META.COUPONS.path, element: <CouponPage />, handle: ROUTE_META.COUPONS.title},
  { path: ROUTE_META.EVENTS.path, element: <EventPage />, handle: ROUTE_META.EVENTS.title}, // 새로 만들어야 함
  { path: ROUTE_META.NOTICES.path, element: <NoticePage />, handle: ROUTE_META.NOTICES.title },
  { path: ROUTE_META.NOTICE_DETAILS.path, element: <NoticeDetailPage />, handle: ROUTE_META.NOTICE_DETAILS },
  { path: ROUTE_META.HISTORY_MODE.path, element: <HistoryModePage />, handle: ROUTE_META.HISTORY_MODE.title},
  // community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조)
  // community IA 재개 시 ROUTE_META.COMMUNITY + 도메인 mobile/feature 흡수 후 재도입

  // {
  //   path: "notice",
  //   element: <NoticeLayout />,
  //   children: [
  //     { index: true, element: <FunNoticeList />, handle: { title: "컴프야펀 | 펀 공지사항" } },
  //     { path: "official", element: <OfficialNoticeList />, handle: { title: "컴프야펀 | 공식 공지사항" }  },
  //     { path: "events", element: <EventListPage />, handle: { title: "컴프야펀 | 공식 이벤트" }  },
  //     { path: "coupons", element: <CouponListPage />, handle: { title: "컴프야펀 | 쿠폰 코드" }  },
  //   ],
  // },
  // { path: "notice/:id", element: <FunNoticePage /> },
  // { path: "simulate", element: <SkillSimulator />, handle: { title: "컴프야펀 | 스킬 변경 시뮬레이터" } },
  // { path: "simulate/pitcher", element: <PitcherSkillChange />, handle: { title: "컴프야펀 | 투수 고스변 시뮬레이터" } },
  // { path: "simulate/hitter", element: <HitterSkillChange />, handle: { title: "컴프야펀 | 타자 고스변 시뮬레이터" } },
  // { path: "mode/history", element: <LegendCalendar />, handle: { title: "컴프야펀 | 히스토리 모드 레전드 재료" } },
  // PrivacyPolicy route 폐기 (2026-05-09) — `app/page/legal/PrivacyPolicy.jsx` + `legal.module.scss` 폴더 통째 폐기
  // { path: "auth/callback", element: <AuthCallBack />, handle: { title: "컴프야펀 | 로그인 콜백" } },
  //
  // { path: "dictionary", children: [
  //     {index: true, element: <DictionaryHome />, handle: { title: "컴프야펀 | 백과사전 홈" } },
  //     { path: "pitcher", element: <Dictionary />, handle: { title: "컴프야펀 | 투수 스킬 백과사전" } },
  //     { path: "hitter", element: <Dictionary />, handle: { title: "컴프야펀 | 타자 스킬 백과사전" } },
  //   ]
  // },
  // { path: "kbo" , element: <KBOLeaguePage />, handle: {title: "컴프야펀 | KBO 승부예측"} }
];
