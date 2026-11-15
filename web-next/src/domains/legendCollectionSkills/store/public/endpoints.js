export const LEGEND_COLLECTION_SKILLS = {
  GET_ALL: "/legend-collection-skills",
  putSlots: (legendId) => `/legend-collection-skills/${legendId}`,
  postEvent: (legendId) => `/legend-collection-skills/${legendId}/events`,
  postBatch: (legendId) => `/legend-collection-skills/${legendId}/events/batch`,
};

