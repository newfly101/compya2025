"use client";
import { useEffect } from "react";
import styles from "./ErrorScreen.module.scss";

// 원본 ErrorBoundary 문구 그대로. 새로고침은 Next 의 reset 대신 원본처럼 전체 새로고침.
const ErrorScreen = ({ error }) => {
  useEffect(() => {
    console.error("[ErrorBoundary] 렌더 중 예외 발생", error);
  }, [error]);

  return (
    <div className={styles.wrap} role="alert">
      <p className={styles.title}>문제가 생겼습니다</p>
      <p className={styles.desc}>
        페이지를 표시하는 중 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.
      </p>
      <button type="button" className={styles.reloadBtn} onClick={() => window.location.reload()}>
        새로고침
      </button>
    </div>
  );
};

export default ErrorScreen;
