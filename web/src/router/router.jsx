import { createBrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import Home from "@/pages/Home.jsx";
import Login from "@/pages/Login.jsx";
import Notice from "@/pages/Notice.jsx";
import FunNoticePage from "@/components/common/page/FunNoticePage.jsx";
import SkillChange from "@/pages/skillChange/SkillChange.jsx";
import TipPage from "@/pages/TipPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {path: "notice", element: <Notice />},
      {path: "notice/:id", element: <FunNoticePage />},
      {path: "simulate", element: <SkillChange />},
      {path: "tips", element: <TipPage />}
    ],
  },
]);

export default router;
