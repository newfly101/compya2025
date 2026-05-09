import { lazy } from "react";
import AuthGuard from "@/app/router/guards/AuthGuard.jsx";

// global/layout/adminPageLayout 폐기 (2026-05-09) — AdminPageLayout / AdminContentPage wrap 제거. children 라우트는 유지
// LEGACY admin sample - 2026-05-09 폐기. 신규 admin 페이지는 src/domains/{domain}/feature/admin/ 패턴으로 재구현 예정 (admin home / user 관리 별도 기획)
// const AdminDashBoardPage = lazy(() => import("@/domains/admin/pages/dashboard/AdminDashBoardPage.jsx"));
// const AdminUserManagePage = lazy(() => import("@/domains/admin/pages/user/AdminUserManagePage.jsx"));
// const AdminUserDetailPage = lazy(() => import("@/domains/admin/pages/user/AdminUserDetailPage.jsx"));
// const AdminEventPage = lazy(() => import("@/domains/events/feature/admin/pages/AdminEventPage.jsx"));
const AdminNoticeManagePage = lazy(() => import("@/domains/notices/feature/components/admin/AdminNoticeManagePage.jsx"));
// community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조)
// const AdminCommunityPage = lazy(() => import("@/domains/community/page/admin/AdminCommunityPage.jsx"));
const AdminCouponListPage = lazy(() => import("@/domains/coupons/feature/admin/pages/AdminCouponListPage.jsx"));
// playerCard 도메인 폐기 (legacy PC) — 2026-05-09 (사용자 특화 컨텐츠 240명 user 기반 신규 기획 IA 후 admin 재구현. docs/prd/domains/playerCard.md TODO 참조)
// const AdminPlayerPage = lazy(() => import("@/domains/playerCard/feature/admin/pages/AdminPlayerPage.jsx"));
const AdminQuizPage = lazy(() => import("@/domains/quiz/feature/admin/pages/AdminQuizPage.jsx"));

export const AdminRoutes = [
  {
    element: <AuthGuard allow="ADMIN" />,
    children: [
      {
        path: "admin",
        children: [
          // LEGACY admin sample - 2026-05-09 폐기. 신규 admin 페이지는 src/domains/{domain}/feature/admin/ 패턴으로 재구현 예정
          // { index: true, element: <AdminDashBoardPage />, handle: { title: "컴프야펀 | 어드민 | 대시보드" } },
          // { path: "users", element: <AdminUserManagePage />, handle: { title: "컴프야펀 | 어드민 | 유저 관리" } },
          // { path: "users/:userId", element: <AdminUserDetailPage />, handle: { title: "컴프야펀 | 어드민 | 유저 상세 관리" } },
          {
            path: "content", children: [
              // { path: "event", element: <AdminEventPage />, handle: { title: "컴프야펀 | 어드민 | 이벤트 관리" } },
              { path: "notice", element: <AdminNoticeManagePage />, handle: { title: "컴프야펀 | 어드민 | 공지 관리" } },
              { path: "coupon", element: <AdminCouponListPage />, handle: { title: "컴프야펀 | 어드민 | 쿠폰 관리" } },
              // playerCard 도메인 폐기 (legacy PC) — 2026-05-09 (사용자 특화 컨텐츠 240명 user 기반 신규 기획 IA 후 admin 재구현. docs/prd/domains/playerCard.md TODO 참조)
              // { path: "player", element: <AdminPlayerPage />, handle: { title: "컴프야펀 | 어드민 | 선수 카드 관리" } },
              { path: "quiz", element: <AdminQuizPage />, handle: { title: "컴프야펀 | 어드민 | 퀴즈 관리" } },
            ],
          },
          // community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조)
          // { path: "community", element: <AdminCommunityPage />, handle: { title: "컴프야펀 | 어드민 | 커뮤니티 관리" } },

        ],
      },
    ],
  },
];
