import React, { lazy } from "react";
import AuthGuard from "@/app/router/guards/AuthGuard.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";

// admin 4종
const AdminCouponPage = lazy(() => import("@/domains/coupons/mobile/admin/AdminCouponScreen.jsx"));
const AdminEventPage = lazy(() => import("@/domains/events/mobile/admin/AdminEventScreen.jsx"));
const AdminNoticePage = lazy(() => import("@/domains/notices/mobile/admin/AdminNoticeScreen.jsx"));
const AdminUserPage = lazy(() => import("@/domains/users/mobile/admin/AdminUserScreen.jsx"));

// wiki admin
const AdminWikiPage = lazy(() => import("@/domains/wiki/admin/mobile/AdminWikiScreen.jsx"));
const AdminWikiPitchPage = lazy(() => import("@/domains/wiki/admin/mobile/AdminWikiPitchScreen.jsx"));
const AdminWikiPitchGradePage = lazy(() => import("@/domains/wiki/admin/mobile/AdminWikiPitchGradeScreen.jsx"));
const AdminWikiStatInfluencePage = lazy(() => import("@/domains/wiki/admin/mobile/AdminWikiStatInfluenceScreen.jsx"));
const AdminWikiGameInfoPage = lazy(() => import("@/domains/wiki/admin/mobile/AdminWikiGameInfoScreen.jsx"));

export const AdminRoutes = [
  {
    element: <AuthGuard allow="ADMIN" />,
    children: [
      {
        path: "admin",
        children: [
          { path: "coupon", element: <AdminCouponPage />, handle: ROUTE_META.ADMIN_COUPON.title },
          { path: "event", element: <AdminEventPage />, handle: ROUTE_META.ADMIN_EVENT.title },
          { path: "notice", element: <AdminNoticePage />, handle: ROUTE_META.ADMIN_NOTICE.title },
          { path: "user", element: <AdminUserPage />, handle: ROUTE_META.ADMIN_USER.title },
          {
            path: "wiki",
            children: [
              { index: true, element: <AdminWikiPage />, handle: ROUTE_META.ADMIN_WIKI.title },
              { path: "pitches", element: <AdminWikiPitchPage />, handle: ROUTE_META.ADMIN_WIKI_PITCHES.title },
              { path: "pitch-grades", element: <AdminWikiPitchGradePage />, handle: ROUTE_META.ADMIN_WIKI_PITCH_GRADES.title },
              { path: "stat-influences", element: <AdminWikiStatInfluencePage />, handle: ROUTE_META.ADMIN_WIKI_STAT_INFLUENCES.title },
              { path: "game-info", element: <AdminWikiGameInfoPage />, handle: ROUTE_META.ADMIN_WIKI_GAME_INFO.title },
            ],
          },
        ],
      },
    ],
  },
];
