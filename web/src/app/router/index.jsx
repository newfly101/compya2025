// src/app/router.js

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
