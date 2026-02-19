import React from "react";
import styles from "@/global/layout/adminPageLayout/table/AdminTableLayout.module.scss";
import AdminActionButton from "@/global/layout/adminPageLayout/table/AdminActionButton.jsx";

const AdminFilterBar = ({ title, filters, setFilters, filterUnits, action }) => {
  return (
    <div className={styles.adminFilterBar}>

      <div className={styles.adminFilterBarTop}>
        <h2 className={styles.adminFilterTitle}>{title}</h2>

        <AdminActionButton
          actionTitle={`${title} 등록`}
          onClick={action}
        />
      </div>

      <div className={styles.adminFilterControls}>
        {filterUnits.map((unit) => {
          const FilterUI = unit.UI;

          return (
            <FilterUI
              key={unit.key}
              value={filters[unit.key]}
              onChange={(value) =>
                setFilters(prev => ({ ...prev, [unit.key]: value }))
              }
            />
          );
        })}
      </div>

    </div>
  );
};

export default AdminFilterBar;
