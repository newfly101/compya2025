import React, { Suspense } from "react";
import styles from "./MobileLayout.module.scss";
import { Outlet } from "react-router-dom";
import { TopBarProvider } from "@/app/provider/TopBarProvider";
import TopBar from "@/app/wrapper/mobile/parts/TopBar";

const MobileLayout = () => {
  return (
    <TopBarProvider>
      <div className={styles.appWrapper}>
        <TopBar />
        <div className={styles.pageContent}>
          <Suspense fallback={<div className={styles.loading}>로딩중...</div>}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </TopBarProvider>
  );
};

export default MobileLayout;
