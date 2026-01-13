import React from "react";
import styles from "@/styles/pages/SkillDictionary.module.scss";

const SkillGradeToggle = ({tier, selected, initSelected, onRecommend}) => {
  return (
    <section className={styles.skillToggleHeader} aria-label="스킬 추천 옵션">
      <nav className={styles.standardTabs} aria-label="스킬 등급 선택">
        <button
          className={`${tier === "레전드" ? styles.active : ""}`}
          onClick={() => initSelected("레전드")}
          aria-pressed={tier === "레전드"}
        >
          레전드 스킬 추천
        </button>

        <button
          className={`${tier === "플래티넘" ? styles.active : ""}`}
          aria-pressed={tier === "플래티넘"}
          onClick={() => initSelected("플래티넘")}
        >
          플래티넘 스킬 추천
        </button>
      </nav>
      <div className={styles.standardTabs}>
        <button
          className={styles.recommendBtn}
          disabled={selected.length === 0}
          onClick={onRecommend}
        >
          추천 스킬 조합 보기
          {selected.length > 0 && (
            <span aria-live="polite">({selected.length}/2)</span>
          )}
        </button>
      </div>
    </section>
  );
};

export default SkillGradeToggle;
