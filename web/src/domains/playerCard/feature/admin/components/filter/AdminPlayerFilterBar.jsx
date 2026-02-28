import React from "react";
import styles from "@/global/layout/adminPageLayout/table/AdminTableLayout.module.scss";
import AdminActionButton from "@/global/layout/adminPageLayout/table/AdminActionButton.jsx";

const AdminPlayerFilterBar = ({title, filters, setFilters, onCreate}) => {
  return (
    <div className={styles.adminFilterBar}>

      <div className={styles.adminFilterBarTop}>
        <h2 className={styles.adminFilterTitle}>{title}</h2>
        <AdminActionButton
          actionTitle={`${title} 등록`}
          onClick={onCreate}
        />
      </div>

      <div className={styles.adminFilterControls}>

        <input
          type="text"
          placeholder={`${title} 검색`}
          value={filters.keyword}
          onChange={(e) =>
            setFilters(prev => ({
              ...prev,
              keyword: e.target.value
            }))
          }
        />

        <select
          value={filters.visible}
          onChange={(e) =>
            setFilters(prev => ({
              ...prev,
              visible: e.target.value
            }))
          }
        >
          <option value="ALL">전체 노출</option>
          <option value="VISIBLE">노출</option>
          <option value="HIDDEN">숨김</option>
        </select>

      </div>
    </div>
  );
};

export default AdminPlayerFilterBar;
