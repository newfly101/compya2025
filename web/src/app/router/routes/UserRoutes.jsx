import React, { lazy } from "react";
import AuthGuard from "@/app/router/guards/AuthGuard.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";

const MyPageScreen = lazy(() => import("@/domains/users/mobile/MyPageScreen.jsx"));

export const userRoutes = [
  {
    element: <AuthGuard allow={["ADMIN","USER"]}/>,
    children: [
      { path: "mypage", element: <MyPageScreen />, handle: ROUTE_META.MYPAGE },
    ],
  },
];
