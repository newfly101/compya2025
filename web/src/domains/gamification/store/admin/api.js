import { API } from "@/infra/http/client.js";
import { ADMIN_GAMIFICATION } from "@/domains/gamification/store/admin/endpoints.js";
// BE 는 { success, code, data } 로 감싼다. 내용물(data.data)만 반환한다.

// client.js 는 400/403 을 뭉뚱그린 문구로 바꾼다. 이 화면 오류 코드 5종만 사람이 읽는 문구로 덮는다.
const CODE_MESSAGES = {
  GAMIFICATION_TITLE_NOT_MANUAL: "운영자가 지급하는 칭호가 아닙니다.",
  GAMIFICATION_GM_ADMIN_ONLY: "GM 칭호는 관리자 계정에만 지급할 수 있습니다.",
  GAMIFICATION_PILOT_ONLY: "시범 운영 중 — 관리자 계정만 반영됩니다.",
  GAMIFICATION_USER_NOT_FOUND: "유저를 찾을 수 없어요.",
  GAMIFICATION_TITLE_NOT_FOUND: "칭호 정의가 없어요.",
};

const call = async (request) => {
  try {
    const { data } = await request();
    return data.data;
  } catch (error) {
    const message = CODE_MESSAGES[error.response?.data?.code];
    if (message) error.message = message;
    throw error;
  }
};

export const fetchAdminGetUserTitles = (publicId) =>
  call(() => API.get(ADMIN_GAMIFICATION.USER_TITLES(publicId)));

export const fetchAdminGrantTitle = ({ publicId, code }) =>
  call(() => API.post(ADMIN_GAMIFICATION.GRANT_TITLE, { publicId, code }));

export const fetchAdminRevokeTitle = ({ publicId, code }) =>
  call(() => API.post(ADMIN_GAMIFICATION.REVOKE_TITLE, { publicId, code }));

export const fetchAdminGrantEarlyAdopters = ({ dryRun }) =>
  call(() => API.post(ADMIN_GAMIFICATION.GRANT_EARLY_ADOPTERS, null, { params: { dryRun } }));
