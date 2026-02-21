import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@/global/styles/global.scss";
import router from "@/app/router";
import AppProvider from "@/app/provider/AppProvider.jsx";

createRoot(document.getElementById("root")).render(
  <AppProvider>
      <RouterProvider router={router} />
  </AppProvider>,
);
