import React from "react";
import styles from "./SkillCard.module.scss";

const HitterSkillCard = ({ hitter, skills }) => {
  const {
    name,
    team,
    positions,
    backNumber,
    birth,
    batThrow,
    traits,
    attributes,
    careerStats,
  } = hitter;

  const calcAttrClass = (value) => {
    if (value >= 90) return styles.attrHigh;   // 빨강
    if (value >= 80) return styles.attrMid;    // 주황
    return "";
  };

  const calcOptionClass = (value) => {
    if (value === "특이폼") return styles.option1;   // 빨강
    if (value === "페이스") return styles.option2;    // 주황
    return "";
  };

  return (
    <article className={styles.skillCard}>
      {/* 이름 */}
      <header className={styles.teamName}>{name}</header>

      {/* 기본 정보 */}
      <section className={styles.metaBlock}>
        <div className={styles.metaGrid}>소속팀 <strong>{team}</strong></div>
        <div className={styles.metaGrid}>포지션 <strong>{positions.join(", ")}</strong></div>
        <div className={styles.metaGrid}>등번호 <strong>{backNumber}번</strong></div>
        <div className={styles.metaGrid}>생년월일 <strong>{birth}</strong></div>
        <div className={styles.metaGrid}>투타 <strong>{batThrow}</strong></div>
      </section>

      {/* 상단 정보 그리드 */}
      <section className={styles.infoGrid}>
        {/* 기록 */}
        <section className={styles.statBlock}>
          <div className={styles.statHeader}>
            <span>시즌</span><span>경기수</span><span>타율</span>
            <span>타수</span><span>안타</span><span>홈런</span><span>도루</span>
          </div>
          <div className={styles.statValue}>
            <span>{careerStats.seasons}</span>
            <span>{careerStats.games}</span>
            <span>{careerStats.avg}</span>
            <span>{careerStats.atBats}</span>
            <span>{careerStats.hits}</span>
            <span>{careerStats.homeRuns}</span>
            <span>{careerStats.steals}</span>
          </div>
        </section>

        {/* 능력치 */}
        <section className={styles.attrBlock}>
          <div className={styles.attrHeader}>
            <span>정확</span><span>파워</span><span>선구</span><span>주력</span><span>수비</span>
          </div>
          <div className={styles.attrValue}>
            <span className={calcAttrClass(attributes.accuracy)}>{attributes.accuracy}</span>
            <span className={calcAttrClass(attributes.power)}>{attributes.power}</span>
            <span className={calcAttrClass(attributes.contact)}>{attributes.contact}</span>
            <span className={calcAttrClass(attributes.speed)}>{attributes.speed}</span>
            <span className={calcAttrClass(attributes.defense)}>{attributes.defense}</span>
          </div>
        </section>

        {/* 고유능력 */}
        <section className={styles.cardInfo}>
          고유능력 <span>강화 횟수 0 / 7</span>
        </section>
      </section>

      {/* 슬롯 */}
      <section className={styles.slotWrap}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`${styles.slot} ${
              skills?.[i] ? styles[skills[i].grade.toLowerCase()] : ""
            }`}
          >
            {skills?.[i] && <strong>{skills[i].name} {skills[i].upgrade}</strong>}
          </div>
        ))}
      </section>

      {/* 특성 */}
      <footer className={styles.traits}>
        <div className={styles.option}>
          {traits.map(t => (
            <span key={t} className={calcOptionClass(t)}>{t}</span>
          ))}
        </div>
        <span>{hitter.grade}</span>
      </footer>
    </article>
  );
};

export default HitterSkillCard;
