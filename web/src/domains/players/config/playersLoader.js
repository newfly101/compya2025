// domains/players/config/playersLoader.js
// 4단계 — JSON 로딩은 걷어내고 순수 상수 + store 데이터를 받아 파생시키는 함수만 남긴다.
// 화면은 store.players.items 를 이 함수들에 넘겨 구단/연도 목록을 계산한다.

// 구단 표시 순서 고정 (design_handoff README 표기 순서)
export const TEAM_ORDER = [
  "KIA", "삼성", "LG", "두산", "kt", "SSG", "롯데", "한화", "NC", "키움",
  "해태", "OB", "MBC", "현대", "SK", "빙그레", "태평양", "쌍방울", "청보", "삼미",
];

// 타자/투수 포지션 — 필터 모달 + 정렬 순서용
export const POS_B = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];
export const POS_P = ["SP", "RP", "CP"];
const POS_ORDER = { SP: 0, CP: 1, RP: 2, C: 0, "1B": 1, "2B": 2, "3B": 3, SS: 4, LF: 5, CF: 6, RF: 7, DH: 8 };

// 카드 종류 8종 — DB엔 "일반"·"시그니처" 2종만 실존, 나머지는 필터 목록에 두되 disabled 처리
export const KINDS = ["일반", "국가대표", "골든글러브", "MVP", "올스타", "시그니처", "연대 시그니처", "에픽"];
export const ACTIVE_KINDS = new Set(["일반", "시그니처"]);

// 상단 탭 4종 (전체/타자/투수/코치) — 코치는 데이터가 없어 항상 0장으로 disabled 된다
export const TABS = [
  ["all", "전체"],
  ["H", "타자"],
  ["P", "투수"],
  ["C", "코치"],
];

export const getPosOrder = (pos) => POS_ORDER[pos] ?? 9;

/**
 * store 데이터에 실제 존재하는 구단만, 고정 순서로.
 * @param {Array} items - store.players.items
 * @returns {string[]}
 */
export function getTeams(items) {
  return TEAM_ORDER.filter((t) => items.some((r) => r.tm === t));
}

/**
 * 구단의 연도 목록 — 내림차순. "레전드" 그룹은 맨 앞(연도 아님, 문자 그대로 유지).
 * @param {Array} items - store.players.items
 * @param {string} team
 * @returns {string[]}
 */
export function getYearsForTeam(items, team) {
  const years = [...new Set(items.filter((r) => r.tm === team).map((r) => r.y))];
  const legend = years.filter((y) => !/^\d{4}$/.test(y));
  const normal = years.filter((y) => /^\d{4}$/.test(y)).sort((a, b) => Number(b) - Number(a));
  return [...legend, ...normal];
}
