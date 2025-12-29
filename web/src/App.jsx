import { Outlet, useLocation } from "react-router-dom";

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import styles from "@/styles/layout/appLayout.module.scss";
import { useEffect } from "react";

const App = () => {
  const location = useLocation();

  /* Google Analytics 추가 */
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: location.pathname,
      page_location: window.location.href,
    });
  }, [location.pathname]);

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
