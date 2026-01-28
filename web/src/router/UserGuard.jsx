import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const UserGuard = () => {
  const {isAuthenticated} = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <Outlet />
  );
};

export default UserGuard;
