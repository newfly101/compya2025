import React from "react";
import styles from "./SkillCard.module.scss";
import { calcAttrClass } from "./skillCardUtils.js";
import SkillCardMeta from "./SkillCardMeta.jsx";
import SkillSlots from "./SkillSlots.jsx";
import SkillTraits from "./SkillTraits.jsx";

const PITCHER_STAT_HEADERS = ["시즌", "경기수", "방어율", "승", "패", "세이브", "삼진"];
const PITCHER_ATTR_HEADERS = ["제구", "구위", "체력", "직구", "변화"];

const PitcherSkillCard = ({ pitcher, skills }) => {
  const { card, identity, career } = pitcher;

  return (
    <article className={styles.skillCard}>
      <header className={styles.teamName}>{identity.name}</header>

      <SkillCardMeta identity={identity} positions={card.positions} />

      <section className={styles.infoGrid}>
        <section className={styles.statBlock}>
          <div className={styles.statHeader}>
            {PITCHER_STAT_HEADERS.map((h) => <span key={h}>{h}</span>)}
          </div>
          <div className={styles.statValue}>
            {career ? (
              <>
                <span>{career.seasons}</span>
                <span>{career.games}</span>
                <span>{career.era}</span>
                <span>{career.wins}</span>
                <span>{career.losses}</span>
                <span>{career.saves}</span>
                <span>{career.strikeouts}</span>
              </>
            ) : (
              PITCHER_STAT_HEADERS.map((h) => <span key={h}>-</span>)
            )}
          </div>
        </section>

        <section className={styles.attrBlock}>
          <div className={styles.attrHeader}>
            {PITCHER_ATTR_HEADERS.map((h) => <span key={h}>{h}</span>)}
          </div>
          <div className={styles.attrValue}>
            <span className={calcAttrClass(card.attributes.control)}>{card.attributes.control}</span>
            <span className={calcAttrClass(card.attributes.breaking)}>{card.attributes.breaking}</span>
            <span className={calcAttrClass(card.attributes.stamina)}>{card.attributes.stamina}</span>
            <span className={calcAttrClass(card.attributes.velocity)}>{card.attributes.velocity}</span>
            <span className={calcAttrClass(card.attributes.movement)}>{card.attributes.movement}</span>
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

export default PitcherSkillCard;
