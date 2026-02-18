import AuthGuard from "@/app/router/guards/AuthGuard.jsx";
import AdminLayout from "@/domains/admin/layout/AdminLayout.jsx";
import AdminDashBoardPage from "@/domains/admin/pages/dashboard/AdminDashBoardPage.jsx";
import AdminUserManagePage from "@/domains/admin/pages/user/AdminUserManagePage.jsx";
import AdminUserDetailPage from "@/domains/admin/pages/user/AdminUserDetailPage.jsx";
import AdminContentPage from "@/domains/admin/pages/content/AdminContentPage.jsx";
import AdminEventPage from "@/domains/events/page/admin/AdminEventPage.jsx";
import AdminNoticeManagePage from "@/domains/notices/feature/components/admin/AdminNoticeManagePage.jsx";
import AdminCouponPage from "@/domains/coupons/page/admin/AdminCouponPage.jsx";
import AdminCommunityPage from "@/domains/community/page/admin/AdminCommunityPage.jsx";

export const AdminRoutes = [
  {
    element: <AuthGuard allow="ADMIN" />,
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
              { path: "event", element: <AdminEventPage />, handle: { title: "컴프야펀 | 어드민 | 이벤트 관리" } },
              { path: "notice", element: <AdminNoticeManagePage />, handle: { title: "컴프야펀 | 어드민 | 공지 관리" } },
              { path: "coupon", element: <AdminCouponPage />, handle: { title: "컴프야펀 | 어드민 | 쿠폰 관리" } },
            ],
          },
          { path: "community", element: <AdminCommunityPage />, handle: { title: "컴프야펀 | 어드민 | 커뮤니티 관리" } },
        ],
      },
    ],
  },
];
