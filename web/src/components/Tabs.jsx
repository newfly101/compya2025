import React from "react";
import { useSearchParams } from "react-router-dom";
import styles from "@/styles/layout/Tabs.module.scss";

const Tabs = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "";

  const changeTab = (key) => {
    if (!key) {
      params.delete("tab");
    } else {
      params.set("tab", key);
    }
    setParams(params);
  };

  return (
    <div className={styles.tabs}>
      <button
        className={tab === "" ? styles.active : ""}
        onClick={() => changeTab("")}
      >
        컴프야펀 공지사항
      </button>

      <button
        className={tab === "notice" ? styles.active : ""}
        onClick={() => changeTab("notice")}
      >
        공식 공지사항
      </button>

      <button
        className={tab === "event" ? styles.active : ""}
        onClick={() => changeTab("event")}
      >
        이벤트
      </button>

      <button
        className={tab === "coupons" ? styles.active : ""}
        onClick={() => changeTab("coupons")}
      >
        쿠폰
      </button>
    </div>
  );
};

export default Tabs;
