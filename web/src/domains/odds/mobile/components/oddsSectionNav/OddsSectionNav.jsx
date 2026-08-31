import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import styles from "./OddsSectionNav.module.scss";

// 섹션 간 이전/다음 이동 — 24개 항목을 매번 목차로 왕복하는 것을 방지
const OddsSectionNav = ({ prevSection, nextSection }) => {
  return (
    <div className={styles.nav}>
      {prevSection ? (
        <Link to={ROUTE_PATHS.odds_section(prevSection.id)} className={styles.navBtn}>
          <span className={styles.arrow} aria-hidden="true">‹</span>
          <span className={styles.label}>이전 섹션</span>
        </Link>
      ) : (
        <span className={`${styles.navBtn} ${styles.disabled}`} aria-disabled="true">
          <span className={styles.arrow} aria-hidden="true">‹</span>
          <span className={styles.label}>이전 섹션</span>
        </span>
      )}
      {nextSection ? (
        <Link to={ROUTE_PATHS.odds_section(nextSection.id)} className={styles.navBtn}>
          <span className={styles.label}>다음 섹션</span>
          <span className={styles.arrow} aria-hidden="true">›</span>
        </Link>
      ) : (
        <span className={`${styles.navBtn} ${styles.disabled}`} aria-disabled="true">
          <span className={styles.label}>다음 섹션</span>
          <span className={styles.arrow} aria-hidden="true">›</span>
        </span>
      )}
    </div>
  );
};

export default OddsSectionNav;
