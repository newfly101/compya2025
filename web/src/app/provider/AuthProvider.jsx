import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestUserHealthCheck } from "@/domains/authentication/store/thunks.js";
import { setUserProperties } from "@/app/analytics/ga.js";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const initialized = useSelector(state => state.auth.initialized);

  useEffect(() => {
    dispatch(requestUserHealthCheck())
      .unwrap()
      .then((data) => {
        if (!data) return;
      })
      .catch(() => {
        setUserProperties('GUEST')
      })
      .catch(() => {})
  }, [])

  if (!initialized) return null;

  return children;
};


export default AuthProvider;
