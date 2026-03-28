import React, { useState } from "react";
import styles from "./PlayerSkillDescription.module.scss";
import { parseDescription } from "./parseDescription.js";

export const selectFlatSkills = (skillData) => {
  if (!skillData) return [];
  return Object.values(skillData)
    .flat()
    .map((skill) => ({ ...skill, position: "전체" }));
};

const PlayerSkillDescription = ({ skillData, positionConfig, gradeOptions }) => {
  const [position, setPosition] = useState("전체");
  const [grade, setGrade] = useState("전체");

  const skills = selectFlatSkills(skillData);
  const filtered = skills.filter((s) => {
    const matchPosition = position === "전체" || s.position === position;
    const matchGrade = grade === "전체" || s.grade === grade;
    return matchPosition && matchGrade;
  });

  return (
    <div className={styles.page}>
      {/* 등급 필터 */}
      <div className={styles.filterHeader}>
        <span className={styles.filterLabel}>등급</span>
      </div>
      <div className={styles.chips}>
        {gradeOptions.map((g) => (
          <button
            key={g}
            className={g === grade ? styles.active : ""}
            onClick={() => setGrade(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* 카드 */}
      <div className={styles.grid}>
        {filtered.map((skill) => (
          <div key={skill.id} className={styles.card}>
            <button className={`${styles.skillButton} ${styles[skill.grade.toLowerCase()]}`}>
              {skill.name}
            </button>
            <ul className={styles.descList}>
              {parseDescription(skill.description).map((opt, idx) => (
                <li key={idx} className={styles.descItem}>
                  <div>{opt.main}</div>
                  {opt.subs.map((sub, subIdx) => (
                    <div key={subIdx} className={styles.descSub}>{sub}</div>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerSkillDescription;
