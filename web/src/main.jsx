import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./app/router/router.jsx";
import "@/global/styles/global.scss";
import { Provider } from "react-redux";
import { store } from "./app/store/store.js";
import AuthProvider from "@/app/provider/AuthProvider.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </Provider>,
);
