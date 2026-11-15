export const LEGEND_STATS = {
  GET_STATS: "/legend-stats",
  GET_PITCH_TYPES: "/legend-stats/pitch-types",
  GET_TEAMS: "/teams",
  // 재료는 전용 API 를 새로 두지 않고 기존 레전드 단건 조회를 쓴다
  getLegendDetail: (id) => `/legends/${id}`,
};

