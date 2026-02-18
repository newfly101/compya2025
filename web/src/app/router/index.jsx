import { createBrowserRouter } from "react-router-dom";
import AppWrapper from "@/app/wrapper/AppWrapper.jsx";

import { PublicRoutes } from "@/app/router/routes/PublicRoutes.jsx";
import { userRoutes } from "@/app/router/routes/UserRoutes.jsx";
import { AdminRoutes } from "@/app/router/routes/AdminRoutes.jsx";

const router = createBrowserRouter([
  {
    path: "/",

    element: <AppWrapper />,
    children: [
      ...PublicRoutes,
      ...userRoutes,
      ...AdminRoutes,
    ],
  },
]);

export default router;
