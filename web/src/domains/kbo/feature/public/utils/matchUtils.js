import { KBO_TEAMS, MATCH_STATUS, RECENT_RESULT } from "@/domains/kbo/config/kboMatch.config.js";

/**
 * 팀 코드로 팀 메타 반환. 미등록 팀은 기본값 반환.
 */
export const getTeamMeta = (code) =>
  KBO_TEAMS[code] ?? { code, name: code, color: "#7c6f8f", abbr: code };

/**
 * 경기 상태 UI 설정 반환
 */
export const getMatchStatusConfig = (status) =>
  MATCH_STATUS[status] ?? MATCH_STATUS.BEFORE;

/**
 * 최근 결과 배열 → UI 설정 배열 반환
 */
export const parseRecentResults = (results = []) =>
  results.map((r) => RECENT_RESULT[r] ?? { label: r, resultClass: "draw" });

/**
 * 두 승률 합이 100이 되도록 정규화 (소수점 1자리)
 * home + away가 100이 아닌 경우 보정
 */
export const normalizeWinRates = (homeRate, awayRate) => {
  const total = homeRate + awayRate;
  if (total === 0) return { home: 50, away: 50 };
  const home = Math.round((homeRate / total) * 1000) / 10;
  return { home, away: Math.round((100 - home) * 10) / 10 };
};

/**
 * 게임 날짜 문자열 (YYYY-MM-DD) → 한국어 표기
 */
export const formatGameDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};
