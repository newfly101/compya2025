export const baseEventDTO = (state) => ({
  title: state.title,
  eventType: state.eventType,
  startAt: state.startAt,
  expireAt: state.expireAt,
  imageUrl: state.imageUrl,
  externalLink: state.externalLink,
  visible: state.visible,
});
