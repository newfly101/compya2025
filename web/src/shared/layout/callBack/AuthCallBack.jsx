import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallBack = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
    }

    navigate("/"); // 홈으로 이동
  }, [navigate]);

  return (
    <div>로그인 처리 중...</div>
  );
};

export default AuthCallBack;
