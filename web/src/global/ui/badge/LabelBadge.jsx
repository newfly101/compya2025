import styles from "./LabelBadge.module.scss";

/**
 * LabelBadge — 카드 섹션 카테고리 분류 (alpha 채우기, border 없음)
 * 목록/카드에서 콘텐츠 유형을 구분할 때 사용
 *
 * @param {"update"|"patch"|"cafe"|"tip"|"important"|"mustread"} variant
 * @param {string} [label] - 기본 레이블 덮어쓰기
 */
const DEFAULT_LABELS = {
  update:   "업데이트",
  patch:    "패치노트",
  cafe:     "공식카페",
  tip:      "팁",
  important:"중요",
  mustread: "필독",
};

const LabelBadge = ({ variant = "update", label }) => {
  const text = label ?? DEFAULT_LABELS[variant] ?? variant;
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{text}</span>
  );
};

export default LabelBadge;
