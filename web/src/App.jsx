import { Outlet } from "react-router-dom";

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import styles from "@/styles/layout/appLayout.module.scss";

const App = () => {
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
