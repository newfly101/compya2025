import styles from "./LegendBadge.module.scss";

/** 작은 뱃지 (Figma badge/액자 · badge/보유중 · badge/오늘) — `outline` = brand 테두리, `fill` = brand 채움 */
const LegendBadge = ({ children, fill = false }) => (
  <span className={`${styles.badge} ${fill ? styles.fill : ""}`}>{children}</span>
);

export default LegendBadge;
