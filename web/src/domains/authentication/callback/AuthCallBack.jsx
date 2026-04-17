import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { requestUserHealthCheck } from "@/domains/authentication/store/thunks";

const AuthCallback = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(requestUserHealthCheck())
      .finally(() => {
        const redirectPath = sessionStorage.getItem("redirectPath") ?? "/";
        sessionStorage.removeItem("redirectPath");
        window.location.replace(redirectPath);
      });
  }, []);

  return null;
};

export default AuthCallback;
