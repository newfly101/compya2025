// domains/players/mobile/components/filterSheet/FilterSheet.jsx
// 카드 필터 바텀시트 — 팀 / 포지션 / 카드 종류 AND 필터 + 레전드 재료만.
import { createPortal } from "react-dom";
import { POS_B, POS_P, KINDS, ACTIVE_KINDS } from "@/domains/players/config/playersLoader";
import styles from "./FilterSheet.module.scss";

const modalRoot = document.getElementById("modal");

const Chip = ({ label, active, disabled, onClick, mono }) => (
  <button
    type="button"
    className={`${styles.chip} ${active ? styles.chipActive : ""} ${mono ? styles.chipMono : ""}`}
    disabled={disabled}
    onClick={onClick}
  >
    {label}
  </button>
);

const FilterSheet = ({
  open,
  teams,
  fTeam,
  yearDecades,
  fYear,
  fPos,
  fKind,
  onlyL,
  onToggleTeam,
  onToggleYear,
  onToggleDecade,
  onTogglePos,
  onToggleKind,
  onTeamAll,
  onYearAll,
  onPosAll,
  onKindAll,
  onToggleOnlyL,
  onReset,
  onClose,
  shownCount,
}) => {
  if (!open || !modalRoot) return null;

  const statusText = fTeam.length || fYear.length || fPos.length || fKind.length || onlyL
    ? [
        fTeam.length && `팀 ${fTeam.length}`,
        fYear.length && `연도 ${fYear.length}`,
        fPos.length && `포지션 ${fPos.length}`,
        fKind.length && `종류 ${fKind.length}`,
        onlyL && "재료만",
      ]
        .filter(Boolean)
        .join(" · ")
    : "필터 미적용 중";

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>카드 필터</span>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>
                팀 <span className={styles.sectionHint}>{fTeam.length ? `${fTeam.length}개 선택` : "전체"}</span>
              </span>
              <button type="button" className={styles.allBtn} onClick={onTeamAll}>
                전체 선택
              </button>
            </div>
            <div className={styles.grid5}>
              {teams.map((t) => (
                <Chip key={t} label={t} active={fTeam.includes(t)} onClick={() => onToggleTeam(t)} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>
                연도 <span className={styles.sectionHint}>{fYear.length ? `${fYear.length}개 선택` : "전체"}</span>
              </span>
              <button type="button" className={styles.allBtn} onClick={onYearAll}>
                전체 선택
              </button>
            </div>
            <div className={styles.yearRows}>
              {yearDecades.map(({ decade, years }) => {
                const allOn = years.every((y) => fYear.includes(y));
                const someOn = !allOn && years.some((y) => fYear.includes(y));
                return (
                  <div key={decade} className={styles.yearRow}>
                    <button
                      type="button"
                      className={`${styles.decadeBtn} ${allOn || someOn ? styles.decadeBtnActive : ""}`}
                      onClick={() => onToggleDecade(years)}
                    >
                      {decade.slice(2)}년대
                    </button>
                    <div className={styles.yearGrid}>
                      {years.map((y) => (
                        <button
                          key={y}
                          type="button"
                          className={`${styles.yearChip} ${fYear.includes(y) ? styles.yearChipActive : ""}`}
                          style={{ gridColumn: (Number(y) % 10) + 1 }}
                          onClick={() => onToggleYear(y)}
                        >
                          {y.slice(2)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>
                포지션 <span className={styles.sectionHint}>{fPos.length ? `${fPos.length}개 선택` : "전체"}</span>
              </span>
              <button type="button" className={styles.allBtn} onClick={onPosAll}>
                전체 선택
              </button>
            </div>
            <p className={styles.subLabel}>타자</p>
            <div className={styles.grid5} style={{ marginBottom: 10 }}>
              {POS_B.map((p) => (
                <Chip key={p} label={p} mono active={fPos.includes(p)} onClick={() => onTogglePos(p)} />
              ))}
            </div>
            <p className={styles.subLabel}>투수</p>
            <div className={styles.grid5}>
              {POS_P.map((p) => (
                <Chip key={p} label={p} mono active={fPos.includes(p)} onClick={() => onTogglePos(p)} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>
                카드 종류 <span className={styles.sectionHint}>{fKind.length ? `${fKind.length}개 선택` : "전체"}</span>
              </span>
              <button type="button" className={styles.allBtn} onClick={onKindAll}>
                전체 선택
              </button>
            </div>
            <div className={styles.grid4}>
              {KINDS.map((k) => (
                <Chip
                  key={k}
                  label={k}
                  active={fKind.includes(k)}
                  disabled={!ACTIVE_KINDS.has(k)}
                  onClick={() => onToggleKind(k)}
                />
              ))}
            </div>
          </section>

          <div className={styles.bottomRow}>
            <button
              type="button"
              className={`${styles.onlyLBtn} ${onlyL ? styles.onlyLBtnActive : ""}`}
              onClick={onToggleOnlyL}
            >
              <span className={styles.checkbox}>{onlyL && "✓"}</span>
              레전드 재료만
            </button>
            <button type="button" className={styles.resetBtn} onClick={onReset}>
              ↻ 초기화
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.statusText}>{statusText}</span>
          <button type="button" className={styles.confirmBtn} onClick={onClose}>
            확인 · {shownCount.toLocaleString()}장
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default FilterSheet;
