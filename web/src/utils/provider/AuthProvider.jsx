import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestUserHealthCheck } from "@/store/modules/auth/thunks.js";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const initialized = useSelector(state => state.auth.initialized);

  useEffect(() => {
    console.log("AuthProvider 호출");
    if (!initialized) {
      dispatch(requestUserHealthCheck());
      console.log("AuthProvider requestUserHealthCheck 호출");
    }
  }, [initialized, dispatch]);

  return !initialized
    ?
    <div>로딩중...</div>
    :
    children;
};


export default AuthProvider;
