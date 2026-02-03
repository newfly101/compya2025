import React from "react";
import styles from "./UserTableLayout.module.scss";
import UserActionButton from "@/global/layout/userLayout/UserActionButton.jsx";

const UserFilterBar = ({ title, filters, setFilters, filterUnits, action = null }) => {
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
      {action && (
        <div className={styles.actionGroup}>
          <UserActionButton actionTitle={`${title} 등록`} onClick={action} />
        </div>
      )}
    </div>
  );
};

export default UserFilterBar;
