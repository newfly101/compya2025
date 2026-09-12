// 선수 카드 전량 조회 API — 조건 파라미터 없음(11,668건을 한 번에 받아 화면이 필터링한다).
// getStats: 리스트형 표용 — 구단 하나를 통째로 받는다(연도·포지션은 화면에서 거른다).
export const PLAYER_CARDS = {
  GET_ALL: "/player-cards",
  getStats: (teamCode) => `/player-cards/${teamCode}/stats`,
};

export const PLAYER_CARD_ACTIONS = {
  GET_ALL: "GET/player-cards",
  GET_STATS: "GET/player-cards/stats",
};
