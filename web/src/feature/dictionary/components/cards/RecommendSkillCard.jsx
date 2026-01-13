import React from "react";
import styles from "@/styles/pages/SkillDictionary.module.scss";

const gradeClassMap = {
  "졸업": styles.gradeGraduate,
  "준졸업": styles.gradeSemi,
  "타협": styles.gradeAcceptable,
  "변경": styles.gradeChange,
};
const gradePriority = {
  "졸업": 4,
  "준졸업": 3,
  "타협": 2,
  "변경": 1,
};
const BATTING_ORDER_MAP = {
  "리드오프": "1타선",
  "파워히터": "4타선",
  "클러치 히터": "5,6타선",
};

// SAMPLE_RECOMMEND_COMBOS = combos
const RecommendSkillCard = ({ isOpen, selectedSkills=[], combos, onClose }) => {
  if (!isOpen || combos.length === 0) return null;

  const sortedCombos = [...combos].sort((a, b) => {
    // 1️⃣ 점수 내림차순
    if (b.totalPoint !== a.totalPoint) {
      return b.totalPoint - a.totalPoint;
    }

    // 2️⃣ 등급 우선순위
    return (
      (gradePriority[b.grade] ?? 0) -
      (gradePriority[a.grade] ?? 0)
    );
  });

  const getBattingOrderLabel = (selectedSkills = []) => {
    const orders = selectedSkills
      .map((skill) => BATTING_ORDER_MAP[skill])
      .filter(Boolean); // undefined 제거

    if (orders.length === 0) return "";

    return ` (${orders.join(", ")})`;
  };



  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.centerModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {selectedSkills.join(" + ")} 추천 조합
            {getBattingOrderLabel(selectedSkills)}
          </h2>

          <button
            className={styles.modalCloseIcon}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        {/*<h2 className={styles.modalTitle}>*/}
        {/*  {selectedSkills.join(" + ")} 추천 조합*/}
        {/*  {getBattingOrderLabel(selectedSkills)}*/}
        {/*</h2>*/}

        <div className={styles.modalBody}>
          <div className={styles.comboGrid}>
            {sortedCombos.map((combo, idx) => (
              <div key={idx} className={styles.comboCard}>
                <div className={styles.comboHeader}>
                  <span>{combo.position}</span>
                  <span
                    className={`${styles.grade} ${
                      gradeClassMap[combo.grade] ?? ""
                    }`}
                  >
                    {combo.grade}
                  </span>
                </div>

                <ul className={styles.skillList}>
                  {combo.skills.map((skill, i) => (
                    <li
                      key={i}
                      className={
                        selectedSkills.includes(skill)
                          ? styles.highlight
                          : ""
                      }
                    >
                      {skill}
                    </li>
                  ))}
                </ul>

                <div className={styles.score}>
                  {combo.totalPoint}점
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*<button className={styles.modalClose} onClick={onClose}>*/}
        {/*  닫기*/}
        {/*</button>*/}
      </div>
    </div>
  );
};

export default RecommendSkillCard;
