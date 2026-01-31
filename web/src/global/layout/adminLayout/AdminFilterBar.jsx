import React from "react";
import styles from "@/global/layout/adminLayout/AdminTableLayout.module.scss";
import AdminActionButton from "@/global/layout/adminLayout/AdminActionButton.jsx";

const AdminFilterBar = ({ title, filters, setFilters, filterUnits, action }) => {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filterGroup}>
        {filterUnits.map((unit) => {
          const FilterUI = unit.UI;

          return (
            <FilterUI
              title={title}
              key={unit.key}
              value={filters[unit.key]}
              onChange={(value) =>
                setFilters(prev => ({ ...prev, [unit.key]: value }))
              }
            />
          );
        })}
      </div>
      <div className={styles.actionGroup}>
        <AdminActionButton actionTitle={`${title} 등록`} onClick={action} />
      </div>
    </div>
  );
};

export default AdminFilterBar;
