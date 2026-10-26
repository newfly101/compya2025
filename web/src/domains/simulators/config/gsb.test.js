// 실행: node src/domains/simulators/config/gsb.test.js (프로젝트에 테스트 러너 없음 — assert 기반)
import assert from "node:assert/strict";
import { ROLL_TABLE, TIERS, TOTAL_UNITS, buildPools, randInt, rollGsb, rollSelect } from "./gsb.js";

// 확률 합 = 100 (남는 0.0001 은 마지막 행)
const sum = ROLL_TABLE.reduce((a, r) => a + Math.round(r[3] * 10000), 0) + 1;
assert.equal(sum, TOTAL_UNITS);
assert.ok(ROLL_TABLE.every((r) => r[0] + r[1] + r[2] === 3), "모든 조합은 3칸");

// 풀 — 노말+히어로 26(이름 겹침 포함) · 플래티넘 13 · 레전드 7. 일부러 등급이 다른 같은 이름을 넣는다
const mk = (grade, n, prefix) => Array.from({ length: n }, (_, i) => ({ serverId: `${prefix}${i}`, name: `${prefix}${i}`, grade }));
const skills = [...mk("노말", 13, "n"), ...mk("히어로", 13, "h"), ...mk("플래티넘", 13, "p"), ...mk("레전드", 7, "l")];
skills.push({ serverId: "dup", name: "n0", grade: "플래티넘" }); // 노말 n0 와 이름이 같은 플래티넘
const pools = buildPools(skills);
assert.equal(pools.normalHero.length, 26);
assert.equal(pools.platinum.length, 14);
assert.equal(pools.legend.length, 7);

// rng 주입 — 항상 0 이면 확률표 첫 행(0,1,2) → 플래티넘 1 + 노말·히어로 2, 정렬은 플래티넘이 먼저
const zero = () => 0;
const first = rollGsb(pools, zero);
assert.deepEqual(first.map((s) => s.grade), ["플래티넘", "노말", "노말"]);
// 마지막 값(TOTAL_UNITS-1)이면 마지막 행(3,0,0) → 레전드 3
const last = rollGsb(pools, (n) => (n === TOTAL_UNITS ? n - 1 : 0));
assert.deepEqual(last.map((s) => s.grade), ["레전드", "레전드", "레전드"]);

// 수천 회 — 3칸 이름 중복 0, 정렬 순서 유지
const RANK = { 레전드: 0, 플래티넘: 1, 히어로: 2, 노말: 2 };
for (let i = 0; i < 5000; i += 1) {
  const r = rollGsb(pools, randInt);
  assert.equal(r.length, 3);
  assert.equal(new Set(r.map((s) => s.name)).size, 3, "이름 중복");
  for (let k = 1; k < 3; k += 1) assert.ok(RANK[r[k - 1].grade] <= RANK[r[k].grade], "등급 정렬");
  r.forEach((s) => assert.ok(TIERS.includes(s.tier), "등급 글자는 E·D·C"));
}

// 선변 — 레전드가 나오지 않고, 고른 칸 포함 지금 3칸과 같은 이름이 다시 나오지 않으며, 다른 두 칸은 그대로
for (let i = 0; i < 5000; i += 1) {
  const cur = rollGsb(pools, randInt);
  const idx = randInt(3);
  const out = rollSelect(pools, cur, idx, randInt);
  assert.equal(out.length, 3);
  assert.equal(new Set(out.map((s) => s.name)).size, 3, "선변 후 이름 중복");
  const before = new Set(cur.map((s) => s.serverId));
  const added = out.filter((s) => !before.has(s.serverId));
  assert.equal(added.length, 1, "한 칸만 바뀜");
  assert.notEqual(added[0].grade, "레전드", "선변에 레전드 없음");
  assert.ok(!cur.some((s) => s.name === added[0].name), "원래 3칸과 같은 이름 제외");
  assert.ok(TIERS.includes(added[0].tier), "새 칸 등급 글자는 E·D·C");
  cur.filter((_, k) => k !== idx).forEach((s) => assert.ok(out.includes(s), "다른 칸(등급 글자 포함) 유지")); // 같은 객체라 tier 도 그대로
}

// randInt 범위
for (let i = 0; i < 1000; i += 1) assert.ok(randInt(7) >= 0 && randInt(7) < 7);

console.log("gsb.test.js 통과");
