import { LEGEND } from "@/domains/legendCollections/config/legendCollections.js";
import styles from "./StatusToggles.module.scss";

/**
 * 레전드 상태 토글 (Figma 02b 434:264) — 미보유·액자·보유중 셋 중 하나.
 * 둘 다 꺼짐 = 미보유. 보유중이면 액자는 비활성. 보유중 전환은 확인창 없이 바로 (REQ-LCOL-06).
 */
const StatusToggles = ({ status, onChange, legendName }) => {
  const owned = status === LEGEND.OWNED;
  const frame = status === LEGEND.FRAME;
  return (
    <span className={styles.toggles} role="group" aria-label={`${legendName} 레전드 상태`}>
      <button
        type="button"
        aria-pressed={frame}
        disabled={owned}
        onClick={() => onChange(frame ? LEGEND.NONE : LEGEND.FRAME)}
      >
        액자
      </button>
      <button type="button" aria-pressed={owned} onClick={() => onChange(owned ? LEGEND.NONE : LEGEND.OWNED)}>
        보유중
      </button>
    </span>
  );
};

export default StatusToggles;
