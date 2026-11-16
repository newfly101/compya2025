import styles from "./LedgerRow.module.scss";

// 내역 한 줄 — 사유 · 날짜 · 증감. 탭(XP/포인트)에 맞는 값만 보여 준다.
export default function LedgerRow({ item, type }) {
  const delta = type === "XP" ? item.xpDelta : item.pointDelta;
  const unit = type === "XP" ? "XP" : "P";
  return (
    <li className={styles.row}>
      <span className={styles.text}>
        <strong className={styles.reason}>{item.reason}</strong>
        <span className={styles.date}>{item.rewardDate}</span>
      </span>
      <span className={delta < 0 ? styles.minus : styles.plus}>
        {delta > 0 ? "+" : ""}{delta.toLocaleString()} {unit}
      </span>
    </li>
  );
}
