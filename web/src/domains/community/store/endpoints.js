export const ADMIN_COMMUNITY = {
  // boards
  BOARD_LIST: "/community/admin/boards",
  CREATE_BOARD: "/community/admin/boards",
  UPDATE_BOARD: (id) => `/community/admin/boards/${id}`,
  // posts
  POST_LIST: "/community/admin/posts",
  CREATE_POST: "/community/admin/posts",
  UPDATE_POST: (id) => `/community/admin/posts/${id}`,
  // tags
  TAG_LIST: "/community/admin/tags",
  CREATE_TAG: "/community/admin/tags",
  UPDATE_TAG: (id) => `/community/admin/tags/${id}`,
}
export const ADMIN_COMMUNITY_ACTIONS = {
  // boards
  BOARD_LIST: "/community/admin/boards",
  CREATE_BOARD: "/community/admin/boards/create",
  UPDATE_BOARD: "/community/admin/boards/${id}",
  // posts
  POST_LIST: "/community/admin/posts",
  CREATE_POST: "/community/admin/posts/create",
  UPDATE_POST: "/community/admin/posts/${id}",
  // tags
  TAG_LIST: "/community/admin/tags",
  CREATE_TAG: "/community/admin/tags/create",
  UPDATE_TAG: "/community/admin/tags/${id}",
}

// 읽기 전용 재오픈 (2026-08-31) — 실제 BE 컨트롤러 경로(BoardController/PostController)에 맞춤.
// 기존 /community/* 경로는 실존 컨트롤러와 불일치해 404 원인이었음. 글쓰기/댓글/좋아요 경로는
// 서버 인증 정비 전이라 여기 추가하지 않는다.
export const USER_COMMUNITY = {
  // boards
  BOARD_LIST: "/boards",
  BOARD_DETAIL: (id) => `/boards/${id}`,
  BOARD_DETAIL_BY_CODE: (code) => `/boards/code/${code}`,
  // posts
  POST_LIST: (boardId) => `/posts/boards/${boardId}`,
  POST_PINNED: (boardId) => `/posts/boards/${boardId}/pinned`,
  POST_POPULAR: (boardId) => `/posts/boards/${boardId}/popular`,
  POST_DETAIL: (id) => `/posts/${id}`,
}

export const USER_COMMUNITY_ACTIONS = {
  BOARD_LIST: "GET/community/boards",
  POST_LIST: "GET/community/posts/list",
}
