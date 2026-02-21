import React from "react";
import styles from "@/global/layout/adminPageLayout/table/AdminTableLayout.module.scss";
import AdminActionButton from "@/global/layout/adminPageLayout/table/AdminActionButton.jsx";

const AdminFilterBar = ({ title, filters, setFilters, onCreate = () => {} }) => {
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
          placeholder="쿠폰 코드 검색"
          value={filters.keyword}
          onChange={(e) =>
            setFilters(prev => ({
              ...prev,
              keyword: e.target.value
            }))
          }
        />

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters(prev => ({
              ...prev,
              status: e.target.value
            }))
          }
        >
          <option value="ALL">전체 상태</option>
          <option value="ACTIVE">사용 가능</option>
          <option value="EXPIRED">만료</option>
        </select>

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

export default AdminFilterBar;
