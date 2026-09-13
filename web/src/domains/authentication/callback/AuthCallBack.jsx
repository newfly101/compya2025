import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { requestUserHealthCheck } from "@/domains/authentication/store/thunks";
import { trackLogin } from "@/infra/analytics/events/authEvents.js";
import { setUserProperties } from "@/infra/analytics/ga.js";
import styles from "./AuthCallBack.module.scss";

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

  // 완전 백지 화면 방지 — AdSense 반려 사유("콘텐츠 없는 화면에 광고") 대응.
  // 이 화면은 광고 슬롯을 배치하지 않으며(infra/ads 배치 금지 구역), noindex 처리됨(routeSeo.js).
  return (
    <div className={styles.wrap}>
      <div className={styles.spinner} role="status" aria-label="로그인 처리 중" />
      <p className={styles.text}>로그인 처리 중입니다…</p>
    </div>
  );
};

export default AuthCallback;
