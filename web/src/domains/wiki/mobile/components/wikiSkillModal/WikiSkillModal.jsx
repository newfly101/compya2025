// WikiSkillModal.jsx — ENC-1-2/ENC-2-2 스킬 상세 모달
// 카드 클릭 시 skillItem (SkillItemResponse) + meta(pitcherSkillMeta 선택) 전달
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { PITCHER_SKILL_META } from "@/data/skill/pitcherSkillMeta.js";
import styles from "./WikiSkillModal.module.scss";

const GRADE_LABELS = {
  LEGEND: "레전드",
  PLATINUM: "플래티넘",
  HERO: "히어로",
  NORMAL: "노말",
};

const WikiSkillModal = ({ skill, codeToName = {}, onClose }) => {
  // ESC 닫기
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!skill) return null;

  const meta = PITCHER_SKILL_META[skill.skillCode] ?? null;
  const synergyList = meta?.synergyWith ?? [];
  const conflictList = meta?.conflictsWith ?? [];
  const gradeLabel = GRADE_LABELS[skill.grade] ?? skill.grade;

  const modalRoot = document.getElementById("modal") ?? document.body;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${skill.name} 스킬 상세`}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <span className={`${styles.gradeBadge} ${styles[`grade_${skill.grade?.toLowerCase()}`]}`}>
              {gradeLabel}
            </span>
            <h2 className={styles.skillName}>{skill.name}</h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 설명 */}
        <div className={styles.section}>
          <p className={styles.description}>{skill.description || "설명이 없습니다."}</p>
        </div>

        {/* 시너지 / 상극 */}
        {(synergyList.length > 0 || conflictList.length > 0) ? (
          <div className={styles.metaSection}>
            {synergyList.length > 0 && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>시너지</span>
                <div className={styles.metaChips}>
                  {synergyList.map((code) => (
                    <span key={code} className={styles.synergyChip}>{codeToName[code] ?? code}</span>
                  ))}
                </div>
              </div>
            )}
            {conflictList.length > 0 && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>상극</span>
                <div className={styles.metaChips}>
                  {conflictList.map((code) => (
                    <span key={code} className={styles.conflictChip}>{codeToName[code] ?? code}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className={styles.noMeta}>시너지 정보 없음</p>
        )}
      </div>
    </div>,
    modalRoot
  );
};

export default WikiSkillModal;
