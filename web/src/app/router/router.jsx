import { createBrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import { lazy } from "react";
import UserGuard from "@/app/router/UserGuard.jsx";
import AdminGuard from "@/app/router/AdminGuard.jsx";
import AdminUserManagePage from "@/domains/admin/pages/user/AdminUserManagePage.jsx";
import AdminUserDetailPage from "@/domains/admin/pages/user/AdminUserDetailPage.jsx";
import AdminContentPage from "@/domains/admin/pages/content/AdminContentPage.jsx";
import AdminNoticeManagePage from "@/domains/notices/feature/components/admin/AdminNoticeManagePage.jsx";
import AdminEventManagePage from "@/domains/events/page/admin/AdminEventManagePage.jsx";
import AdminDashBoardPage from "@/domains/admin/pages/dashboard/AdminDashBoardPage.jsx";
import AdminLayout from "@/domains/admin/layout/AdminLayout.jsx";
import AdminCouponManagePage from "@/domains/coupons/page/admin/AdminCouponManagePage.jsx";

const UserProfile = lazy(() => import("@/domains/profile/page/UserProfile.jsx"));
const AuthCallBack = lazy(() => import("@/global/layout/callBack/AuthCallBack.jsx"));
const LegendCalendar = lazy(() => import("@/domains/historyMode/page/LegendCalendar.jsx"));
const Home = lazy(() => import("@/app/page/home/Home.jsx"));
const Notice = lazy(() => import("@/domains/notices/page/Notice.jsx"));
const FunNoticePage = lazy(() => import("@/domains/notices/page/funNotice/FunNoticePage.jsx"));

const SkillSimulator = lazy(() => import("@/domains/simulate/page/SkillSimulator.jsx"));
const PitcherSkillChange = lazy(() => import("@/domains/simulate/page/skillChange/PitcherSkillChange.jsx"));
const HitterSkillChange = lazy(() => import("@/domains/simulate/page/skillChange/HitterSkillChange.jsx"));

const Dictionary = lazy(() => import("@/domains/dictionary/page/Dictionary.jsx"));
const PitcherDictionary = lazy(() => import("@/domains/dictionary/page/PitcherDictionary.jsx"));
const HitterDictionary = lazy(() => import("@/domains/dictionary/page/HitterDictionary.jsx"));

const TipPage = lazy(() => import("@/domains/tipBoard/page/TipPage.jsx"));
const PrivacyPolicy = lazy(() => import("@/app/page/legal/PrivacyPolicy.jsx"));

const router = createBrowserRouter([
  {
    path: "/",

    element: <App />,
    children: [
      { index: true, element: <Home />, handle: { title: "컴프야펀 | 홈" } },
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
                  { path: "event", element: <AdminEventManagePage />, handle: { title: "컴프야펀 | 어드민 | 이벤트 관리" } },
                  { path: "notice", element: <AdminNoticeManagePage />, handle: { title: "컴프야펀 | 어드민 | 공지 관리" } },
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
