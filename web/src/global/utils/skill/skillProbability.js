export const PROB_NORMAL = [
  { p: 64.6123, combo: { platinum: 1, normal: 2 } },
  { p: 31.0139, combo: { platinum: 2, normal: 1 } },
  { p: 4.3738, combo: { platinum: 3, normal: 0 } }
];

export const PROB_LEGEND = [
  { p: 33.5851, combo: { legend: 0, platinum: 1, normal: 2 } },
  { p: 16.1208, combo: { legend: 0, platinum: 2, normal: 1 } },
  { p: 18.0843, combo: { legend: 1, platinum: 0, normal: 2 } },
  { p: 18.8076, combo: { legend: 1, platinum: 1, normal: 1 } },
  { p: 4.3402, combo: { legend: 2, platinum: 0, normal: 1 } },
  { p: 2.2734, combo: { legend: 0, platinum: 3, normal: 0 } },
  { p: 4.3402, combo: { legend: 1, platinum: 2, normal: 0 } },
  { p: 2.1701, combo: { legend: 2, platinum: 1, normal: 0 } },
  { p: 0.2782, combo: { legend: 3, platinum: 0, normal: 0 } }
];

export const secureRandom = () => {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / 2 ** 32;
};

export const pickByProbability = (table) => {
  const r = secureRandom() * 100;
  let acc = 0;

  for (const row of table) {
    acc += row.p;
    if (r <= acc) return row.combo;
  }
};
