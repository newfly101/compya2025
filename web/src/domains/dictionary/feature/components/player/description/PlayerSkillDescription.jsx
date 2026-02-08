import React, { useState } from "react";
import styles from "./PlayerSkillDescription.module.scss";


export const selectFlatSkills = (skillData) => {
  if (!skillData) return [];

  return Object.values(skillData)
    .flat()
    .map((skill) => ({
      ...skill,
      position: "전체",
    }));
};


const PlayerSkillDescription = ({
                                  skillData,
                                  positionConfig,
                                  gradeOptions,
                                }) => {
  const [position, setPosition] = useState("전체");
  const [grade, setGrade] = useState("전체");

  const skills = selectFlatSkills(skillData);

  const filtered = skills.filter((s) => {
    const matchPosition = position === "전체" || s.position === position;
    const matchGrade = grade === "전체" || s.grade === grade;
    return matchPosition && matchGrade;
  });

  const parseDescription = (text = "") => {
    if (!text) return [];

    // 콤마 기준: 괄호 밖 + 숫자 제외
    const baseChunks = text.split(/,(?![^()]*\))(?!\d)/g);

    return baseChunks.map((chunk) => {
      const parts = chunk.split(/\s+및\s+/g).map(s => s.trim());

      return {
        main: parts[0],
        subs: parts.slice(1).map(sub => `및 ${sub}`), // 🔥 '및' 복원
      };
    });
  };

  return (
    <div className={styles.page}>
      {/* todo: 포지션 걸어주는 부분 : 아직 기능 미구현으로 제외 상태 */}
      {/*<div className={styles.filterHeader}>*/}
      {/*  <span className={styles.filterLabel}>{positionConfig.label}</span>*/}
      {/*</div>*/}
      {/*<div className={styles.chips}>*/}
      {/*  {positionConfig.options.map((p) => (*/}
      {/*    <button*/}
      {/*      key={p}*/}
      {/*      className={p === position ? styles.active : ""}*/}
      {/*      onClick={() => setPosition(p)}*/}
      {/*    >*/}
      {/*      {p}*/}
      {/*    </button>*/}
      {/*  ))}*/}
      {/*</div>*/}

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
            <button className={`${styles.skillButton} ${styles[skill.grade.toLowerCase()]}`}>{skill.name}</button>
              <ul className={styles.descList}>
                {parseDescription(skill.description).map((opt, idx) => (
                  <li key={idx} className={styles.descItem}>
                    <div>{opt.main}</div>

                    {opt.subs.map((sub, subIdx) => (
                      <div key={subIdx} className={styles.descSub}>
                        {sub}
                      </div>
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
