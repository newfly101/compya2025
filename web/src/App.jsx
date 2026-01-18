import { Outlet, useLocation, useMatches } from "react-router-dom";

import Header from "@/shared/layout/appLayout/Header.jsx";
import Footer from "@/shared/layout/appLayout/Footer.jsx";
import styles from "@/shared/layout/appLayout/appLayout.module.scss";
import { Suspense, useEffect } from "react";
import MobileNav from "@/shared/layout/appLayout/MobileNav.jsx";

const App = () => {
  const location = useLocation();
  const matches = useMatches();

  /* Google Analytics 추가 */
  useEffect(() => {
    // 1️⃣ 현재 라우트 title 설정
    const current = matches[matches.length - 1];
    const isNoticePage = location.pathname === "/notice";

    if (current?.handle?.title && !isNoticePage) {
      document.title = current.handle.title;
    }

    // 2️⃣ GA4 page_view 수동 전송 (SPA 대응)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });

  }, [location.pathname, matches]);


  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.inner}>
        <main className={styles.content}> <Suspense fallback={<div>로딩중...</div>}> <Outlet /> </Suspense> </main>
      </div>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default App;
