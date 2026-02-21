import React from "react";
import styles from "@/app/page/home/Home.module.scss";

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBg}></div>

      <div className={styles.heroContent}>
        <div className={styles.heroBox}>
          <h1>컴프야펀</h1>
          <p>컴투스프로야구 유저를 위한 종합 정보 사이트</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
