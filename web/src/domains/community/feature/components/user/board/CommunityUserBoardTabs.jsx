import React from "react";
import styles from "@/domains/community/feature/components/admin/tabs/CommunityAdminTabs.module.scss";

const CommunityUserBoardTabs = ({ boards, active, onChange }) => {

  return (
    <div className={styles.tabs}>
      {boards.map(tab => (
        <button
          key={tab.code}
          className={`${styles.tab} ${
            active === tab.code ? styles.active : ""
          }`}
          onClick={() => onChange(tab)}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};

export default CommunityUserBoardTabs;
