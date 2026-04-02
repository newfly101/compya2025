import styles from "./WinRateBar.module.scss";
import { normalizeWinRates } from "@/domains/kbo/feature/public/utils/matchUtils.js";

/**
 * WinRateBar
 * - 홈/어웨이 AI 승률을 좌우 분할 바로 시각화
 * - props: homeRate(number), awayRate(number), homeColor(string), awayColor(string)
 */
const WinRateBar = ({ homeRate = 50, awayRate = 50, homeColor, awayColor }) => {
  const { home, away } = normalizeWinRates(homeRate, awayRate);
  const homeWinning = home >= away;

  return (
    <div className={styles.winRateBar}>
      <div className={styles.labels}>
        <span
          className={`${styles.rate} ${homeWinning ? styles.dominant : ""}`}
          style={{ color: homeWinning ? homeColor : undefined }}
        >
          {home}%
        </span>
        <span className={styles.aiLabel}>AI 승률</span>
        <span
          className={`${styles.rate} ${!homeWinning ? styles.dominant : ""}`}
          style={{ color: !homeWinning ? awayColor : undefined }}
        >
          {away}%
        </span>
      </div>

      <div className={styles.track}>
        <div
          className={styles.homeBar}
          style={{ width: `${home}%`, backgroundColor: homeColor }}
        />
        <div
          className={styles.awayBar}
          style={{ width: `${away}%`, backgroundColor: awayColor }}
        />
      </div>
    </div>
  );
};

export default WinRateBar;
