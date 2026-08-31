// src/app/router.js

import { createBrowserRouter } from "react-router-dom";
import AppWrapper from "@/app/wrapper/AppWrapper.jsx";
import NotFoundScreen from "@/domains/error/mobile/NotFoundScreen.jsx";

import { PublicRoutes } from "@/app/router/routes/PublicRoutes.jsx";
import { userRoutes }   from "@/app/router/routes/UserRoutes.jsx";
import { AdminRoutes }  from "@/app/router/routes/AdminRoutes.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper />,   // 여기서 PC/모바일 분기
    errorElement: <NotFoundScreen />,
    children: [
      ...PublicRoutes,   // 기존 라우트 그대로
      ...userRoutes,
      ...AdminRoutes,
      // 어떤 라우트에도 매칭되지 않으면 404 — 반드시 children 배열 맨 끝에 위치
      {
        path: "*",
        element: <NotFoundScreen />,
        handle: { title: "컴프야펀 | 페이지를 찾을 수 없음", seoKey: "notFound" },
      },
    ],
  },
]);

export default router;
