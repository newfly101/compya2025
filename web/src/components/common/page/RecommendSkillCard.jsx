import React, { useState } from "react";
import styles from "@/styles/pages/SkillDictionary.module.scss";

const gradeClassMap = {
  "졸업": styles.gradeGraduate,
  "준졸업": styles.gradeSemi,
  "타협": styles.gradeAcceptable,
  "변경": styles.gradeChange,
};


// SAMPLE_RECOMMEND_COMBOS = combos
const RecommendSkillCard = ({ isOpen, selectedSkill, combos, onClose }) => {

  if (!isOpen || !selectedSkill) return null;

  const filtered = combos.filter(combo =>
    combo.skills.includes(selectedSkill),
  );

  if (filtered.length === 0) return null;


  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.centerModal}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>
          {selectedSkill} 추천 조합
        </h2>

        <div className={styles.modalBody}>
          <div className={styles.comboGrid}>
            {filtered.map((combo, idx) => (
              <div key={idx} className={styles.comboCard}>
                <div className={styles.comboHeader}>
                  <span>{combo.position}</span>
                  <span className={`${styles.grade} ${
                    gradeClassMap[combo.grade] ?? ""
                  }`}>{combo.grade}</span>
                </div>

                <ul className={styles.skillList}>
                {combo.skills.map((skill, i) => (
                    <li
                      key={i}
                      className={
                        skill === selectedSkill
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
        <button
          className={styles.modalClose}
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default RecommendSkillCard;
