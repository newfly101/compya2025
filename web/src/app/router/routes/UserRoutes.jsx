import React, { lazy } from "react";
import AuthGuard from "@/app/router/guards/AuthGuard.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";

const MyPageScreen = lazy(() => import("@/domains/users/mobile/MyPageScreen.jsx"));
const ShortcutEditPage = lazy(() => import("@/domains/home/components/shortcutEdit/ShortcutEditScreen.jsx"));

export const userRoutes = [
  {
    element: <AuthGuard allow={["ADMIN","USER"]}/>,
    children: [
      { path: ROUTE_PATHS.mypage, element: <MyPageScreen />, handle: ROUTE_META.MYPAGE },
      { path: ROUTE_PATHS.home_shortcuts, element: <ShortcutEditPage />, handle: ROUTE_META.HOME_SHORTCUTS },
    ],
  },
];
