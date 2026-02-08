import { Outlet } from "react-router-dom";

import Header from "@/global/layout/appLayout/Header.jsx";
import Footer from "@/global/layout/appLayout/Footer.jsx";
import styles from "@/global/layout/appLayout/appLayout.module.scss";
import { Suspense } from "react";
import MobileNav from "@/global/layout/appLayout/MobileNav.jsx";
import { useGA4PageView } from "@/app/analytics/hooks/useGA4PageView.js";

const App = () => {
  useGA4PageView();

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
