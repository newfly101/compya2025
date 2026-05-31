import React from "react";
import StatusBadge from "@/global/ui/badge/StatusBadge";
import styles from "./HeroSection.module.scss";

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <span className={styles.heroBadgeSlot}>
        <StatusBadge variant="active" label="컴투스프로야구 2026" />
      </span>
      <h1 className={styles.heroTitle}>컴프야펀</h1>
      <p className={styles.heroSub}>야구 게임 종합 정보 사이트</p>
    </section>
  );
};

export default HeroSection;
