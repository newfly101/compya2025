import React from "react";
import styles from "./SkillCard.module.scss";
import { calcOptionClass } from "./skillCardUtils.js";

const SkillTraits = ({ traits, grade }) => (
  <footer className={styles.traits}>
    <div className={styles.option}>
      {traits.map((t) => (
        <span key={t} className={calcOptionClass(t)}>{t}</span>
      ))}
    </div>
    <span>{grade}</span>
  </footer>
);

export default SkillTraits;
