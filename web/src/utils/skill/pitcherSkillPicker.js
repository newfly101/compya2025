import { PITCHER_SKILLS } from "@/data/skill/PITCHER_SKILLS.js";


// 노말 + 히어로 합산 풀
const NORMAL_POOL = [
  ...PITCHER_SKILLS.normal.map(skill => ({
    ...skill,
    tier: "NORMAL"
  })),
  ...PITCHER_SKILLS.hero.map(skill => ({
    ...skill,
    tier: "HERO"
  }))
];

export const SKILL_GRADE_PROB = [
  { grade: "C", p: 20 },
  { grade: "D", p: 35 },
  { grade: "E", p: 45 }
];

// 중복 제거 함수
const pickOneAndRemove = (pool) => {
  const index = Math.floor(Math.random() * pool.length);
  const picked = pool[index];
  pool.splice(index, 1); // ⭐ 핵심: 뽑은 즉시 제거
  return picked;
};


// 강화등급 뽑는 범용 함수
export const pickSkillUpgradeGrade = () => {
  const r = Math.random() * 100;
  let acc = 0;

  for (const row of SKILL_GRADE_PROB) {
    acc += row.p;
    if (r <= acc) return row.grade;
  }
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};


export const pickSkillsByCombo = (combo) => {
  const legendPool = [...PITCHER_SKILLS.legend];
  const platinumPool = [...PITCHER_SKILLS.platinum];
  const normalPool = [...NORMAL_POOL];

  const result = [];

  for (let i = 0; i < (combo.legend || 0); i++) {
    if (legendPool.length === 0) break;

    result.push({
      grade: "LEGEND",
      upgrade: pickSkillUpgradeGrade(),
      ...pickOneAndRemove(legendPool)
    });
  }

  for (let i = 0; i < (combo.platinum || 0); i++) {
    if (platinumPool.length === 0) break;

    result.push({
      grade: "PLATINUM",
      upgrade: pickSkillUpgradeGrade(),
      ...pickOneAndRemove(platinumPool)
    });
  }

  for (let i = 0; i < (combo.normal || 0); i++) {
    if (normalPool.length === 0) break;

    const picked = pickOneAndRemove(normalPool);

    result.push({
      grade: picked.tier, // NORMAL or HERO
      upgrade: pickSkillUpgradeGrade(),
      ...picked
    });
  }

  return shuffle(result);
};
