import { Outlet, useLocation, useMatches } from "react-router-dom";

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import styles from "@/styles/layout/appLayout.module.scss";
import { useEffect } from "react";

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
        <main className={styles.content}> <Outlet /> </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;
