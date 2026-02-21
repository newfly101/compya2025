import React, { lazy } from "react";
import AuthGuard from "@/app/router/guards/AuthGuard.jsx";
const UserProfile = lazy(() => import("@/domains/profile/page/UserProfile.jsx"));

export const userRoutes = [
  {
    element: <AuthGuard allow={["ADMIN","USER"]}/>,
    children: [
      { path: "mypage", element: <UserProfile /> },
    ],
  },
];
