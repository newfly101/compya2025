import React from "react";
import styles from "./SkillCard.module.scss";

const SkillSlots = ({ skills }) => (
  <section className={styles.slotWrap}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={`${styles.slot} ${skills?.[i] ? styles[skills[i].grade.toLowerCase()] : ""}`}
      >
        {skills?.[i] && <strong>{skills[i].name} {skills[i].upgrade}</strong>}
      </div>
    ))}
  </section>
);

export default SkillSlots;
