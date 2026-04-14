// src/app/wrapper/AppWrapper.jsx
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { useGA4PageView } from "@/app/analytics/hooks/useGA4PageView.js";
import TopBar from "@/domains/mobile/components/topBar/TopBar.jsx";
import styles from "@/app/wrapper/AppWrapper.module.scss";

const AppWrapper = () => {
  useGA4PageView();

  return (
    <div className={styles.appWrapper}>
      <TopBar variant="home" />  {/* 일단 home 고정, 추후 context로 제어 */}

      <div className={styles.pageContent}>
        <Suspense fallback={<div className={styles.loading}>로딩중...</div>}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};

export default AppWrapper;
