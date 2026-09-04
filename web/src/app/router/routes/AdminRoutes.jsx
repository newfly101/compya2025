import React, { lazy } from "react";
import AuthGuard from "@/app/router/guards/AuthGuard.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";

// admin 4종
const AdminCouponPage = lazy(() => import("@/domains/coupons/mobile/admin/AdminCouponScreen.jsx"));
const AdminEventPage = lazy(() => import("@/domains/events/mobile/admin/AdminEventScreen.jsx"));
const AdminNoticePage = lazy(() => import("@/domains/notices/mobile/admin/AdminNoticeScreen.jsx"));
const AdminUserPage = lazy(() => import("@/domains/users/mobile/admin/AdminUserScreen.jsx"));
const AdminQuizPage = lazy(() => import("@/domains/quiz/mobile/admin/AdminQuizScreen.jsx"));

export const AdminRoutes = [
  {
    element: <AuthGuard allow="ADMIN" />,
    children: [
      {
        path: "admin",
        children: [
          { path: "coupon", element: <AdminCouponPage />, handle: ROUTE_META.ADMIN_COUPON },
          { path: "event", element: <AdminEventPage />, handle: ROUTE_META.ADMIN_EVENT },
          { path: "notice", element: <AdminNoticePage />, handle: ROUTE_META.ADMIN_NOTICE },
          { path: "user", element: <AdminUserPage />, handle: ROUTE_META.ADMIN_USER },
          { path: "quiz", element: <AdminQuizPage />, handle: ROUTE_META.ADMIN_QUIZ },
        ],
      },
    ],
  },
];
