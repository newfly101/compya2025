import { createBrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import { lazy } from "react";

const LegendCalendar = lazy(() => import("@/pages/historyMode/LegendCalendar.jsx"));
const Home = lazy(() => import("@/pages/Home.jsx"));
const Login = lazy(() => import("@/pages/Login.jsx"));
const Notice = lazy(() => import("@/pages/notice/Notice.jsx"));
const FunNoticePage = lazy(() => import("@/components/common/page/FunNoticePage.jsx"));

const SkillSimulator = lazy(() => import("@/pages/skillSimulate/SkillSimulator.jsx"));
const PitcherSkillChange = lazy(() => import("@/pages/skillSimulate/skillChange/PitcherSkillChange.jsx"));
const HitterSkillChange = lazy(() => import("@/pages/skillSimulate/skillChange/HitterSkillChange.jsx"));

const Dictionary = lazy(() => import("@/pages/dictionary/Dictionary.jsx"));
const SkillDictionary = lazy(() => import("@/components/common/page/SkillDictionary.jsx"));
const HitterSkillDictionary = lazy(() => import("@/components/common/page/HitterSkillDictionary.jsx"));

const TipPage = lazy(() => import("@/pages/TipPage.jsx"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/PrivacyPolicy.jsx"));

const router = createBrowserRouter([
  {
    path: "/",

    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: { title: "컴프야펀 | 홈" },
      },
      {
        path: "login",
        element: <Login />,
      },
      { path: "notice", element: <Notice /> },
      { path: "notice/:id", element: <FunNoticePage /> },
      { path: "simulate", element: <SkillSimulator />, handle: { title: "컴프야펀 | 스킬 변경 시뮬레이터" } },
      { path: "simulate/pitcher", element: <PitcherSkillChange />, handle: { title: "컴프야펀 | 투수 고스변 시뮬레이터" } },
      { path: "simulate/hitter", element: <HitterSkillChange />, handle: { title: "컴프야펀 | 타자 고스변 시뮬레이터" } },
      { path: "tips", element: <TipPage />, handle: { title: "컴프야펀 | 팁 모아보기" } },
      { path: "dictionary/pitcher", element: <SkillDictionary />, handle: { title: "컴프야펀 | 투수 스킬 백과사전" } },
      { path: "dictionary/hitter", element: <HitterSkillDictionary />, handle: { title: "컴프야펀 | 타자 스킬 백과사전" } },
      { path: "mode/history", element: <LegendCalendar />, handle: { title: "컴프야펀 | 히스토리 모드 레전드 재료" } },
      { path: "dictionary", element: <Dictionary />, handle: { title: "컴프야펀 | 백과사전 홈" } },
      { path: "privacy", element: <PrivacyPolicy />, handle: { title: "컴프야펀 | 개인정보처리방침" } },
    ],
  },
]);

export default router;
