import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { requestUserHealthCheck } from "@/domains/authentication/store/thunks";
import { trackLogin } from "@/app/analytics/events/authEvents.js";
import { setUserProperties } from "@/app/analytics/ga.js";

const AuthCallback = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(requestUserHealthCheck())
      .unwrap()
      .then((data) => {
        setUserProperties(data.userRole);
        trackLogin(data.userRole);
      })
      .finally(() => {
        const redirectPath = sessionStorage.getItem("redirectPath") ?? "/";
        sessionStorage.removeItem("redirectPath");
        window.location.replace(redirectPath);
      });
  }, []);

  return null;
};

export default AuthCallback;
