import styles from "./KBOHeroBanner.module.scss";
import { formatGameDate } from "@/domains/kbo/feature/public/utils/matchUtils.js";

/**
 * KBOHeroBanner
 * - KBO 메인 페이지 상단 히어로 영역
 * - 오늘 날짜 + 서비스 소개 문구 표시
 */
const KBOHeroBanner = ({ gameDate }) => {
  const dateLabel = formatGameDate(gameDate ?? new Date().toISOString().slice(0, 10));

  return (
    <section className={styles.banner}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <span className={styles.dot} />
          {dateLabel}
        </div>
        <h1 className={styles.title}>
          KBO 승부예측
          <span className={styles.accent}> AI</span>
        </h1>
        <p className={styles.description}>
          오늘 경기를 빠르게 파악하고 AI 분석으로 승부를 예측하세요
        </p>
      </div>
      <div className={styles.glow} aria-hidden="true" />
    </section>
  );
};

export default KBOHeroBanner;
