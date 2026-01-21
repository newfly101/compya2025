import React from "react";
import styles from "./SkillCard.module.scss";

const PitcherSkillCard = ({ pitcher, skills }) => {
  const {
    card,
    identity,
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
    <article className={styles.skillCard}>
      {/* 이름 */}
      <header className={styles.teamName}>{identity.name}</header>

      {/* 기본 정보 */}
      <section className={styles.metaBlock}>
        <div className={styles.metaGrid}>소속팀 <strong>{identity.team.teamName}</strong></div>
        <div className={styles.metaGrid}>포지션 <strong>{card.positions}</strong></div>
        <div className={styles.metaGrid}>등번호 <strong>{identity.backNumber}번</strong></div>
        <div className={styles.metaGrid}>생년월일 <strong>{identity.birth}</strong></div>
        <div className={styles.metaGrid}>투타 <strong>{identity.batThrow}</strong></div>
      </section>

      {/* 상단 정보 그리드 */}
      <section className={styles.infoGrid}>
        {/* 기록 */}

        <section className={styles.statBlock}>
          <div className={styles.statHeader}>
            <span>시즌</span><span>경기수</span><span>방어율</span>
            <span>승</span><span>패</span><span>세이브</span><span>삼진</span>
          </div>
          {pitcher.careerStats ?
            <div className={styles.statValue}>
              <span>{pitcher.seasons}</span>
              <span>{careerStats.games}</span>
              <span>{careerStats.era}</span>
              <span>{careerStats.wins}</span>
              <span>{careerStats.losses}</span>
              <span>{careerStats.saves}</span>
              <span>{careerStats.strikeouts}</span>
            </div>
            :
            <div className={styles.statValue}>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
            </div>
          }
        </section>

        {/* 능력치 */}
        <section className={styles.attrBlock}>
          <div className={styles.attrHeader}>
            <span>제구</span><span>구위</span><span>체력</span><span>직구</span><span>변화</span>
          </div>
          <div className={styles.attrValue}>
            <span className={calcAttrClass(card.attributes.control)}>{card.attributes.control}</span>
            <span className={calcAttrClass(card.attributes.breaking)}>{card.attributes.breaking}</span>
            <span className={calcAttrClass(card.attributes.stamina)}>{card.attributes.stamina}</span>
            <span className={calcAttrClass(card.attributes.velocity)}>{card.attributes.velocity}</span>
            <span className={calcAttrClass(card.attributes.movement)}>{card.attributes.movement}</span>
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
          {card.traits.map(t => (
            <span key={t} className={calcOptionClass(t)}>{t}</span>
          ))}
        </div>
        <span>{identity.grade}</span>
      </footer>
    </article>
  );
};

export default PitcherSkillCard;
