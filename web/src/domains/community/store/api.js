import { API } from "@/app/store/APIConfig.js";
import { ADMIN_COMMUNITY } from "@/domains/community/store/endpoints.js";
import { requestUpdateNewBoard } from "@/domains/community/store/thunks.js";

/**
 * COMMUNITY API
 */

export const fetchGetAllBoardLists = async () => {
  const { data } = await API.get(`${ADMIN_COMMUNITY.BOARD_LIST}`);
  return data;
}

export const fetchInsertNewBoard = async (newBoard) => {
  const { data } = await API.post(`${ADMIN_COMMUNITY.CREATE_BOARD}`, newBoard);
  return data;
}

export const fetchUpdateBoard = async ({ id, board }) => {
  const { data } = await API.patch(`${ADMIN_COMMUNITY.UPDATE_BOARD(id)}`, board);
  return data;
}


export const fetchGetAllPostLists = async () => {
  const { data } = await API.get(`${ADMIN_COMMUNITY.POST_LIST}`);
  return data;
}

export const fetchInsertNewPost = async (newPost) => {
  const { data } = await API.post(`${ADMIN_COMMUNITY.CREATE_POST}`, newPost);
  return data;
}

export const fetchUpdatePost = async ({ id, posts }) => {
  const { data } = await API.patch(`${ADMIN_COMMUNITY.UPDATE_POST(id)}`, posts);
  return data;
}

export const fetchGetAllTags = async () => {
  const { data } = await API.get(`${ADMIN_COMMUNITY.TAG_LIST}`);
  return data;
}

export const fetchInsertNewTag = async (newTag) => {
  const { data } = await API.post(`${ADMIN_COMMUNITY.CREATE_TAG}`, newTag);
  return data;
}

export const fetchUpdateTag = async ({ id, tags }) => {
  const { data } = await API.patch(`${ADMIN_COMMUNITY.UPDATE_TAG(id)}`, tags);
  return data;
}
