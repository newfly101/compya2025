import styles from "./StatusBadge.module.scss";

/**
 * StatusBadge — 카드 섹션 상태 표시 (solid 채우기, border 없음)
 *
 * @param {"active"|"ended"|"expired"} variant
 * @param {string} [label] - 기본 레이블 덮어쓰기
 *
 * D2=a (2026-05-31 확정): expired alias 추가 — ended 와 동일 시각.
 *   EventCard.badgeExpired 와 정합. 기존 ended 호출처 영향 없음 (alias).
 */
const DEFAULT_LABELS = {
  active:  "진행중",
  ended:   "종료",
  expired: "종료",
};

const StatusBadge = ({ variant = "active", label }) => {
  const text = label ?? DEFAULT_LABELS[variant] ?? variant;
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{text}</span>
  );
};

export default StatusBadge;
