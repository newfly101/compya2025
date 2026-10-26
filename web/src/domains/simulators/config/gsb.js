// 고스변(고급 고유능력 변경권) · 선변(고유능력 선택 변경권) 뽑기 규칙 — 순수 함수만. 서버·화면 지식 없음.
// 규칙 원천: 게임 공지 확률표 (레전드 선수 전용). 스킬은 { serverId, name, grade } — grade 는 노말·히어로·플래티넘·레전드.
// rng(n) 은 0 이상 n 미만의 정수를 돌려주는 함수다. 테스트는 이걸 갈아 끼운다.

export const SLOT_COUNT = 3;

// 🟨 가정: 스킬마다 붙는 등급 글자(E·D·C)는 각각 1/3 — 공지된 확률이 없다. 바꿀 땐 TIERS 와 randTier 만 고친다.
export const TIERS = ["E", "D", "C"];
export const randTier = (rng = randInt) => TIERS[rng(TIERS.length)];

// [레전드 칸 수, 플래티넘 칸 수, 노말·히어로 칸 수, 확률 %]. 합계 99.9999 — 남는 0.0001 은 마지막 행에 붙인다.
export const ROLL_TABLE = [
  [0, 1, 2, 33.5851],
  [0, 2, 1, 16.1208],
  [1, 0, 2, 18.0843],
  [1, 1, 1, 18.8076],
  [2, 0, 1, 4.3402],
  [0, 3, 0, 2.2734],
  [1, 2, 0, 4.3402],
  [2, 1, 0, 2.1701],
  [3, 0, 0, 0.2782],
];

const UNIT = 10000; // 소수 4자리 → 정수. 전체 = 100 * UNIT
export const TOTAL_UNITS = 100 * UNIT;
const unitsOf = (row, i) => Math.round(row[3] * UNIT) + (i === ROLL_TABLE.length - 1 ? 1 : 0);

const RANK = { 레전드: 0, 플래티넘: 1, 히어로: 2, 노말: 2 };
const sortByGrade = (skills) => [...skills].sort((a, b) => RANK[a.grade] - RANK[b.grade]);

/** 0 이상 n 미만 균등 정수 — 모듈로 편향이 없게 범위 밖 값은 버리고 다시 뽑는다 */
export const randInt = (n) => {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / n) * n;
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % n;
};

/** 스킬 목록(한 직종) → 뽑기 풀. 레전드 · 플래티넘 · 노말+히어로 */
export const buildPools = (skills) => ({
  legend: skills.filter((s) => s.grade === "레전드"),
  platinum: skills.filter((s) => s.grade === "플래티넘"),
  normalHero: skills.filter((s) => s.grade === "노말" || s.grade === "히어로"),
});

const pickRow = (rng) => {
  let r = rng(TOTAL_UNITS);
  for (let i = 0; i < ROLL_TABLE.length; i += 1) {
    r -= unitsOf(ROLL_TABLE[i], i);
    if (r < 0) return ROLL_TABLE[i];
  }
  return ROLL_TABLE[ROLL_TABLE.length - 1];
};

// 이미 뽑힌 이름(등급이 달라도 같은 이름)을 뺀 풀에서 1/n 로 한 개
const pickFrom = (pool, takenNames, rng) => {
  const rest = pool.filter((s) => !takenNames.has(s.name));
  if (rest.length === 0) throw new Error("뽑을 스킬이 없습니다");
  return rest[rng(rest.length)];
};

/** 고스변 — 조합을 확률표대로 뽑고, 칸마다 그 등급 풀에서 이름이 겹치지 않게 뽑는다. 결과는 레전드→플래티넘→노말·히어로 순 */
export const rollGsb = (pools, rng = randInt) => {
  const [legend, platinum, normalHero] = pickRow(rng);
  const kinds = [
    ...Array(legend).fill(pools.legend),
    ...Array(platinum).fill(pools.platinum),
    ...Array(normalHero).fill(pools.normalHero),
  ];
  const picked = [];
  const names = new Set();
  kinds.forEach((pool) => {
    const s = pickFrom(pool, names, rng);
    picked.push({ ...s, tier: randTier(rng) });
    names.add(s.name);
  });
  return sortByGrade(picked);
};

/** 선변 — index 칸 하나만 노말·히어로·플래티넘 풀에서 새로 뽑는다. 지금 3칸(고른 칸 포함)과 이름이 같은 스킬은 모두 뺀다 */
export const rollSelect = (pools, current, index, rng = randInt) => {
  const names = new Set(current.map((s) => s.name));
  const next = { ...pickFrom([...pools.normalHero, ...pools.platinum], names, rng), tier: randTier(rng) };
  return sortByGrade(current.map((s, i) => (i === index ? next : s))); // current 의 각 칸은 tier 를 달고 온다
};

export const emptyEntry = () => ({ g: 0, c: 0, s: [], t: [] }); // s 스킬 id 3 · t 등급 글자 3(옛 기록은 비어 있다)
