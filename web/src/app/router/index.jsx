// src/app/router.js
//
// 라우트 구조는 그대로 유지
// AppWrapper.jsx 안에서 isMobile 분기로 MobileWrapper를 렌더함
// → 같은 라우트 path를 PC/모바일가 공유
// → 각 페이지 컴포넌트 내부에서 isMobile로 다른 UI를 렌더하거나
//   MobileRoutes처럼 path별 컴포넌트 자체를 분리

import { createBrowserRouter } from "react-router-dom";
import AppWrapper from "@/app/wrapper/AppWrapper.jsx";

import { PublicRoutes } from "@/app/router/routes/PublicRoutes.jsx";
import { userRoutes }   from "@/app/router/routes/UserRoutes.jsx";
import { AdminRoutes }  from "@/app/router/routes/AdminRoutes.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper />,   // 여기서 PC/모바일 분기
    children: [
      ...PublicRoutes,   // 기존 라우트 그대로
      ...userRoutes,
      ...AdminRoutes,
    ],
  },
]);

export default router;

// ──────────────────────────────────────────────────────────────
// 동작 방식:
//
// [PC, /notice/coupons 접속]
//   AppWrapper → PC 감지 → Header + Footer + <Outlet>
//                                              └── CouponListPage (기존 PC 컴포넌트)
//
// [모바일, /notice/coupons 접속]
//   AppWrapper → 모바일 감지 → MobileWrapper → <Outlet>
//                                                └── CouponListPage
//                                                    (내부에서 isMobile 분기 또는
//                                                     MobileRoutes로 컴포넌트 교체)
//
// [PC/모바일, /admin 접속]
//   AppWrapper → Admin 경로 감지 → 항상 PC 렌더
// ──────────────────────────────────────────────────────────────
