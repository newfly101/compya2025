import React from "react";
import styles from "./CommonNavigationTab.module.scss";

const CommonNavigationTab = ({ tabs, activeKey, onChange }) => {
  return (
    <div className={styles.tabs}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`${styles.tab} ${
            activeKey === tab.key ? styles.active : ""
          }`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CommonNavigationTab;


/*
<Tabs
  tabs={COMMUNITY_ADMIN_TABS}
  activeKey={active}
  onChange={setActive}
/>
*/
