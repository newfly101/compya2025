import { PITCHER_POSITION_SCORE } from "@/data/skill/pitcherPositionScore.js";
import { PITCHER_SKILL_META }    from "@/data/skill/pitcherSkillMeta.js";
import { PITCHER_COMBO_PRESETS } from "@/data/skill/pitcherComboPresets.js";

export const PITCHER_POSITIONS = ["선발", "중계", "마무리"];

// 타자 조건부 안내 (타순/슬롯은 FE에서 별도 표시)
export const HITTER_CONDITIONAL_NOTES = {
  L6:  "3번째 슬롯 +8",
  P3:  "1번 타순일 때 유효",
  P6:  "온라인 7점 / 오프라인 4점",
  P11: "5~6번 타순일 때 유효",
  P12: "4번 타순일 때 유효",
};

// -------------------------------------------------------
// 공통
// -------------------------------------------------------
const buildConfigMap = (configList) =>
  configList.reduce((map, row) => {
    (map[row.skillCode] ??= []).push(row);
    return map;
  }, {});

const calcSkillPoint = (skillCode, position, allCodes, configMap, isPitcher) => {
  // 1. 포지션 예외 먼저 확인
  if (isPitcher && PITCHER_POSITION_SCORE[skillCode] !== undefined) {
    return PITCHER_POSITION_SCORE[skillCode][position] ?? 1;
  }

  // 2. DB 기본 점수
  let point = configMap[skillCode]?.find(r => r.conditionType === "NONE")?.point ?? 1;

  // 3. WITH_SKILL 조건부 적용
  for (const cond of (configMap[skillCode]?.filter(r => r.conditionType === "WITH_SKILL") ?? [])) {
    if (!allCodes.includes(cond.conditionValue)) continue;
    point += cond.effectType === "ADD" ? cond.effectPoint : -cond.effectPoint;
  }

  return point;
};

// -------------------------------------------------------
// 투수
// -------------------------------------------------------

/** 포지션별 카드 총점 계산 */
const calcCardScore = (skillCodes, position, configMap) =>
  skillCodes.reduce((sum, code) =>
    sum + calcSkillPoint(code, position, skillCodes, configMap, true), 0);

/** 현재 스킬 조합에서 상극/시너지 관계 추출 */
const analyzeRelations = (skillCodes) => {
  const conflicts = [];
  const synergies = [];

  for (const code of skillCodes) {
    const meta = PITCHER_SKILL_META[code];
    if (!meta) continue;

    for (const other of skillCodes) {
      if (other === code) continue;

      if (meta.conflictsWith.includes(other) &&
          !conflicts.some(c => c.includes(code) && c.includes(other))) {
        conflicts.push([code, other]);
      }
      if (meta.synergyWith.includes(other) &&
          !synergies.some(s => s.includes(code) && s.includes(other))) {
        synergies.push([code, other]);
      }
    }
  }

  return { conflicts, synergies };
};

/**
 * 투수 추천 포지션 + 점수 전체 결과
 * @returns {{
 *   rows: Array<{position, breakdown, total, recommended}>,
 *   recommendedPosition: string,
 *   matchedPreset: object|null,
 *   isHighEnd: boolean,
 *   conflicts: Array<[string, string]>,
 *   synergies: Array<[string, string]>,
 * }}
 */
export const calcPitcherRecommendation = (skills, pitcherConfig) => {
  if (!skills?.length || !pitcherConfig?.length) return null;

  const configMap  = buildConfigMap(pitcherConfig);
  const skillCodes = skills.map(s => s.skillCode);

  // 포지션별 점수 계산
  const scores = Object.fromEntries(
    PITCHER_POSITIONS.map(pos => [pos, calcCardScore(skillCodes, pos, configMap)])
  );

  // 포지션별 스킬 breakdown
  const rows = PITCHER_POSITIONS.map(position => {
    const breakdown = skills.map(skill => {
      const point = calcSkillPoint(skill.skillCode, position, skillCodes, configMap, true);
      return { name: skill.name, grade: skill.grade, skillCode: skill.skillCode, score: point };
    });
    return { position, breakdown, total: scores[position] };
  });

  // 추천 포지션: 점수 최고점 → 동점 시 preferredPosition 집계로 tie-break
  const maxScore = Math.max(...Object.values(scores));
  const topPositions = PITCHER_POSITIONS.filter(p => scores[p] === maxScore);

  let recommendedPosition;
  if (topPositions.length === 1) {
    recommendedPosition = topPositions[0];
  } else {
    const posCount = { 선발: 0, 중계: 0, 마무리: 0 };
    skillCodes
      .map(code => PITCHER_SKILL_META[code]?.preferredPosition)
      .filter(p => p && p !== "ALL")
      .forEach(p => { if (posCount[p] !== undefined) posCount[p]++; });

    recommendedPosition = topPositions
      .sort((a, b) => posCount[b] - posCount[a])[0];
  }

  // 프리셋 매칭 (가장 긴 매칭 우선)
  const matchedPreset = PITCHER_COMBO_PRESETS
    .filter(p => p.skills.every(s => skillCodes.includes(s)))
    .sort((a, b) => b.skills.length - a.skills.length)[0] ?? null;

  const { conflicts, synergies } = analyzeRelations(skillCodes);

  return {
    rows: rows.map(r => ({ ...r, recommended: r.position === recommendedPosition })),
    scores,
    recommendedPosition,
    matchedPreset,
    isHighEnd: Math.max(...Object.values(scores)) >= 30,
    conflicts,
    synergies,
  };
};

// -------------------------------------------------------
// 타자
// -------------------------------------------------------
export const calcHitterScoreRow = (skills, hitterConfig) => {
  if (!skills?.length || !hitterConfig?.length) return null;

  const configMap  = buildConfigMap(hitterConfig);
  const skillCodes = skills.map(s => s.skillCode);

  const breakdown = skills.map(skill => ({
    name: skill.name,
    grade: skill.grade,
    score: calcSkillPoint(skill.skillCode, null, skillCodes, configMap, false),
    note: HITTER_CONDITIONAL_NOTES[skill.skillCode] ?? null,
  }));

  return { breakdown, total: breakdown.reduce((s, b) => s + b.score, 0) };
};
