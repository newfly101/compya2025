import React from "react";
import styles from "@/styles/pages/SkillDictionary.module.scss";

const SkillPanels = ({tier, selected, onCheckDisabled, onToggleSkill, skills}) => {

  const renderGroup = (title, grade, skills) => {
    return (
      <section className={styles.group}>
        <h3 className={styles.groupTitle}>{title}</h3>
        <div className={styles.buttonGrid}>
          {skills.map((skill) => {
            const disabled = onCheckDisabled(skill.name);

            return (
            <button
              key={skill.id}
              disabled={disabled}
              className={`
                      ${styles.skillBtn}
                      ${styles[grade]}
                      ${selected.includes(skill.name) ? styles.active : ""}
                      ${disabled ? styles.disabled : ""}
                    `}
              onClick={() => onToggleSkill(skill)}
            >
              {skill.name}
            </button>
          )})}
        </div>
      </section>
    )};

  return (
    <footer className={styles.panel}>
      {tier === "레전드" && renderGroup("레전드", "legend", skills.legend)}
      {renderGroup("플레티넘", "platinum", skills.platinum)}
      {renderGroup("히어로", "hero", skills.hero)}
      {renderGroup("노말", "normal", skills.normal)}
    </footer>
  );
};

export default SkillPanels;
