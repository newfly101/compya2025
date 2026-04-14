import React from "react";
import styles from "./QuickSection.module.scss";
import { Link } from "react-router-dom";
import { QUICK_MENUS } from "@/domains/home/config/QUICK_MENUS.js";

const QuickSection = () => {
  return (
    <section className={styles.quickMenu}>
      {QUICK_MENUS.map((menu) => (
        <Link key={menu.id} to={menu.to} className={styles.quickItem}>
          <div className={styles.quickIcon}>{menu.icon}</div>
          <span className={styles.quickLabel}>{menu.label}</span>
        </Link>
      ))}
    </section>
  );
};

export default QuickSection;
