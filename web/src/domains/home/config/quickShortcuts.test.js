// 실행: node src/domains/home/config/quickShortcuts.test.js (프로젝트에 테스트 러너 없음 — assert 기반)
import assert from "node:assert/strict";
import { BASE_KEYS, MAX_SHORTCUTS, defaultKeys, moveKey, parse, resolveKeys, serialize, toggleKey } from "./quickShortcuts.js";

const VALID = [...BASE_KEYS, "legend-collections", "legend-skills", "coupons", "guides", "events", "notices"];

// 비로그인 기본 = 기존 7개, 로그인 기본 = 보유 현황·스킬 기록이 앞 + 8개로 자름 (REQ-HM-09·14)
assert.deepEqual(defaultKeys(false), BASE_KEYS);
assert.equal(defaultKeys(true).length, MAX_SHORTCUTS);
assert.deepEqual(defaultKeys(true).slice(0, 3), ["legend-collections", "legend-skills", "legend-stats"]);
assert.ok(!defaultKeys(true).includes("simulator")); // 뒤쪽 잘림

// 저장 형식 왕복 — { key, order } 목록
const keys = ["odds", "history", "coupons"];
assert.deepEqual(JSON.parse(serialize(keys)).items, [{ key: "odds", order: 0 }, { key: "history", order: 1 }, { key: "coupons", order: 2 }]);
assert.deepEqual(parse(serialize(keys)), keys);
// order 가 섞여 있어도 순서대로
assert.deepEqual(parse(JSON.stringify({ version: 1, items: [{ key: "a", order: 2 }, { key: "b", order: 0 }] })), ["b", "a"]);
// 깨진 값 · 다른 버전
assert.equal(parse("{oops"), null);
assert.equal(parse(JSON.stringify({ version: 2, items: [] })), null);
assert.equal(parse(null), null);

// 로그인: 저장값 사용, 모르는 키·중복 버림, 8개 초과 자름
assert.deepEqual(resolveKeys(["odds", "nope", "odds", "history"], VALID, true), ["odds", "history"]);
assert.equal(resolveKeys(VALID, VALID, true).length, MAX_SHORTCUTS);
// 저장 없음·전부 무효 → 기본
assert.deepEqual(resolveKeys(null, VALID, true), defaultKeys(true));
assert.deepEqual(resolveKeys(["nope"], VALID, true), defaultKeys(true));
// 비로그인은 저장값 무시 + 로그인 항목 없음
assert.deepEqual(resolveKeys(["odds"], VALID, false), BASE_KEYS);
assert.ok(!resolveKeys(["legend-skills"], VALID, false).includes("legend-skills"));

// 선택·해제 — 8개에서는 추가 안 됨
assert.deepEqual(toggleKey(["a", "b"], "b"), ["a"]);
assert.deepEqual(toggleKey(["a"], "c"), ["a", "c"]);
const full = ["1", "2", "3", "4", "5", "6", "7", "8"];
assert.equal(toggleKey(full, "9"), full);

// 순서 변경
assert.deepEqual(moveKey(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
assert.deepEqual(moveKey(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
const same = ["a", "b"];
assert.equal(moveKey(same, 1, 1), same);
assert.equal(moveKey(same, 0, 5), same);

console.log("quickShortcuts ok");
