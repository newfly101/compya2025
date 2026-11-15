import { API } from "@/infra/http/client.js";
import { USERS_ME, USERS_NICKNAME } from "@/domains/users/store/public/endpoints.js";

// BE 는 모든 응답을 { success, code, data } 로 감싼다. 실제 payload 는 data.data.
export const fetchMyInfo = async () => {
  const { data } = await API.get(USERS_ME.GET);
  return data.data;
};

// 성공 시 UserMeResponse 전체(변경된 프로필)를 반환한다.
export const patchMyNickname = async (nickname) => {
  try {
    const { data } = await API.patch(USERS_ME.PATCH, { nickname });
    return data.data;
  } catch (error) {
    // 중복은 409 AUTH_NICKNAME_DUPLICATED — 공통 문구 대신 안내 문구로 바꾼다.
    if (error.response?.data?.code === "AUTH_NICKNAME_DUPLICATED") error.message = "이미 사용 중인 닉네임입니다.";
    throw error;
  }
};

// 사용 가능하면 true. 형식 오류는 400 으로 reject — 호출부가 구분한다.
export const fetchNicknameAvailable = async (nickname) => {
  const { data } = await API.get(USERS_NICKNAME.CHECK, { params: { nickname } });
  return data.data.available;
};

// profileImage: 업로드된 이미지 주소. 빈 문자열을 보내면 서버가 기본 이미지로 되돌린다.
export const patchMyProfileImage = async (profileImage) => {
  const { data } = await API.patch(USERS_ME.PATCH, { profileImage });
  return data.data;
};

// 성공 시 data 는 null. BE 가 refresh token 삭제 + 쿠키 만료까지 처리하므로
// FE 는 별도 로그아웃 API 를 호출할 필요가 없다.
export const deleteMyAccount = async () => {
  await API.delete(USERS_ME.DELETE);
};
