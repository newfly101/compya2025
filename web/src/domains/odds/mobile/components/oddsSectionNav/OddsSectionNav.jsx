import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import styles from "./OddsSectionNav.module.scss";

// 섹션 간 이전/다음 이동 — 24개 항목을 매번 목차로 왕복하는 것을 방지
const OddsSectionNav = ({ prevSection, nextSection }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.nav}>
      <button
        type="button"
        className={styles.navBtn}
        disabled={!prevSection}
        onClick={() => prevSection && navigate(ROUTE_PATHS.odds_section(prevSection.id))}
      >
        <span className={styles.arrow} aria-hidden="true">‹</span>
        <span className={styles.label}>이전 섹션</span>
      </button>
      <button
        type="button"
        className={styles.navBtn}
        disabled={!nextSection}
        onClick={() => nextSection && navigate(ROUTE_PATHS.odds_section(nextSection.id))}
      >
        <span className={styles.label}>다음 섹션</span>
        <span className={styles.arrow} aria-hidden="true">›</span>
      </button>
    </div>
  );
};

export default OddsSectionNav;
