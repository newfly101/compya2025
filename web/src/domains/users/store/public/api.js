import { API } from "@/infra/http/client.js";
import { USERS_ME } from "@/domains/users/store/public/endpoints.js";

// BE 는 모든 응답을 { success, code, data } 로 감싼다. 실제 payload 는 data.data.
export const fetchMyInfo = async () => {
  const { data } = await API.get(USERS_ME.GET);
  return data.data;
};

// 성공 시 UserMeResponse 전체(변경된 프로필)를 반환한다.
export const patchMyNickname = async (nickname) => {
  const { data } = await API.patch(USERS_ME.PATCH, { nickname });
  return data.data;
};

// 성공 시 data 는 null. BE 가 refresh token 삭제 + 쿠키 만료까지 처리하므로
// FE 는 별도 로그아웃 API 를 호출할 필요가 없다.
export const deleteMyAccount = async () => {
  await API.delete(USERS_ME.DELETE);
};
