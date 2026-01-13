import React from "react";
import styles from "@/styles/pages/SkillDictionary.module.scss";

const SkillGradeToggle = ({standard, initSelected, handleOpenRecommend, selectedSkills}) => {
  return (
    <div className={styles.skillToggleHeader}>
      <div className={styles.standardTabs}>
        <button
          className={`${standard === "레전드" ? styles.active : ""}`}
          onClick={() => initSelected("레전드")}
        >
          레전드 스킬 추천
        </button>

        <button
          className={`${standard === "플래티넘" ? styles.active : ""}`}
          onClick={() => initSelected("플래티넘")}
        >
          플래티넘 스킬 추천
        </button>
      </div>
      <div className={styles.standardTabs}>
        <button
          className={styles.recommendBtn}
          disabled={selectedSkills.length === 0}
          onClick={handleOpenRecommend}
        >
          추천 스킬 조합 보기
          {selectedSkills.length > 0 && (
            <span>({selectedSkills.length}/2)</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SkillGradeToggle;
