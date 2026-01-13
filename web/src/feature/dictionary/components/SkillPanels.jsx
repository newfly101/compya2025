import React from "react";
import styles from "@/styles/pages/SkillDictionary.module.scss";

const SkillPanels = ({standard, isSkillDisabled, handleToggleSkill,selectedSkills, data, ex}) => {

  const renderGroup = (title, grade, skills) => {
    return (
      <section className={styles.group}>
        <h3 className={styles.groupTitle}>{title}</h3>
        <div className={styles.buttonGrid}>
          {skills.map((skill) => (
            <button
              key={skill.id}
              disabled={isSkillDisabled(skill.name, selectedSkills, ex)}
              className={`
                      ${styles.skillBtn}
                      ${styles[grade]}
                      ${selectedSkills.includes(skill.name) ? styles.active : ""}
                      ${isSkillDisabled(skill.name, selectedSkills) ? styles.disabled : ""}
                    `}
              onClick={() => handleToggleSkill(skill)}
            >
              {skill.name}
            </button>
          ))}
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
