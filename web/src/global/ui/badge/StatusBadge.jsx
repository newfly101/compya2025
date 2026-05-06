import styles from "./StatusBadge.module.scss";

/**
 * StatusBadge — 카드 섹션 상태 표시 (solid 채우기, border 없음)
 *
 * @param {"active"|"new"|"hot"|"ended"|"pick"|"limited"|"event"|"reward"} variant
 * @param {string} [label] - 기본 레이블 덮어쓰기
 */
const DEFAULT_LABELS = {
  active:  "진행중",
  new:     "신규",
  hot:     "인기",
  ended:   "종료",
  pick:    "추천",
  limited: "한정",
  event:   "이벤트",
  reward:  "보상",
};

const StatusBadge = ({ variant = "active", label }) => {
  const text = label ?? DEFAULT_LABELS[variant] ?? variant;
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{text}</span>
  );
};

export default StatusBadge;
