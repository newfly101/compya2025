export const LEGEND_STATS = {
  GET_STATS: "/legend-stats",
  GET_PITCH_TYPES: "/legend-stats/pitch-types",
  GET_TEAMS: "/teams",
  // 재료는 전용 API 를 새로 두지 않고 기존 레전드 단건 조회를 쓴다
  getLegendDetail: (id) => `/legends/${id}`,
};

export const LEGEND_STAT_ACTIONS = {
  GET_STAT_LIST: "GET/legend-stats/list",
  GET_PITCH_TYPE_LIST: "GET/legend-stats/pitchTypes",
  GET_TEAM_LIST: "GET/legend-stats/teams",
  GET_LEGEND_MATERIALS: "GET/legend-stats/materials",
};
