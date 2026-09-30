import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { MATERIAL } from "@/domains/legendCollections/config/legendCollections.js";
import styles from "./MaterialCard.module.scss";

const OPTIONS = [
  [MATERIAL.NONE, "없음"],
  [MATERIAL.HAVE, "보유"],
  [MATERIAL.INSERTED, "삽입"],
];

/**
 * 재료 카드 1칸 (Figma C/LC/MatCard 418:387) — 팀 태그 + 이름'연도 가 한 줄.
 * 열람: 오른쪽에 상태 표시(삽입 ✓ · 보유) 또는 미보유면 `마`·`히` 태그.
 * 편집: 같은 크기 카드 안 오른쪽에 없음·보유·삽입 3칸, 저장된 삽입은 자물쇠 "삽입됨".
 */
const MaterialCard = ({
  slot,
  state,
  legendName,
  editing = false,
  locked = false,
  frozen = false,
  canInsert = false,
  mileageTarget,
  inHistory = false,
  onChange,
}) => {
  const showTags = !editing && state === MATERIAL.NONE && !slot.coach;
  const variant = editing && locked ? "locked" : state;

  return (
    <div className={styles.card} data-state={variant} data-editing={editing || undefined}>
      <span className={styles.team}>{slot.team}</span>
      <span className={styles.name}>{slot.label}</span>

      {!editing && state === MATERIAL.INSERTED && <span className={`${styles.status} ${styles.inserted}`}>삽입 ✓</span>}
      {!editing && state === MATERIAL.HAVE && <span className={`${styles.status} ${styles.have}`}>보유</span>}

      {showTags && (mileageTarget || inHistory) && (
        <span className={styles.tags}>
          {mileageTarget && (
            <Link
              to={`${ROUTE_PATHS.mileage}?team=${encodeURIComponent(mileageTarget.teamCode)}&year=${mileageTarget.seasonYear}`}
              className={`${styles.tag} ${styles.mileage}`}
              aria-label={`${slot.label} 마일리지로 저격 가능 — 마일리지 화면으로`}
            >
              마
            </Link>
          )}
          {inHistory && (
            <Link
              to={`${ROUTE_PATHS.history_legend}?legend=${encodeURIComponent(legendName)}`}
              className={styles.tag}
              aria-label={`${slot.label} 히스토리 모드에서 획득 가능 — 히스토리 화면으로`}
            >
              히
            </Link>
          )}
        </span>
      )}

      {editing && locked && (
        <span className={styles.lock}>
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
            <rect x="2" y="5.5" width="8" height="5.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          삽입됨
        </span>
      )}

      {editing && !locked && (
        <span className={styles.seg} role="group" aria-label={`${slot.label} 상태`}>
          {OPTIONS.map(([key, text]) => (
            <button
              key={key}
              type="button"
              aria-pressed={state === key}
              data-opt={key}
              disabled={frozen || (key === MATERIAL.INSERTED && !canInsert && state !== key)}
              onClick={() => state !== key && onChange?.(key)}
            >
              {text}
            </button>
          ))}
        </span>
      )}
    </div>
  );
};

export default MaterialCard;
