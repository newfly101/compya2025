import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AuthGuard = ({ allow }) => {
  const { initialized, isAuthenticated, authority } = useSelector(state => state.auth);
  console.log("authority", authority);

  if (!initialized) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const role =
    typeof authority === "string"
      ? authority
      : authority?.role;

  const allowList = Array.isArray(allow) ? allow : [allow];

  if (allow && !allowList.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
