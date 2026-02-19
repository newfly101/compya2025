import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./AdminContentPage.module.scss";

const AdminContentPage = () => {
  return (
    <section className={styles.adminContentWrapper}>

      <header className={styles.adminContentHeader}>
        <h1 className={styles.adminContentTitle}>사이트 관리</h1>
      </header>

      <section className={styles.adminContentBody}>
        <Outlet />
      </section>

    </section>
  );
};

export default AdminContentPage;
