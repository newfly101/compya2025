import React from "react";
import styles from "./RecommendCard.module.scss";
import { GRADE_CLASS_MAP } from "./RecommendCard.styles.js";

const ComboCard = ({ combo, selected }) => (
  <li className={styles.comboCard}>
    <article>
      <header className={styles.comboHeader}>
        <span>{combo.position}</span>
        <span className={`${styles.grade} ${GRADE_CLASS_MAP[combo.grade] ?? ""}`}>
          {combo.grade}
        </span>
      </header>

      <ul className={styles.skillList}>
        {combo.skills.map((skill, i) => (
          <li key={i} className={selected.includes(skill) ? styles.highlight : ""}>
            {skill}
          </li>
        ))}
      </ul>

      <footer className={styles.score}>{combo.totalPoint}점</footer>
    </article>
  </li>
);

export default ComboCard;
