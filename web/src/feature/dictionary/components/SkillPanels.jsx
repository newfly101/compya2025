import React from "react";
import styles from "@/styles/pages/SkillDictionary.module.scss";

const SkillPanels = ({standard, isSkillDisabled, handleToggleSkill,selectedSkills, data}) => {

  const renderGroup = (title, grade, skills) => {
    return (
      <section className={styles.group}>
        <h3 className={styles.groupTitle}>{title}</h3>
        <div className={styles.buttonGrid}>
          {skills.map((skill) => {
            const disabled = isSkillDisabled(skill.name);

            return (
            <button
              key={skill.id}
              disabled={disabled}
              className={`
                      ${styles.skillBtn}
                      ${styles[grade]}
                      ${selectedSkills.includes(skill.name) ? styles.active : ""}
                      ${disabled ? styles.disabled : ""}
                    `}
              onClick={() => handleToggleSkill(skill)}
            >
              {skill.name}
            </button>
          )})}
        </div>
      </section>
    )};

  return (
    <footer className={styles.panel}>
      {standard === "레전드" && renderGroup("레전드", "legend", data.legend)}
      {renderGroup("플레티넘", "platinum", data.platinum)}
      {renderGroup("히어로", "hero", data.hero)}
      {renderGroup("노말", "normal", data.normal)}
    </footer>
  );
};

export default SkillPanels;
