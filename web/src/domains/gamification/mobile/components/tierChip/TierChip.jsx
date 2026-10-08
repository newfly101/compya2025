import BallIcon from "@/domains/gamification/mobile/components/ballIcon/BallIcon.jsx";
import { tierOf } from "@/domains/gamification/config/tier.js";
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
