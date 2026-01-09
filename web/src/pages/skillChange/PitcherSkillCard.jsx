import React from "react";
import styles from "@/styles/pages/skillChange/skillCard.module.scss";

const PitcherSkillCard = ({ pitcher, skills }) => {
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
  } = pitcher;

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
    <div className={styles.skillCard}>
      {/* 이름 */}
      <div className={styles.teamName}>{name}</div>

      {/* 기본 정보 */}
      <div className={styles.metaBlock}>
        <div className={styles.metaGrid}>소속팀 <strong>{team}</strong></div>
        <div className={styles.metaGrid}>포지션 <strong>{positions.join(", ")}</strong></div>
        <div className={styles.metaGrid}>등번호 <strong>{backNumber}번</strong></div>
        <div className={styles.metaGrid}>생년월일 <strong>{birth}</strong></div>
        <div className={styles.metaGrid}>투타 <strong>{batThrow}</strong></div>
      </div>

      {/* 상단 정보 그리드 */}
      <div className={styles.infoGrid}>
        {/* 기록 */}
        <div className={styles.statBlock}>
          <div className={styles.statHeader}>
            <span>시즌</span><span>경기수</span><span>방어율</span>
            <span>승</span><span>패</span><span>세이브</span><span>삼진</span>
          </div>
          <div className={styles.statValue}>
            <span>{careerStats.seasons}</span>
            <span>{careerStats.games}</span>
            <span>{careerStats.era}</span>
            <span>{careerStats.wins}</span>
            <span>{careerStats.losses}</span>
            <span>{careerStats.saves}</span>
            <span>{careerStats.strikeouts}</span>
          </div>
        </div>

        {/* 능력치 */}
        <div className={styles.attrBlock}>
          <div className={styles.attrHeader}>
            <span>제구</span><span>구위</span><span>체력</span><span>직구</span><span>변화</span>
          </div>
          <div className={styles.attrValue}>
            <span className={calcAttrClass(attributes.control)}>{attributes.control}</span>
            <span className={calcAttrClass(attributes.breaking)}>{attributes.breaking}</span>
            <span className={calcAttrClass(attributes.stamina)}>{attributes.stamina}</span>
            <span className={calcAttrClass(attributes.velocity)}>{attributes.velocity}</span>
            <span className={calcAttrClass(attributes.movement)}>{attributes.movement}</span>
          </div>
        </div>

        {/* 고유능력 */}
        <div className={styles.cardInfo}>
          고유능력 <span>강화 횟수 0 / 7</span>
        </div>
      </div>

      {/* 슬롯 */}
      <div className={styles.slotWrap}>
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
      </div>

      {/* 특성 */}
      <div className={styles.traits}>
        <div className={styles.option}>
          {traits.map(t => (
            <span key={t} className={calcOptionClass(t)}>{t}</span>
          ))}
        </div>
        <span>{pitcher.grade}</span>
      </div>
    </div>
  );
};

export default PitcherSkillCard;
