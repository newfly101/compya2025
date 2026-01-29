import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./AdminContentPage.module.scss";

const AdminContentPage = () => {
  return (
    <div className={styles.container}>
      <h1>콘텐츠 관리</h1>

      <Outlet />
    </div>
  );
};

export default AdminContentPage;
