import React from "react";
import styles from "./SkillCard.module.scss";

const SkillCardMeta = ({ identity, positions }) => (
  <section className={styles.metaBlock}>
    <div className={styles.metaGrid}>소속팀 <strong>{identity.team.teamName}</strong></div>
    <div className={styles.metaGrid}>포지션 <strong>{positions}</strong></div>
    <div className={styles.metaGrid}>등번호 <strong>{identity.backNumber}번</strong></div>
    <div className={styles.metaGrid}>생년월일 <strong>{identity.birth}</strong></div>
    <div className={styles.metaGrid}>투타 <strong>{identity.batThrow}</strong></div>
  </section>
);

export default SkillCardMeta;
