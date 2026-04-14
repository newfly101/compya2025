import React, { Suspense } from "react";
import styles from "./MobileLayout.module.scss";
import { Outlet } from "react-router-dom";
import { TopBarProvider } from "@/app/provider/TopBarProvider";
import TopBar from "@/app/wrapper/mobile/parts/TopBar";
import Drawer from "@/app/wrapper/mobile/parts/Drawer.jsx";

const MobileLayout = () => {
  return (
    <TopBarProvider>
      <div className={styles.appWrapper}>
        <TopBar />
        <Drawer />
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
