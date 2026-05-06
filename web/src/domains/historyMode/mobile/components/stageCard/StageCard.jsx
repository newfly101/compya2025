import { fmt } from "@/domains/historyMode/mobile/hooks/useHistoryMode.js";
import styles from "./StageCard.module.scss";

const StageCard = ({ stage, query, isSelected = false, onClick }) => {
  const targetItems = stage.item.filter((it) => it.legend === query);
  const otherItems = stage.item.filter(
    (it) => it.legend && it.legend !== query
  );
  const materialCount = stage.item.filter((it) => it.legend).length;

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.selected : ""}`}
      onClick={onClick}
    >
      <div className={styles.headRow}>
        <span className={styles.dayChip}>Day {stage.day}</span>
        <span
          className={`${styles.sessionChip} ${
            isSelected ? styles.sessionActive : ""
          }`}
        >
          세션 {stage.roaster}
        </span>
      </div>

      <p className={`${styles.title} ${isSelected ? styles.titleActive : ""}`}>
        {stage.name}
      </p>

      <p className={styles.sub}>
        Day {stage.day} · 세션 {stage.roaster} · 재료 {materialCount}종
      </p>

      <div className={styles.playerRow}>
        {targetItems.map((it, i) => (
          <span
            key={`t-${i}`}
            className={`${styles.playerChip} ${styles.playerHighlight}`}
          >
            ⭐ {fmt(it.player, it.years)}
          </span>
        ))}
        {otherItems.map((it, i) => (
          <span key={`o-${i}`} className={styles.playerChip}>
            {fmt(it.player, it.years)}
          </span>
        ))}
      </div>
    </article>
  );
};

export default StageCard;
