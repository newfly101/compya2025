import { lazy } from "react";
import AuthGuard from "@/app/router/guards/AuthGuard.jsx";
const AdminPageLayout = lazy(() =>  import("@/global/layout/adminPageLayout/AdminPageLayout.jsx"));
const AdminDashBoardPage = lazy(() =>  import("@/domains/admin/pages/dashboard/AdminDashBoardPage.jsx"));
const AdminUserManagePage = lazy(() =>  import("@/domains/admin/pages/user/AdminUserManagePage.jsx"));
const AdminUserDetailPage = lazy(() =>  import("@/domains/admin/pages/user/AdminUserDetailPage.jsx"));
const AdminContentPage = lazy(() =>  import("@/global/layout/adminPageLayout/content/AdminContentPage.jsx"));
const AdminEventPage = lazy(() =>  import("@/domains/events/feature/admin/pages/AdminEventPage.jsx"));
const AdminNoticeManagePage = lazy(() =>  import("@/domains/notices/feature/components/admin/AdminNoticeManagePage.jsx"));
const AdminCommunityPage = lazy(() =>  import("@/domains/community/page/admin/AdminCommunityPage.jsx"));
const AdminCouponListPage = lazy(() =>  import("@/domains/coupons/feature/admin/pages/AdminCouponListPage.jsx"));

export const AdminRoutes = [
  {
    element: <AuthGuard allow="ADMIN" />,
    children: [
      {
        path: "admin",
        element: <AdminPageLayout />,
        children: [
          { index: true, element: <AdminDashBoardPage />, handle: { title: "컴프야펀 | 어드민 | 대시보드" } },
          { path: "users", element: <AdminUserManagePage />, handle: { title: "컴프야펀 | 어드민 | 유저 관리" } },
          { path: "users/:userId", element: <AdminUserDetailPage />, handle: { title: "컴프야펀 | 어드민 | 유저 상세 관리" } },
          {
            path: "content", element: <AdminContentPage />, children: [
              { path: "event", element: <AdminEventPage />, handle: { title: "컴프야펀 | 어드민 | 이벤트 관리" } },
              { path: "notice", element: <AdminNoticeManagePage />, handle: { title: "컴프야펀 | 어드민 | 공지 관리" } },
              { path: "coupon", element: <AdminCouponListPage />, handle: { title: "컴프야펀 | 어드민 | 쿠폰 관리" } },
            ],
          },
          { path: "community", element: <AdminCommunityPage />, handle: { title: "컴프야펀 | 어드민 | 커뮤니티 관리" } },
        ],
      },
    ],
  },
];
