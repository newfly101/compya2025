import BallIcon from "@/domains/gamification/mobile/components/ballIcon/BallIcon.jsx";
import { tierOf } from "@/domains/gamification/config/tier.js";
import styles from "./SummaryCard.module.scss";

// 티어 요약 카드 — 정보 전용(탭 불가). 공 · 등급 · XP 바 · 포인트.
export default function SummaryCard({ me }) {
  const { xp = 0, level = 1, levelName, nextLevelXp, point = 0 } = me;
  const tier = tierOf(level);
  const percent = nextLevelXp ? Math.min(100, Math.round((xp / nextLevelXp) * 100)) : 100;

  return (
    <section className={styles.card} data-tier={tier} aria-label="내 등급">
      <BallIcon tier={tier} size={48} />
      <div className={styles.body}>
        <div className={styles.row}>
          <strong className={styles.level}>Lv.{level} {levelName}</strong>
          <span className={styles.point}>{point.toLocaleString()} P</span>
        </div>
        <div
          className={styles.track}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={nextLevelXp ?? xp}
          aria-valuenow={xp}
          aria-label="다음 등급까지 경험치"
        >
          <div className={styles.fill} style={{ width: `${percent}%` }} />
        </div>
        <span className={styles.xp}>
          {nextLevelXp ? `${xp.toLocaleString()} / ${nextLevelXp.toLocaleString()} XP` : `${xp.toLocaleString()} XP · 최고 등급`}
        </span>
      </div>
    </section>
  );
}
