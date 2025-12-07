import { createBrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import Home from "@/pages/Home.jsx";
import Login from "@/pages/Login.jsx";
import Notice from "@/pages/Notice.jsx";

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
      {path: "notice", element: <Notice />,}
    ],
  },
]);

export default router;
