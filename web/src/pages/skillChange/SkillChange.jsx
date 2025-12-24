import React, { useEffect, useState } from "react";
import { pickSkillsByCombo } from "@/utils/skill/skillPicker.js";
import { pickByProbability, PROB_LEGEND } from "@/utils/skill/skillProbability.js";
import styles from "@/styles/pages/skillCard.module.scss";
import { useNavigate } from "react-router-dom";

const SkillChange = () => {
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [skillChangeCount, setSkillChangeCount] = useState(-1);

  const rollOnce = () => {
    const combo = pickByProbability(PROB_LEGEND); // 투수 + 레전드 카드 기준
    const result = pickSkillsByCombo(combo);
    setSkillChangeCount(prev => prev + 1);
    setSkills(result);
  };

  useEffect(() => {
    rollOnce();
  }, []);

  const handleClick = () => {
    navigate(`/`);
  }


  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.category} onClick={handleClick}>← 메인으로</span>
        <h1 className={styles.title}>🎲 고급 고유능력 변경권 시뮬레이터</h1>

        <div className={styles.meta}>
          <span>2025-12-25</span>
          <span>v0.1.1</span>
        </div>
      </header>

      <section className={styles.cardSection}>
        <div className={styles.skillCard}>
          <div className={styles.slotWrap}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`${styles.slot} ${
                  skills[i] ? styles[skills[i].grade.toLowerCase()] : ""
                }`}
              >
                {skills[i] && <strong>{skills[i].name} {skills[i].upgrade}</strong>}
              </div>
            ))}

          </div>
        </div>
        <button className={styles.itemButton} onClick={rollOnce}>
          <div className={styles.textBox}>
            <span className={styles.title}>고급 고유능력 변경권</span>
            <span className={styles.count}>{skillChangeCount}</span>
          </div>
        </button>
      </section>
    </main>
  )
    ;
};

export default SkillChange;
