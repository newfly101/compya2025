import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./TabNavigation.module.scss";

const TabNavigation = ({ tabs }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  return (
    <nav className={styles.tabNavigationWrapper}>
      {tabs.map(tab => {
        const isActive =
          tab.exact
            ? currentPath === tab.path
            : currentPath.startsWith(tab.path);

        return (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tabButton} ${
              isActive ? styles.active : ""
            }`}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

export default TabNavigation;
