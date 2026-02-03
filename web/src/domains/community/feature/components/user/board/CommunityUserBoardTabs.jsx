import React from "react";
import styles from "@/domains/community/feature/components/admin/tabs/CommunityAdminTabs.module.scss";

const CommunityUserBoardTabs = ({ boards, active, onChange }) => {

  return (
    <div className={styles.tabs}>
      {boards.map(tab => (
        <button
          key={tab.id}
          className={`${styles.tab} ${
            active === tab.id ? styles.active : ""
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};

export default CommunityUserBoardTabs;
