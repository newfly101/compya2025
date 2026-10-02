// 실행: node src/domains/legendCollections/config/legendCollections.test.js (프로젝트에 테스트 러너 없음 — assert 기반)
import assert from "node:assert/strict";
import { LEGEND, SORT, DEFAULT_SORT, PREF_SORT, nextSort, prefLabel, sortLegends, sortMark, sortText } from "./legendCollections.js";

const L = (id, name) => ({ id, name });
const legends = [L(1, "가"), L(2, "나"), L(3, "다"), L(4, "라")];
const st = { 1: LEGEND.NONE, 2: LEGEND.OWNED, 3: LEGEND.FRAME, 4: LEGEND.NONE };
const run = (sort, prefOf) =>
  sortLegends(legends, sort, () => 0, (l) => st[l.id], () => null, prefOf).map((l) => l.id);

// 상태: 3단계 순환 — 미보유 먼저 → 액자 먼저 → 보유중 먼저 → 다시 미보유 먼저 (같은 값은 기존 순서 유지)
const s1 = nextSort(null, SORT.STATUS);
const s2 = nextSort(s1, SORT.STATUS);
const s3 = nextSort(s2, SORT.STATUS);
assert.deepEqual(run(s1), [1, 4, 3, 2]);
assert.deepEqual(run(s2), [3, 2, 1, 4]);
assert.deepEqual(run(s3), [2, 1, 4, 3]);
assert.deepEqual([sortText(s1), sortText(s2), sortText(s3)], ["미보유 먼저", "액자 먼저", "보유중 먼저"]);
assert.equal(nextSort(s3, SORT.STATUS).first, s1.first);
assert.equal(sortMark({ key: SORT.STATUS, dir: -1 }, SORT.STATUS), "▼");
assert.equal(sortMark({ key: SORT.STATUS, dir: -1 }, SORT.NAME), "");

// 선호: 순위 오름/내림, 선호 없는 행은 어느 방향이든 뒤
const pref = { 4: 1, 1: 2 };
const prefOf = (l) => pref[l.id] ?? 0;
assert.deepEqual(run(PREF_SORT, prefOf).slice(0, 2), [4, 1]);
assert.deepEqual(run({ key: SORT.PREF, dir: -1 }, prefOf).slice(0, 2), [1, 4]);
assert.deepEqual(run({ key: SORT.PREF, dir: -1 }, prefOf).slice(2).sort(), [2, 3]);
assert.equal(prefLabel(3), "선호3");
assert.equal(prefLabel(0), "-");

// 정렬 기준 글자
assert.equal(sortText(DEFAULT_SORT), "보유 많은 순");
assert.equal(sortText({ key: SORT.DATE, dir: -1 }), "획득일 최신순");
console.log("legendCollections sort ok");
