import React from "react";
import styles from "@/global/layout/adminPageLayout/table/AdminTableLayout.module.scss";
import AdminActionButton from "@/global/layout/adminPageLayout/table/AdminActionButton.jsx";

/**
 * Admin 공용 필터 레이아웃.
 * 필터 컨트롤은 children으로 주입 — 각 도메인이 직접 정의.
 */
const AdminFilterBar = ({ title, onCreate = () => {}, children }) => {
  return (
    <div className={styles.adminFilterBar}>
      <div className={styles.adminFilterBarTop}>
        <h2 className={styles.adminFilterTitle}>{title}</h2>
        <AdminActionButton actionTitle={`${title} 등록`} onClick={onCreate} />
      </div>

      {children && (
        <div className={styles.adminFilterControls}>
          {children}
        </div>
      )}
    </div>
  );
};

export default AdminFilterBar;
