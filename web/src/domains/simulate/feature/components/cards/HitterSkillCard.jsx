import React from "react";
import styles from "./SkillCard.module.scss";
import { calcAttrClass } from "./skillCardUtils.js";
import SkillCardMeta from "./SkillCardMeta.jsx";
import SkillSlots from "./SkillSlots.jsx";
import SkillTraits from "./SkillTraits.jsx";

const HITTER_STAT_HEADERS = ["시즌", "경기수", "타율", "타수", "안타", "홈런", "도루"];
const HITTER_ATTR_HEADERS = ["정확", "파워", "선구", "주력", "수비"];

const HitterSkillCard = ({ hitter, skills }) => {
  const { card, identity, career } = hitter;

  return (
    <article className={styles.skillCard}>
      <header className={styles.teamName}>{identity.name}</header>

      <SkillCardMeta identity={identity} positions={card.positions} />

      <section className={styles.infoGrid}>
        <section className={styles.statBlock}>
          <div className={styles.statHeader}>
            {HITTER_STAT_HEADERS.map((h) => <span key={h}>{h}</span>)}
          </div>
          <div className={styles.statValue}>
            {career ? (
              <>
                <span>{career.seasons}</span>
                <span>{career.games}</span>
                <span>{career.avg}</span>
                <span>{career.atBats}</span>
                <span>{career.hits}</span>
                <span>{career.homeRuns}</span>
                <span>{career.runs}</span>
              </>
            ) : (
              HITTER_STAT_HEADERS.map((h) => <span key={h}>-</span>)
            )}
          </div>
        </section>

        <section className={styles.attrBlock}>
          <div className={styles.attrHeader}>
            {HITTER_ATTR_HEADERS.map((h) => <span key={h}>{h}</span>)}
          </div>
          <div className={styles.attrValue}>
            <span className={calcAttrClass(card.attributes.accuracy)}>{card.attributes.accuracy}</span>
            <span className={calcAttrClass(card.attributes.power)}>{card.attributes.power}</span>
            <span className={calcAttrClass(card.attributes.contact)}>{card.attributes.contact}</span>
            <span className={calcAttrClass(card.attributes.speed)}>{card.attributes.speed}</span>
            <span className={calcAttrClass(card.attributes.defense)}>{card.attributes.defense}</span>
          </div>
        </section>

        <section className={styles.cardInfo}>
          고유능력 <span>강화 횟수 0 / 7</span>
        </section>
      </section>

      <SkillSlots skills={skills} />

      <SkillTraits traits={card.traits} grade={identity.grade} />
    </article>
  );
};

export default HitterSkillCard;
