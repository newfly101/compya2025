export const baseEventDTO = (state) => ({
  title: state.title,
  eventType: state.eventType,
  startAt: state.startAt,
  expireAt: state.expireAt,
  imageUrl: state.imageUrl,
  externalLink: state.externalLink,
  // contentHtml 은 서버 수집 전용 — 관리자 폼 저장 페이로드에는 싣지 않는다(공개 목록만 읽음).
  visible: state.visible,
});
