import StatusBadge from "@/components/badge/StatusBadge.jsx";
import styles from "./HeroSection.module.scss";

const HeroSection = () => (
  <section className={styles.hero}>
    <span className={styles.heroBadgeSlot}>
      <StatusBadge variant="active" label="컴투스프로야구 2026" />
    </span>
    <h1 className={styles.heroTitle}>컴프야펀</h1>
    <p className={styles.heroSub}>야구 게임 종합 정보 사이트</p>
  </section>
);

export default HeroSection;
