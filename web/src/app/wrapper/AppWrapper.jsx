import { Outlet } from "react-router-dom";

import styles from "@/app/wrapper/AppWrapper.module.scss";
import Header from "@/app/wrapper/parts/Header.jsx";
import Footer from "@/app/wrapper/parts/Footer.jsx";
import { Suspense } from "react";
import { useGA4PageView } from "@/app/analytics/hooks/useGA4PageView.js";

const App = () => {
  useGA4PageView();

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

export default App;
