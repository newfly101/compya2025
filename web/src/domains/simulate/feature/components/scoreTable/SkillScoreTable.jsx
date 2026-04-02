import React from "react";
import styles from "./SkillScoreTable.module.scss";
import { PITCHER_SKILL_META } from "@/data/skill/pitcherSkillMeta.js";

const TIER_CLASS = { S: styles.tierS, A: styles.tierA, B: styles.tierB };

// -------------------------------------------------------
// 공통 서브 컴포넌트
// -------------------------------------------------------
const SkillGradeLabel = ({ grade, name }) => (
  <span className={styles[grade?.toLowerCase()]}>{name}</span>
);

const PresetBadge = ({ preset }) => (
  <div className={styles.presetBadge}>
    <span className={TIER_CLASS[preset.tier]}>{preset.tier}티어</span>
    <strong>{preset.label}</strong>
    <span className={styles.presetDesc}>{preset.description}</span>
  </div>
);

const RelationRow = ({ conflicts, synergies, skills }) => {
  if (!conflicts.length && !synergies.length) return null;

  const nameOf = (code) =>
    skills.find(s => s.skillCode === code)?.name
    ?? PITCHER_SKILL_META[code]?.preferredPosition
    ?? code;

  return (
    <div className={styles.relationWrap}>
      {conflicts.map(([a, b], i) => (
        <span key={i} className={styles.conflict}>
          ⚠ {nameOf(a)} × {nameOf(b)}
        </span>
      ))}
      {synergies.map(([a, b], i) => (
        <span key={i} className={styles.synergy}>
          ✦ {nameOf(a)} + {nameOf(b)} 시너지
        </span>
      ))}
    </div>
  );
};

// -------------------------------------------------------
// 투수 테이블
// -------------------------------------------------------
const PitcherScoreTable = ({ result, playerName }) => {
  const { rows, recommendedPosition, matchedPreset, isHighEnd, conflicts, synergies } = result;
  const skillHeaders = rows[0]?.breakdown ?? [];

  return (
    <div className={styles.wrap}>
      {/* 헤더 */}
      <div className={styles.tableHeader}>
        <h3 className={styles.title}>AI 추천 포지션 — {playerName}</h3>
        <div className={styles.badges}>
          <span className={styles.recommendBadge}>추천 {recommendedPosition}</span>
          {isHighEnd && <span className={styles.highEndBadge}>HIGH END ★</span>}
        </div>
      </div>

      {/* 프리셋 매칭 */}
      {matchedPreset && <PresetBadge preset={matchedPreset} />}

      {/* 점수 테이블 */}
      <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>포지션</th>
            {skillHeaders.map((s, i) => (
              <th key={i}><SkillGradeLabel grade={s.grade} name={s.name} /></th>
            ))}
            <th>총점</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ position, breakdown, total, recommended }) => (
            <tr key={position} className={recommended ? styles.recommended : ""}>
              <td className={styles.positionCell}>
                {recommended && <span className={styles.star}>★</span>}
                {position}
              </td>
              {breakdown.map((b, i) => (
                <td key={i} className={styles.scoreCell}>{b.score}</td>
              ))}
              <td className={styles.totalCell}>{total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* 상극 / 시너지 */}
      <RelationRow conflicts={conflicts} synergies={synergies} skills={skillHeaders} />
    </div>
  );
};

// -------------------------------------------------------
// 타자 테이블
// -------------------------------------------------------
const HitterScoreTable = ({ result, playerName }) => {
  const { row } = result;

  return (
    <div className={styles.wrap}>
      <div className={styles.tableHeader}>
        <h3 className={styles.title}>스킬 점수 분석 — {playerName}</h3>
        <span className={styles.totalBig}>{row.total}점</span>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {row.breakdown.map((s, i) => (
                <th key={i}><SkillGradeLabel grade={s.grade} name={s.name} /></th>
              ))}
              <th>총점</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {row.breakdown.map((b, i) => (
                <td key={i} className={styles.scoreCell}>{b.score}</td>
              ))}
              <td className={styles.totalCell}>{row.total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {row.breakdown.some(b => b.note) && (
        <ul className={styles.noteList}>
          {row.breakdown.filter(b => b.note).map((b, i) => (
            <li key={i}>
              <SkillGradeLabel grade={b.grade} name={b.name} />: {b.note}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// -------------------------------------------------------
// 진입점
// -------------------------------------------------------
const SkillScoreTable = ({ result, playerName }) => {
  if (!result) return null;
  if (result.type === "PITCHER") return <PitcherScoreTable result={result} playerName={playerName} />;
  if (result.type === "HITTER")  return <HitterScoreTable  result={result} playerName={playerName} />;
  return null;
};

export default SkillScoreTable;
