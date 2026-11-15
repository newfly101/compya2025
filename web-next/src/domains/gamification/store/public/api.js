import { API } from "@/infra/http/client.js";
import { GAMIFICATION } from "@/domains/gamification/store/public/endpoints.js";
// BE 는 { success, code, data } 로 감싼다. 내용물(data.data)만 반환한다.

export const fetchCheckIn = async () => {
  const { data } = await API.post(GAMIFICATION.CHECK_IN);
  return data.data;
};

export const fetchGetMyGamification = async () => {
  const { data } = await API.get(GAMIFICATION.ME);
  return data.data;
};

export const fetchEquipTitle = async (code) => {
  const { data } = await API.put(GAMIFICATION.ME_TITLE, { code });
  return data.data;
};

export const fetchGetLevels = async () => {
  const { data } = await API.get(GAMIFICATION.LEVELS);
  return data.data;
};

export const fetchGetTitles = async () => {
  const { data } = await API.get(GAMIFICATION.TITLES);
  return data.data;
};

// type: "XP" | "POINT", page 는 0부터. 응답 { type, page, size, hasNext, items[] }
export const fetchGetHistory = async ({ type, page }) => {
  const { data } = await API.get(GAMIFICATION.ME_HISTORY, { params: { type, page } });
  return data.data;
};
