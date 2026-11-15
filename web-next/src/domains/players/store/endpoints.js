// getStats: 리스트형 표용 — 구단 하나를 통째로 받는다(연도·포지션은 화면에서 거른다).
export const PLAYER_CARDS = {
  GET_ALL: "/player-cards",
  getStats: (teamCode) => `/player-cards/${teamCode}/stats`,
};
