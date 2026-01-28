import { createBrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import { lazy } from "react";
import UserGuard from "@/router/UserGuard.jsx";
import AdminGuard from "@/router/AdminGuard.jsx";
import AdminUserManagePage from "@/domains/admin/pages/user/AdminUserManagePage.jsx";
import AdminUserDetailPage from "@/domains/admin/pages/user/AdminUserDetailPage.jsx";
import AdminContentPage from "@/domains/admin/pages/content/AdminContentPage.jsx";
import AdminNoticeManagePage from "@/domains/admin/pages/content/AdminNoticeManagePage.jsx";
import AdminEventManagePage from "@/domains/admin/pages/content/AdminEventManagePage.jsx";
import AdminCouponManagePage from "@/domains/admin/pages/content/AdminCouponManagePage.jsx";
import AdminDashBoardPage from "@/domains/admin/pages/dashboard/AdminDashBoardPage.jsx";
import AdminLayout from "@/domains/admin/layout/AdminLayout.jsx";

const UserProfile = lazy(() => import("@/pages/profile/UserProfile.jsx"));
const AuthCallBack = lazy(() => import("@/shared/layout/callBack/AuthCallBack.jsx"));
const LegendCalendar = lazy(() => import("@/pages/historyMode/LegendCalendar.jsx"));
const Home = lazy(() => import("@/pages/Home.jsx"));
const Login = lazy(() => import("@/pages/Login.jsx"));
const Notice = lazy(() => import("@/pages/notice/Notice.jsx"));
const FunNoticePage = lazy(() => import("@/pages/notice/funNotice/FunNoticePage.jsx"));

const SkillSimulator = lazy(() => import("@/pages/skillSimulate/SkillSimulator.jsx"));
const PitcherSkillChange = lazy(() => import("@/pages/skillSimulate/skillChange/v2/PitcherSkillChange.jsx"));
const HitterSkillChange = lazy(() => import("@/pages/skillSimulate/skillChange/v2/HitterSkillChange.jsx"));

const Dictionary = lazy(() => import("@/pages/dictionary/Dictionary.jsx"));
const PitcherDictionary = lazy(() => import("@/pages/dictionary/PitcherDictionary.jsx"));
const HitterDictionary = lazy(() => import("@/pages/dictionary/HitterDictionary.jsx"));

const TipPage = lazy(() => import("@/pages/tipCollection/TipPage.jsx"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/PrivacyPolicy.jsx"));

const router = createBrowserRouter([
  {
    path: "/",

    element: <App />,
    children: [
      { index: true, element: <Home />, handle: { title: "컴프야펀 | 홈" } },
      { path: "login", element: <Login /> },
      { path: "notice", element: <Notice /> },
      { path: "notice/:id", element: <FunNoticePage /> },
      { path: "simulate", element: <SkillSimulator />, handle: { title: "컴프야펀 | 스킬 변경 시뮬레이터" } },
      { path: "simulate/pitcher", element: <PitcherSkillChange />, handle: { title: "컴프야펀 | 투수 고스변 시뮬레이터" } },
      { path: "simulate/hitter", element: <HitterSkillChange />, handle: { title: "컴프야펀 | 타자 고스변 시뮬레이터" } },
      { path: "tips", element: <TipPage />, handle: { title: "컴프야펀 | 팁 모아보기" } },
      { path: "dictionary/pitcher", element: <PitcherDictionary />, handle: { title: "컴프야펀 | 투수 스킬 백과사전" } },
      { path: "dictionary/hitter", element: <HitterDictionary />, handle: { title: "컴프야펀 | 타자 스킬 백과사전" } },
      { path: "mode/history", element: <LegendCalendar />, handle: { title: "컴프야펀 | 히스토리 모드 레전드 재료" } },
      { path: "dictionary", element: <Dictionary />, handle: { title: "컴프야펀 | 백과사전 홈" } },
      { path: "privacy", element: <PrivacyPolicy />, handle: { title: "컴프야펀 | 개인정보처리방침" } },
      { path: "auth/callback", element: <AuthCallBack />, handle: { title: "컴프야펀 | 로그인 콜백" } },
      {
        element: <UserGuard />,
        children: [
          { path: "mypage", element: <UserProfile />, handle: { title: "컴프야펀 | 마이페이지" } },
        ],
      },
      {
        element: <AdminGuard />,
        children: [
          {
            path: "admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashBoardPage />, handle: { title: "컴프야펀 | 어드민 | 대시보드" } },
              { path: "users", element: <AdminUserManagePage />, handle: { title: "컴프야펀 | 어드민 | 유저 관리" } },
              { path: "users/:userId", element: <AdminUserDetailPage />, handle: { title: "컴프야펀 | 어드민 | 유저 상세 관리" } },
              {
                path: "content", element: <AdminContentPage />, children: [
                  { path: "notice", element: <AdminNoticeManagePage />, handle: { title: "컴프야펀 | 어드민 | 공지 관리" } },
                  { path: "event", element: <AdminEventManagePage />, handle: { title: "컴프야펀 | 어드민 | 이벤트 관리" } },
                  { path: "coupon", element: <AdminCouponManagePage />, handle: { title: "컴프야펀 | 어드민 | 쿠폰 관리" } },
                ],
              },
            ]
          },

        ],
      },
    ],
  },
]);

export default router;
