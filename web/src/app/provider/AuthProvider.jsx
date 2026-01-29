import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestUserHealthCheck } from "@/domains/auth/store/thunks.js";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const initialized = useSelector(state => state.auth.initialized);

  useEffect(() => {
    if (!initialized) {
      dispatch(requestUserHealthCheck());
    }
  }, [initialized, dispatch]);

  return !initialized
    ?
    <div>로딩중...</div>
    :
    children;
};


export default AuthProvider;
