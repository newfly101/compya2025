// domains/players/mobile/components/playerCard/PlayerCard.jsx
// 카드 1장. 최대 11,672장 중 일부가 반복 렌더되므로 memo 필수.
import { memo } from "react";
import styles from "./PlayerCard.module.scss";

const yearShort = (year, wide, team) => {
  if (!/^\d{4}$/.test(year)) return "L"; // 레전드 그룹(연도 없음) — 현재 데이터엔 없지만 방어적으로 유지
  const suffix = `'${year.slice(2)}`;
  return wide ? `${team} ${suffix}` : suffix;
};

const PlayerCard = ({ player, maxGrade, wide, isOpen, onToggleL, onClose }) => {
  const isPitcher = player.t === "P";
  const isCoach = player.t === "C"; // 이번 범위는 코치 데이터가 로더에서 제외되어 실질적으로 도달하지 않음
  const gradeColor = maxGrade ? "var(--color-pe-gold)" : "var(--color-pe-normal)";
  // webp 로 내보낸다 — 원본 PNG 1024×1536 을 화면 크기(228×342)로 줄여 30MB 를 217KB 로 줄였다.
  // 만드는 쪽은 scripts/build-card-images.mjs.
  const image = isCoach ? null : `/cards/${isPitcher ? "pitcher" : "batter"}_${maxGrade ? "platinum" : "normal"}.webp`;
  const hasLegend = !!player.L;
  const legendName = player.LN || player.n;

  return (
    <div
      className={styles.card}
      style={{
        borderColor: gradeColor,
        backgroundImage: image ? `url(${image})` : undefined,
        zIndex: isOpen ? 20 : 1,
      }}
      onClick={onClose}
    >
      <div className={styles.shade} />

      {isCoach && <span className={styles.coachLabel}>COACH</span>}

      {hasLegend && isOpen && (
        <div className={styles.legendPopover}>
          <span className={styles.legendPopoverLabel}>레전드 재료</span>
          <span className={styles.legendPopoverName}>{legendName}</span>
        </div>
      )}

      {hasLegend && (
        <button
          type="button"
          className={styles.lMarkButton}
          aria-label="레전드 재료 보기"
          onClick={(e) => {
            e.stopPropagation();
            onToggleL(player.id);
          }}
        >
          <span className={styles.lMark}>L</span>
        </button>
      )}

      <span className={styles.name}>{player.n}</span>

      <div className={styles.band}>
        <span className={styles.bandYear}>{yearShort(player.y, wide, player.tm)}</span>
        <span className={styles.bandPos} style={{ color: gradeColor }}>
          {isCoach ? "코치" : player.pos}
        </span>
      </div>
    </div>
  );
};

export default memo(PlayerCard);
