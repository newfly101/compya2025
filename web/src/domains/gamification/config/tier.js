// 등급(1~10) → 티어(1~5). T1 Lv1-2 · T2 Lv3-4 · T3 Lv5-6 · T4 Lv7-8 · T5 Lv9-10
export const tierOf = (level) => Math.min(5, Math.max(1, Math.ceil((level ?? 1) / 2)));
