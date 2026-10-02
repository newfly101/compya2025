export const LEGEND_COLLECTION_SKILLS = {
  GET_ALL: "/legend-collection-skills",
  putSlots: (legendId) => `/legend-collection-skills/${legendId}`,
  postEvent: (legendId) => `/legend-collection-skills/${legendId}/events`,
  postBatch: (legendId) => `/legend-collection-skills/${legendId}/events/batch`,
};

export const LEGEND_COLLECTION_SKILL_ACTIONS = {
  GET_ALL: "GET/legend-collection-skills",
  PUT_SLOTS: "PUT/legend-collection-skills/slots",
  POST_EVENT: "POST/legend-collection-skills/events",
  POST_BATCH: "POST/legend-collection-skills/events/batch",
};
