import React from "react";
import { useSearchParams } from "react-router-dom";
import styles from "@/styles/layout/Tabs.module.scss";

const Tabs = ({tabs}) => {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? tabs[0].key;

  const changeTab = (key) => {
    if (!key || key === tabs[0].key) params.delete("tab");
    else params.set("tab", key);
    setParams(params);
  };

  return (
    <div className={styles.tabs}>
      {tabs.map((t) => (
        <button
          key={t.key}
          className={tab === t.key ? styles.active : ""}
          onClick={() => changeTab(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
