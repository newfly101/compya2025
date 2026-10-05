// 실행: node src/domains/legendCollectionSkills/config/legendCollectionSkills.test.js (프로젝트에 테스트 러너 없음 — assert 기반)
import assert from "node:assert/strict";
import { ACTION, BULK, applyActions, showEnhanceControls, bulkEnabled, calcNeed, canEnhance, enhanceEnabled, enhanceSummary, gradeColorKey, groupSkillsByGrade, isEditLocked, isRecommended, isRegistered, slotCanTake, sortByOwned, SKSORT, DEFAULT_SKSORT, nextSkillSort, skillSortMark, skillSortText, sortSkillRows } from "./legendCollectionSkills.js";

// spec REQ-LCSK-05 예: 위압감 D·캡틴 E(레전드) · 배팅머신 C → 3+4+3−7 = 고추강 3, 고고각 2
assert.deepEqual(
  calcNeed([
    { baseGrade: "D", skillGrade: "레전드" },
    { baseGrade: "E", skillGrade: "레전드" },
    { baseGrade: "C", skillGrade: "플래티넘" },
  ]),
  { ggg: 2, gcg: 3 },
);
// 플래티넘은 S 까지: C→S = 3
assert.deepEqual(calcNeed([{ baseGrade: "C", skillGrade: "플래티넘" }, { baseGrade: "A", skillGrade: "노말" }, { baseGrade: "A", skillGrade: "히어로" }]), { ggg: 0, gcg: 0 });
// 음수는 0
assert.equal(calcNeed([{ baseGrade: "C", skillGrade: "노말" }, { baseGrade: "C", skillGrade: "노말" }, { baseGrade: "C", skillGrade: "노말" }]).gcg, 0);

const slots = (a, b, c) => [
  { currentGrade: a, skillGrade: "레전드" },
  { currentGrade: b, skillGrade: "플래티넘" },
  { currentGrade: c, skillGrade: "노말" },
];
const usg = (base, gcg = 0, ggg = 0) => ({ base, gcg, ggg });
const E = ACTION;

// 기본 강화 남음 → 기본만
assert.deepEqual(enhanceEnabled(slots("E", "E", "E"), usg(3), null), { [E.BASE_UP]: true, [E.GCG_UP]: false, [E.GGG_UP]: false });
// 7회 소진 → 고추강, 레전드 A 면 고고각도
assert.deepEqual(enhanceEnabled(slots("A", "C", "A"), usg(7), null), { [E.BASE_UP]: false, [E.GCG_UP]: true, [E.GGG_UP]: true });
// 전부 최대(레전드 S·플래티넘 S·노말 A) → 모두 꺼짐
assert.deepEqual(enhanceEnabled(slots("S", "S", "A"), usg(7, 5, 1), null), { [E.BASE_UP]: false, [E.GCG_UP]: false, [E.GGG_UP]: false });
// 일괄: S 는 전부 숨김(꺼짐), 고고각 제외는 고고각만
assert.deepEqual(enhanceEnabled(slots("S", "S", "A"), usg(0), BULK.S), { [E.BASE_UP]: false, [E.GCG_UP]: false, [E.GGG_UP]: false });
assert.deepEqual(enhanceEnabled(slots("A", "S", "A"), usg(0), BULK.NO_GGG), { [E.BASE_UP]: false, [E.GCG_UP]: false, [E.GGG_UP]: true });
// 슬롯 적용 조건
assert.equal(slotCanTake(E.GGG_UP, { currentGrade: "A", skillGrade: "노말" }), false);
assert.equal(slotCanTake(E.GCG_UP, { currentGrade: "A", skillGrade: "플래티넘" }), true);
// 기본 강화 상한 = 스킬 등급별 최대 (플래티넘 S, 레전드·노말·히어로 A)
assert.equal(slotCanTake(E.BASE_UP, { currentGrade: "A", skillGrade: "플래티넘" }), true);
assert.equal(slotCanTake(E.BASE_UP, { currentGrade: "S", skillGrade: "플래티넘" }), false);
assert.equal(slotCanTake(E.BASE_UP, { currentGrade: "A", skillGrade: "레전드" }), false);
assert.equal(enhanceEnabled(slots("A", "A", "A"), usg(3), null)[E.BASE_UP], true);
assert.equal(enhanceEnabled(slots("A", "S", "A"), usg(3), null)[E.BASE_UP], false);
// outline 대상 판정 — 고추강: 상한 도달 슬롯 제외 / 고고각: 레전드 A 만
assert.equal(slotCanTake(E.GCG_UP, { currentGrade: "A", skillGrade: "레전드" }), false);
assert.equal(slotCanTake(E.GCG_UP, { currentGrade: "S", skillGrade: "플래티넘" }), false);
assert.equal(slotCanTake(E.GCG_UP, { currentGrade: "A", skillGrade: "노말" }), false);
assert.equal(slotCanTake(E.GGG_UP, { currentGrade: "A", skillGrade: "레전드" }), true);
assert.equal(slotCanTake(E.GGG_UP, { currentGrade: "B", skillGrade: "레전드" }), false);
assert.equal(slotCanTake(E.GGG_UP, { currentGrade: "A", skillGrade: "플래티넘" }), false);

