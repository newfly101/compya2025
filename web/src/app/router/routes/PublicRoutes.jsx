import React, { lazy } from "react";

const Home = lazy(() => import("@/app/page/home/Home.jsx"));
const Notice = lazy(() => import("@/domains/notices/page/Notice.jsx"));
const FunNoticePage = lazy(() => import("@/domains/notices/page/funNotice/FunNoticePage.jsx"));
const SkillSimulator = lazy(() => import("@/domains/simulate/page/SkillSimulator.jsx"));
const PitcherSkillChange = lazy(() => import("@/domains/simulate/page/skillChange/PitcherSkillChange.jsx"));
const HitterSkillChange = lazy(() => import("@/domains/simulate/page/skillChange/HitterSkillChange.jsx"));
const LegendCalendar = lazy(() => import("@/domains/historyMode/page/LegendCalendar.jsx"));
const PrivacyPolicy = lazy(() => import("@/app/page/legal/PrivacyPolicy.jsx"));
const AuthCallBack = lazy(() => import("@/global/layout/callBack/AuthCallBack.jsx"));
const UserCommunityPage = lazy( () => import ("@/domains/community/page/user/UserCommunityPage.jsx"));
const DictionaryHome = lazy(() => import("@/domains/dictionary/page/DictionaryHomePage.jsx"));
const Dictionary = lazy(() => import("@/domains/dictionary/page/DictionaryPage.jsx"));


export const PublicRoutes = [
  { index: true, element: <Home />, handle: { title: "컴프야펀 | 홈" } },
  { path: "notice", element: <Notice /> },
  { path: "notice/:id", element: <FunNoticePage /> },
  { path: "simulate", element: <SkillSimulator />, handle: { title: "컴프야펀 | 스킬 변경 시뮬레이터" } },
  { path: "simulate/pitcher", element: <PitcherSkillChange />, handle: { title: "컴프야펀 | 투수 고스변 시뮬레이터" } },
  { path: "simulate/hitter", element: <HitterSkillChange />, handle: { title: "컴프야펀 | 타자 고스변 시뮬레이터" } },
  { path: "mode/history", element: <LegendCalendar />, handle: { title: "컴프야펀 | 히스토리 모드 레전드 재료" } },
  { path: "privacy", element: <PrivacyPolicy />, handle: { title: "컴프야펀 | 개인정보처리방침" } },
  { path: "auth/callback", element: <AuthCallBack />, handle: { title: "컴프야펀 | 로그인 콜백" } },
  { path: "community", element: <UserCommunityPage />, handle: { title: "컴프야펀 | 커뮤니티" } },

  { path: "dictionary", children: [
      {index: true, element: <DictionaryHome />, handle: { title: "컴프야펀 | 백과사전 홈" } },
      { path: "pitcher", element: <Dictionary />, handle: { title: "컴프야펀 | 투수 스킬 백과사전" } },
      { path: "hitter", element: <Dictionary />, handle: { title: "컴프야펀 | 타자 스킬 백과사전" } },
    ]
  },
];
