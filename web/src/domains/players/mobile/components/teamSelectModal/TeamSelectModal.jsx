// domains/players/mobile/components/teamSelectModal/TeamSelectModal.jsx
// 구단 선택 모달 — 스크롤 없이 22타일(구단 21 + 전체 1)이 4열 그리드 한 화면에 들어간다.
import { createPortal } from "react-dom";
import { TEAM_LOGO, getTeamFallbackColor } from "../../teamVisuals";
import styles from "./TeamSelectModal.module.scss";

const modalRoot = document.getElementById("modal");

const TeamSelectModal = ({ open, tiles, activeSlug, onSelect, onClose }) => {
  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>구단 선택</span>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className={styles.grid}>
          {tiles.map((t) => {
            const logo = !t.isAll ? TEAM_LOGO[t.slug] : null;
            const selected = t.slug === activeSlug;
            return (
              <button
                key={t.slug}
                type="button"
                className={`${styles.tile} ${selected ? styles.tileActive : ""}`}
                onClick={() => onSelect(t.slug)}
              >
                {logo ? (
                  <img className={styles.tileLogo} src={logo} alt="" />
                ) : (
                  <span
                    className={styles.tileLogoFallback}
                    style={{
                      backgroundColor: t.isAll ? "var(--color-brand)" : getTeamFallbackColor(t.slug),
                    }}
                    aria-hidden="true"
                  >
                    {t.team.slice(0, 1)}
                  </span>
                )}
                <span className={styles.tileLabel}>{t.team}</span>
                <span className={styles.tileCount}>{t.count.toLocaleString()}명</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default TeamSelectModal;
