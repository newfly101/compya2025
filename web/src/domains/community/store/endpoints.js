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

export const USER_COMMUNITY = {
  // boards
  BOARD_LIST: "/community/boards",
  CREATE_BOARD: "/community/boards",
  UPDATE_BOARD: (id) => `/community/boards/${id}`,
  // posts
  POST_LIST: "/community/posts",
  CREATE_POST: "/community/posts",
  UPDATE_POST: (id) => `/community/posts/${id}`,
  // tags
  TAG_LIST: "/community/tags",
  CREATE_TAG: "/community/tags",
  UPDATE_TAG: (id) => `/community/tags/${id}`,
}

export const USER_COMMUNITY_ACTIONS = {
  // boards
  BOARD_LIST: "/community/boards",
  CREATE_BOARD: "/community/boards/create",
  UPDATE_BOARD: "/community/boards/${id}",
  // posts
  POST_LIST: "/community/posts",
  CREATE_POST: "/community/posts/create",
  UPDATE_POST: "/community/posts/${id}",
  // tags
  TAG_LIST: "/community/tags",
  CREATE_TAG: "/community/tags/create",
  UPDATE_TAG: "/community/tags/${id}",
}
