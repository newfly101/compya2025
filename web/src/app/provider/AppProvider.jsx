import React from "react";
import ResponseListener from "@/app/page/commonModal/ResponseListener.jsx";
import { store } from "@/app/store/store.js";
import { Provider } from "react-redux";
import AuthProvider from "@/app/provider/AuthProvider.jsx";

const AppProvider = ({ children }) => {
  return (
    <>
      <Provider store={store}>
        <ResponseListener />
        <AuthProvider>
          {children}
        </AuthProvider>
      </Provider>
    </>
  );
};

export default AppProvider;
