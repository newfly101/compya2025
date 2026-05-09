import React, { lazy } from "react";
import AuthGuard from "@/app/router/guards/AuthGuard.jsx";
// profile 도메인 폐기 — 2026-05-09 (기획 IA 후 모바일 재구현. docs/prd/domains/profile.md TODO 참조)
// const UserProfile = lazy(() => import("@/domains/profile/page/UserProfile.jsx"));

export const userRoutes = [
  {
    element: <AuthGuard allow={["ADMIN","USER"]}/>,
    children: [
      // profile 도메인 폐기 — 2026-05-09 (기획 IA 후 모바일 재구현. docs/prd/domains/profile.md TODO 참조)
      // { path: "mypage", element: <UserProfile /> },
    ],
  },
];
