import BallIcon from "@/features/gamification/components/ballIcon/BallIcon.jsx";
import { tierOf } from "@/features/gamification/tier.js";
import styles from "./TierChip.module.scss";

// "Lv.5 주전" 등급 칩 — 공 16px 단색 + 티어색 칩.
export default function TierChip({ level, name }) {
  const tier = tierOf(level);
  return (
    <span className={styles.chip} data-tier={tier}>
      <BallIcon tier={tier} size={16} />
      <span>Lv.{level} {name}</span>
    </span>
  );
}
