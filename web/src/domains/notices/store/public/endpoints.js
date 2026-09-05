export const NOTICE_ACTIONS = {
  GET_NOTICES: "GET/notices/list",
  GET_NOTICE_BY_SLUG: "GET/notices/bySlug",
};

export const NOTICES = {
  GET_NOTICES: "/notices",
  // slug 주소로 직접 진입(북마크 등) 했는데 목록에 없을 때 단건 조회용
  GET_NOTICE_BY_SLUG: (slug) => `/notices/slug/${slug}`,
};