// 등록 판정 — 미등록(null · 칸 필드 null · 일부만 채움)은 false
const empty = { skillId: null, baseGrade: null, currentGrade: null };
const full = { skillId: 1, baseGrade: "E", currentGrade: "E" };
assert.equal(isRegistered(null), false);
assert.equal(isRegistered([empty, empty, empty]), false);
assert.equal(isRegistered([full, full, empty]), false);
assert.equal(isRegistered([full, full]), false);
assert.equal(isRegistered([full, full, full]), true);

// 일괄 적용 → 되돌리기: 일괄이면 잠김, UNDO 응답(bulkMode null · usage 0)이면 풀리고 버튼은 처음 상태로
assert.equal(isEditLocked(usg(0), BULK.S), true);
assert.equal(isEditLocked(usg(0), null), false);
assert.equal(isEditLocked(usg(2), null), true);
assert.equal(canEnhance({ status: "OWNED" }), true);
assert.equal(canEnhance({ status: "FRAME" }), false);
assert.deepEqual(sortByOwned([{ id: 1, item: { status: "FRAME" } }, { id: 2, item: { status: "OWNED" } }, { id: 3, item: { status: "FRAME" } }, { id: 4, item: { status: "OWNED" } }]).map((r) => r.id), [2, 4, 1, 3]);
assert.deepEqual(enhanceEnabled(slots("E", "E", "E"), usg(0), null), { [E.BASE_UP]: true, [E.GCG_UP]: false, [E.GGG_UP]: false });

// 일괄 버튼 활성 — 이미 목표에 도달했으면 꺼진다
assert.equal(bulkEnabled(BULK.S, slots("S", "S", "A")), false);
assert.equal(bulkEnabled(BULK.NO_GGG, slots("S", "S", "A")), false);
assert.equal(bulkEnabled(BULK.NO_GGG, slots("A", "S", "A")), false);
assert.equal(bulkEnabled(BULK.S, slots("A", "S", "A")), true);
assert.equal(bulkEnabled(BULK.S, slots("E", "E", "D")), true);
assert.equal(bulkEnabled(BULK.NO_GGG, slots("E", "E", "D")), true);

// 대기 목록 적용 — E·E·D + BASE_UP slot1 ×2 → C·E·D, 강화 횟수 2, 서버 항목은 그대로
{
  const item = {
    slots: [{ skillId: 1, currentGrade: "E" }, { skillId: 2, currentGrade: "E" }, { skillId: 3, currentGrade: "D" }],
    usage: usg(0),
    enhanceCount: 0,
  };
  const r = applyActions(item, [{ action: E.BASE_UP, slot: 1 }, { action: E.BASE_UP, slot: 1 }], () => "노말");
  assert.deepEqual(r.slots.map((s) => s.currentGrade), ["C", "E", "D"]);
  assert.equal(r.enhanceCount, 2);
  assert.deepEqual(r.usage, usg(2));
  assert.equal(item.slots[0].currentGrade, "E");
}
// 저장 전(미등록·초안 변경)이면 일괄·강화 버튼 숨김
assert.equal(showEnhanceControls(false, true), false);
assert.equal(showEnhanceControls(true, false), false);
assert.equal(showEnhanceControls(true, true), true);

console.log("legendCollectionSkills config: ok");

// 강화 열: 미등록 "-"(null), 3슬롯 문자열, 색 키 매핑
{
  const sk = new Map([[1, { name: "위압감", grade: "레전드" }], [2, { name: "캡틴", grade: "플래티넘" }], [3, { name: "배팅머신", grade: "노말" }]]);
  assert.equal(enhanceSummary(null, sk), null);
  assert.equal(enhanceSummary([{ skillId: null, baseGrade: null }, {}, {}], sk), null);
  const r = enhanceSummary([{ skillId: 1, baseGrade: "E", currentGrade: "S" }, { skillId: 2, baseGrade: "E", currentGrade: "S" }, { skillId: 3, baseGrade: "E", currentGrade: "E" }], sk);
  assert.equal(r.text, "SSE");
  assert.deepEqual(r.cells.map((x) => x.key), ["legend", "platinum", "normal"]);
  assert.equal(r.label, "위압감 S, 캡틴 S, 배팅머신 E");
  assert.equal(gradeColorKey("히어로"), "hero");
}

