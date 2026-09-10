// domains/players/config/playersLoader.js
// 임시 — 4단계에서 API 로 교체하고 이 파일(과 players.temp.json)은 삭제한다.
//
// players.temp.json (컴프야펀 노말카드 포지션 조사 원본, 13,954행) 을 모듈 로드 시 1회 가공한다.
// role === "coach" 는 코치 테이블이 아직 없어 이번 범위에서 걸러낸다 → 11,672행 남음.
// (부수효과: 코치 전용 구단인 "국가대표" 도 자연히 제외되어 20개 구단만 남는다)

import raw from "./players.temp.json";

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
  ["B", "타자"],
  ["P", "투수"],
  ["C", "코치"],
];

export const getPosOrder = (pos) => POS_ORDER[pos] ?? 9;

// 코치 제외 + kinds 배열 파생(", " 구분 문자열 → 배열)
export const PLAYERS = raw
  .filter((r) => r.role !== "coach")
  .map((r) => ({ ...r, kinds: (r.k || "").split(",").map((s) => s.trim()) }));

// 실제 데이터에 존재하는 구단만, 고정 순서로
export const TEAMS = TEAM_ORDER.filter((t) => PLAYERS.some((r) => r.tm === t));

/**
 * 구단의 연도 목록 — 내림차순. "레전드" 그룹은 맨 앞(연도 아님, 문자 그대로 유지).
 * @param {string} team
 * @returns {string[]}
 */
export function getYearsForTeam(team) {
  const years = [...new Set(PLAYERS.filter((r) => r.tm === team).map((r) => r.y))];
  const legend = years.filter((y) => !/^\d{4}$/.test(y));
  const normal = years.filter((y) => /^\d{4}$/.test(y)).sort((a, b) => Number(b) - Number(a));
  return [...legend, ...normal];
}
