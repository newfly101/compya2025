// 실행: node src/domains/legendCollections/config/todayHistory.test.js (프로젝트에 테스트 러너 없음 — assert 기반)
import assert from "node:assert/strict";
import { buildTodayHistory } from "./todayHistory.js";

const it = (dayNo, legendId, frame, card = "c") => ({ dayNo, legendId, legendName: `L${legendId}`, card, frame });
const items = [
  it(3, 20, false, "a"),
  it(3, 10, true, "b"),
  it(3, 99, true, "x"), // 선호 아님 → 버림
  it(3, 10, true, "c"),
  it(5, 20, false),
  it(5, 10, true),
  it(9, 10, true),
  it(1, 10, true), // 지난 일정
];
const prefs = [10, 20]; // 10 = 선호 1위

const r = buildTodayHistory(items, prefs, 3);
assert.equal(r.count, 3);
// 액자 있는 묶음 먼저(선호 순), 없는 묶음은 따로
assert.deepEqual(r.withFrame.map((i) => [i.legendId, i.card, i.rank]), [[10, "b", 1], [10, "c", 1]]);
assert.deepEqual(r.withoutFrame.map((i) => [i.legendId, i.rank]), [[20, 2]]);
// 다음 일정 = 오늘 이후 가장 가까운 일차와 장수
assert.deepEqual(r.next, { dayNo: 5, count: 2 });

// 오늘 없음 → count 0 (카드 숨김 조건), 다음은 있음
const none = buildTodayHistory(items, prefs, 4);
assert.equal(none.count, 0);
assert.deepEqual(none.next, { dayNo: 5, count: 2 });
// 마지막 일정 이후 → 다음 없음
assert.equal(buildTodayHistory(items, prefs, 9).next, null);
// 선호 0명 → 전부 비어 있음
assert.deepEqual(buildTodayHistory(items, [], 3), { count: 0, withFrame: [], withoutFrame: [], next: null });

console.log("todayHistory ok");
