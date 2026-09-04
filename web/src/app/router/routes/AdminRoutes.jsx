import React, { lazy } from "react";
import AuthGuard from "@/app/router/guards/AuthGuard.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";

// 단일 셸 — /admin, /admin/:tab 모두 이 화면 하나를 렌더링하고 내부 탭으로 전환한다.
// (근거: docs/domain/admin/design/_redesign-spec.md § 라우팅 변경안)
const AdminShellPage = lazy(() => import("@/domains/admin/mobile/AdminShellScreen.jsx"));

// 공지 글쓰기 — 셸 탭이 아니라 전체 페이지로 전환되는 유일한 예외(Tiptap 에디터).
// Tiptap 은 이 화면(과 향후 공용 RichEditor)에서만 로드되도록 반드시 lazy import 로 분리한다.
const AdminNoticeWritePage = lazy(() => import("@/domains/notices/mobile/admin/AdminNoticeWriteScreen.jsx"));

export const AdminRoutes = [
  {
    element: <AuthGuard allow="ADMIN" />,
    children: [
      {
        path: "admin",
        children: [
          // index("/admin") = 홈 탭. ":tab"("/admin/coupon" 등) = 기존 개별 경로 문자열 그대로 유지.
          { index: true, element: <AdminShellPage />, handle: ROUTE_META.ADMIN },
          // 정적 경로(notice/write*)가 동적 파라미터(":tab")보다 먼저 매칭되도록 앞에 둔다.
          { path: "notice/write", element: <AdminNoticeWritePage />, handle: ROUTE_META.ADMIN_NOTICE_WRITE },
          { path: "notice/write/:id", element: <AdminNoticeWritePage />, handle: ROUTE_META.ADMIN_NOTICE_WRITE },
          { path: ":tab", element: <AdminShellPage />, handle: ROUTE_META.ADMIN },
        ],
      },
    ],
  },
];
