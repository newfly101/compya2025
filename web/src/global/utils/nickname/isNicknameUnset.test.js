// 실행: node src/global/utils/nickname/isNicknameUnset.test.js (assert 기반)
import assert from "node:assert/strict";
import { isNicknameUnset } from "./isNicknameUnset.js";

assert.equal(isNicknameUnset(null), false);
assert.equal(isNicknameUnset({ nickname: "홍길동" }), false);
assert.equal(isNicknameUnset({ nickname: "홍***" }), true);
assert.equal(isNicknameUnset({ nickname: "" }), true);
assert.equal(isNicknameUnset({ nickname: null }), true);
assert.equal(isNicknameUnset({ nickname: "홍길동", nicknameSet: false }), true);
assert.equal(isNicknameUnset({ nickname: "홍길동", nicknameSet: true }), false);
console.log("isNicknameUnset ok");
