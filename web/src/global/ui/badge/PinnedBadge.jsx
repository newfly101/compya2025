import styles from "./PinnedBadge.module.scss";

/**
 * PinnedBadge — 이벤트성 하이라이트 강조 (alpha 채우기 + border)
 * 고정 공지, 이벤트 삽입, 중요 표시 등 강조가 필요한 곳에 사용
 *
 * @param {"update"|"patch"|"cafe"|"tip"|"important"|"mustread"} variant
 * @param {string} [label] - 기본 레이블 덮어쓰기
 */
const DEFAULT_LABELS = {
  update:   "업데이트",
  patch:    "패치노트",
  cafe:     "공식",
  tip:      "TIP",
  important:"중요",
  mustread: "필독",
};

const PinnedBadge = ({ variant = "important", label }) => {
  const text = label ?? DEFAULT_LABELS[variant] ?? variant;
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{text}</span>
  );
};

export default PinnedBadge;
