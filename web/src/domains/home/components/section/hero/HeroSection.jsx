import React from "react";
import styles from "./HeroSection.module.scss";

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBadge}>컴투스프로야구 2026</div>
      <h1 className={styles.heroTitle}>컴프야펀</h1>
      <p className={styles.heroSub}>야구 게임 종합 정보 사이트</p>
    </section>
  );
};

export default HeroSection;
