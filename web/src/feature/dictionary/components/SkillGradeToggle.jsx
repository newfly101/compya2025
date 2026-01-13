import React from "react";
import styles from "@/styles/pages/SkillDictionary.module.scss";

const SkillGradeToggle = ({tier, selected, initSelected, onRecommend}) => {
  return (
    <div className={styles.skillToggleHeader}>
      <div className={styles.standardTabs}>
        <button
          className={`${tier === "레전드" ? styles.active : ""}`}
          onClick={() => initSelected("레전드")}
        >
          레전드 스킬 추천
        </button>

        <button
          className={`${tier === "플래티넘" ? styles.active : ""}`}
          onClick={() => initSelected("플래티넘")}
        >
          플래티넘 스킬 추천
        </button>
      </div>
      <div className={styles.standardTabs}>
        <button
          className={styles.recommendBtn}
          disabled={selected.length === 0}
          onClick={() => onRecommend()}
        >
          추천 스킬 조합 보기
          {selected.length > 0 && (
            <span>({selected.length}/2)</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SkillGradeToggle;
