import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestUserHealthCheck } from "@/domains/authentication/store/thunks.js";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const initialized = useSelector(state => state.auth.initialized);

  useEffect(() => {
    if (!initialized) {
      dispatch(requestUserHealthCheck());
    }
  }, [initialized, dispatch]);

  if (!initialized) return null;

  return children;
};


export default AuthProvider;
