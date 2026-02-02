import React from "react";
import styles from "./CommunityAdminTabs.module.scss";

const TABS = [
  { key: "boards", label: "게시판 관리" },
  { key: "posts", label: "게시글 관리" },
  { key: "comments", label: "댓글 관리" },
];

const CommunityAdminTabs = ({ active, onChange }) => {
  return (
    <div className={styles.tabs}>
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`${styles.tab} ${
            active === tab.key ? styles.active : ""
          }`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CommunityAdminTabs;