// 스킬 묶음: 레전드→플래티넘→히어로→노말, 빈 묶음 제외, 묶음 안 순서 유지
{
  const g = groupSkillsByGrade([{ n: "a", grade: "노말" }, { n: "b", grade: "레전드" }, { n: "c", grade: "히어로" }, { n: "d", grade: "레전드" }, { n: "e", grade: "?" }]);
  assert.deepEqual(g.map((x) => x.grade), ["레전드", "히어로", "노말"]);
  assert.deepEqual(g.map((x) => x.key), ["legend", "hero", "normal"]);
  assert.deepEqual(g[0].skills.map((s) => s.n), ["b", "d"]);
  assert.deepEqual(g[2].skills.map((s) => s.n), ["a", "e"]);
}

// 추천: 등급 순서 유지, 등급 안에서 추천 먼저 → 나머지 기존 순서
{
  const sk = (name, grade, type = "hitter") => ({ name, grade, type });
  const g = groupSkillsByGrade([sk("가", "레전드"), sk("대포군단", "레전드"), sk("나", "레전드"), sk("베테랑", "레전드"), sk("배팅머신", "플래티넘"), sk("팔색조", "레전드", "pitcher")]);
  assert.deepEqual(g[0].skills.map((s) => s.name), ["대포군단", "베테랑", "팔색조", "가", "나"]);
  assert.equal(isRecommended(sk("팔색조", "레전드", "hitter")), false);
  assert.equal(isRecommended(sk("스프레이 히터", "플래티넘")), true);
  assert.equal(isRecommended(sk("스프레이히터", "플래티넘")), false);
  assert.deepEqual(g.map((x) => x.grade), ["레전드", "플래티넘"]);
}

// 목록 머리 정렬
{
  const reg = (g) => [0, 1, 2].map((i) => ({ skillId: i, baseGrade: "E", currentGrade: g[i] }));
  const row = (name, status, g) => ({ legend: { name }, item: { status, slots: g ? reg(g) : [{}, {}, {}] } });
  const rows = [row("다", "FRAME", ["E", "E", "E"]), row("가", "OWNED", null), row("나", "OWNED", ["S", "S", "A"]), row("라", "FRAME", ["A", "A", "A"])];
  const names = (s) => sortSkillRows(rows, s).map((r) => r.legend.name).join("");
  assert.equal(names(DEFAULT_SKSORT), "가나다라"); // 보유중 먼저, 같은 상태는 입력 순서
  assert.equal(names({ key: SKSORT.STATUS, dir: 1 }), "다라가나"); // 액자 먼저
  assert.equal(names({ key: SKSORT.NAME, dir: 1 }), "가나다라");
  assert.equal(names({ key: SKSORT.NAME, dir: -1 }), "라다나가");
  assert.equal(names({ key: SKSORT.ENH, dir: -1 }), "나라다가"); // 미등록(가) 항상 뒤
  assert.equal(names({ key: SKSORT.ENH, dir: 1 }), "다라나가"); // 오름차순도 미등록은 뒤
  assert.equal(names({ key: SKSORT.REG, dir: -1 }), "다나라가"); // 등록 먼저(입력 순서 유지)
  assert.equal(names({ key: SKSORT.REG, dir: 1 }), "가다나라"); // 미등록 먼저
  assert.deepEqual(nextSkillSort(DEFAULT_SKSORT, SKSORT.STATUS), { key: "status", dir: 1 });
  assert.deepEqual(nextSkillSort(DEFAULT_SKSORT, SKSORT.NAME), { key: "name", dir: 1 });
  assert.deepEqual(nextSkillSort(DEFAULT_SKSORT, SKSORT.ENH), { key: "enh", dir: -1 });
  assert.equal(skillSortMark(DEFAULT_SKSORT, SKSORT.STATUS), "▼");
  assert.equal(skillSortMark(DEFAULT_SKSORT, SKSORT.NAME), "");
  assert.equal(skillSortText(DEFAULT_SKSORT), "상태 · 보유중 먼저");
}
