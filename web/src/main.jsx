import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router/router.jsx";
import "@/styles/global.scss";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import AuthProvider from "@/utils/provider/AuthProvider.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </Provider>,
);
