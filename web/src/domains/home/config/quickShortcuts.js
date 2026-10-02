// 홈 바로가기 — 선택·순서 규칙과 저장 형식 (순수 함수, 테스트: quickShortcuts.test.js)
// 항목 키는 서랍 메뉴(MENU_GROUPS)의 key. 저장은 { 항목 키, 순서 } 목록 한 덩어리라 서버 저장으로 옮기기 쉽다.

export const MAX_SHORTCUTS = 8;
export const STORAGE_KEY = "home.shortcuts.v1";

// 기존 퀵메뉴 7 (비로그인 기본 구성, REQ-HM-09)
export const BASE_KEYS = ["legend-stats", "history", "mileage", "players", "skills", "odds", "simulator"];
// 로그인 사용자는 이 둘이 앞에 온다 (REQ-HM-14) — 8개를 넘는 뒤쪽은 잘린다
export const MEMBER_FRONT_KEYS = ["legend-collections", "legend-skills"];

// 타일의 두 줄 라벨. 없으면 서랍 메뉴 이름 그대로
export const QUICK_LABELS = {
  "legend-stats": "재료\n검색",
  "legend-collections": "내 재료\n보유 현황",
  "legend-skills": "내 레전드\n스킬 기록",
  history: "히스토리\n재료",
  mileage: "마일리지\n저격",
  players: "선수\n백과사전",
  skills: "스킬\n백과사전",
  odds: "확률\n공시",
  simulator: "스킬\n시뮬레이터",
  coupons: "쿠폰\n코드",
};

export const defaultKeys = (isAuthenticated) =>
  isAuthenticated ? [...MEMBER_FRONT_KEYS, ...BASE_KEYS].slice(0, MAX_SHORTCUTS) : [...BASE_KEYS];

export const serialize = (keys) =>
  JSON.stringify({ version: 1, items: keys.map((key, order) => ({ key, order })) });

/** 저장 문자열 → 키 배열(순서대로). 형식이 다르면 null */
export const parse = (raw) => {
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !Array.isArray(data.items)) return null;
    return data.items
      .filter((i) => typeof i?.key === "string")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((i) => i.key);
  } catch {
    return null;
  }
};

/** 보여 줄 키 목록 — 비로그인은 항상 기본, 저장값의 모르는 키·중복은 버리고 8개로 자른다. 비면 기본 */
export const resolveKeys = (stored, validKeys, isAuthenticated) => {
  if (!isAuthenticated || !stored) return defaultKeys(isAuthenticated);
  const seen = new Set();
  const keys = stored.filter((k) => validKeys.includes(k) && !seen.has(k) && seen.add(k)).slice(0, MAX_SHORTCUTS);
  return keys.length > 0 ? keys : defaultKeys(true);
};

/** 선택·해제. 이미 8개면 추가하지 않는다 */
export const toggleKey = (keys, key) => {
  if (keys.includes(key)) return keys.filter((k) => k !== key);
  return keys.length >= MAX_SHORTCUTS ? keys : [...keys, key];
};

/** from 자리의 키를 to 자리로 옮긴다. 범위 밖이면 그대로 */
export const moveKey = (keys, from, to) => {
  if (from === to || from < 0 || to < 0 || from >= keys.length || to >= keys.length) return keys;
  const next = [...keys];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
};

export const loadStored = () => {
  try {
    return parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

export const saveStored = (keys) => {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(keys));
  } catch {
    /* 저장 불가(사생활 보호 모드 등) — 이번 세션은 화면 상태로만 */
  }
};

