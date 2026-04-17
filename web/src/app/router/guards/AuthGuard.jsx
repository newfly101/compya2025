import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AuthGuard = ({ allow }) => {
  const { initialized, user, userRole } = useSelector(state => state.auth);
  const isAuthenticated = user !== null;

  if (!initialized) return null;

  if (!isAuthenticated) {
    sessionStorage.setItem("redirectPath", window.location.pathname)
    return <Navigate to="/" replace />
  }

  if (allow) {
    const allowList = Array.isArray(allow) ? allow : [allow];
    if (!allowList.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default AuthGuard;
