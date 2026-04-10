// src/app/wrapper/AppWrapper.jsx
//
// ★ 역할 변경: 레이아웃 shell만 담당
//   PC/모바일 컴포넌트 분기는 각 route element에서 처리
//   Admin은 항상 PC이므로 AppWrapper 자체는 건드리지 않음

import { Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";

import { useIsMobile } from "@/app/hooks/useIsMobile";

import styles from "@/app/wrapper/AppWrapper.module.scss";
import MobileWrapper from "@/app/wrapper/MobileWrapper.jsx";
import Header from "@/app/wrapper/parts/Header.jsx";
import Footer from "@/app/wrapper/parts/Footer.jsx";
import { useGA4PageView } from "@/app/analytics/hooks/useGA4PageView.js";

function useIsAdminRoute() {
  const { pathname } = useLocation();
  return pathname.startsWith("/admin");
}

const AppWrapper = () => {
  useGA4PageView();

  const isMobile     = useIsMobile();
  const isAdminRoute = useIsAdminRoute();
  const showMobile   = isMobile && !isAdminRoute;

  console.log("showMobile", showMobile);

  // ── 모바일: Header/Footer 없이 MobileWrapper만 ────────────
  if (showMobile) {
    return (
      <MobileWrapper>
        <Outlet />
      </MobileWrapper>
    );
  }

  // ── PC: 기존 그대로 ───────────────────────────────────────
  return (
    <div className={styles.appWrapper}>
      <Header />
      <main className={styles.pageMain}>
        <div className={styles.pageFrame}>
          <Suspense fallback={<div>로딩중...</div>}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AppWrapper;
