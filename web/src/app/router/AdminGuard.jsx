import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const UserGuard = () => {
  const {initialized, isAuthenticated, role} = useSelector(state => state.auth);

  if (!initialized) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (role?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return (
    <Outlet />
  );
};

export default UserGuard;
