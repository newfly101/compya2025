export const LEGEND_COLLECTIONS = {
  GET_ME: "/legend-collections",
  PUT_CHANGES: "/legend-collections/changes",
  PUT_PREFERENCES: "/legend-collections/preferences",
  GET_SCHEDULE: "/legend-collections/schedule",
  // 재료 id·슬롯은 기존 레전드 단건 조회에서 온다 (재료 마스터는 읽기만)
  getLegendDetail: (id) => `/legends/${id}`,
};

export const LEGEND_COLLECTION_ACTIONS = {
  GET_ME: "GET/legend-collections/me",
  PUT_CHANGES: "PUT/legend-collections/changes",
  PUT_PREFERENCES: "PUT/legend-collections/preferences",
  GET_SCHEDULE: "GET/legend-collections/schedule",
  GET_MATERIALS: "GET/legend-collections/materials",
};
