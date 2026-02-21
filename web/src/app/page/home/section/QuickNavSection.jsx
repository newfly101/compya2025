import React from "react";
import styles from "@/app/page/home/Home.module.scss";
import { useNavigate } from "react-router-dom";
import { useHomeNav } from "@/app/page/home/hooks/useHomeNav.js";

const QuickNavSection = () => {
  const navigate = useNavigate();
  const quickNav = useHomeNav();

  return (
    <section className={styles.quickNav}>
      <div className={styles.quickGrid}>
        {quickNav.map((item, i) => (
          <button key={`home-nav-${i}`}
          onClick={() => navigate(item.to)}
          className={styles.quickCard}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickNavSection;
