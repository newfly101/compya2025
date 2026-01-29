/**
 * POST /events
 * @param {Object} state
 * @param {string} state.title
 * @param {string} state.eventSource
 * @param {string|Date} state.startAt
 * @param {string|Date} state.expireAt
 * @param {string} state.imageUrl
 * @param {string} state.externalLink
 * @param {boolean} state.visible
 *
 * @returns {{
 *   title: string,
 *   eventSource: string,
 *   startAt: string|Date,
 *   expireAt: string|Date,
 *   imageUrl: string,
 *   externalLink: string,
 *   visible: boolean
 * }}
 */
export const createEventDTO = (state) => ({
  title: state.title,
  eventSource: state.eventSource,
  startAt: state.startAt,
  expireAt: state.expireAt,
  imageUrl: state.imageUrl,
  externalLink: state.externalLink,
  visible: state.visible,
});

/**
 * PATCH /events/{id}
 *
 * @param {Object} state
 * @param {string} state.title
 * @param {string} state.eventSource
 * @param {string|Date} state.startAt
 * @param {string|Date} state.expireAt
 * @param {string} state.imageUrl
 * @param {string} state.externalLink
 *
 * @returns {{
 *   title: string,
 *   eventSource: string,
 *   startAt: string|Date,
 *   expireAt: string|Date,
 *   imageUrl: string,
 *   externalLink: string
 * }}
 */
export const updateEventDTO = (state) => ({
  title: state.title,
  eventSource: state.eventSource,
  startAt: state.startAt,
  expireAt: state.expireAt,
  imageUrl: state.imageUrl,
  externalLink: state.externalLink,
});
