import styles from "./PinnedBadge.module.scss";

/**
 * PinnedBadge — 이벤트성 하이라이트 강조 (alpha 채우기 + border)
 * 고정 공지, 이벤트 삽입, 중요 표시 등 강조가 필요한 곳에 사용
 *
 * @param {"cafe"|"important"|"mustread"|"new"|"neutral"|"beta"|"hot"|"mark"|"catNew"} variant
 * @param {string} [label] - 기본 레이블 덮어쓰기
 *
 * D1=a (2026-05-31 확정): new (red), neutral (gray) variant 추가.
 *   - new: CommunityBadge.newBadge 흡수용 — community(동결) 전용, 재색칠 대상 아님
 *   - neutral: BoardTagBadge 흡수용
 *
 * 분류 축 토큰 적용(2026-09-27, semantic-color-proposal.md § 6): mark("중요") / catNew("NEW")
 * 신설 — important·new 는 community 호출부가 물려 있어 그대로 두고, 새 뜻은 새 variant 로 추가했다.
 */
const DEFAULT_LABELS = {
  cafe:     "공식",
  important:"중요",
  mustread: "필독",
  new:      "NEW",
  neutral:  "",
  beta:     "BETA",
  hot:      "HOT",
  mark:     "중요",
  catNew:   "NEW",
};

const PinnedBadge = ({ variant = "important", label }) => {
  const text = label ?? DEFAULT_LABELS[variant] ?? variant;
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{text}</span>
  );
};

export default PinnedBadge;
