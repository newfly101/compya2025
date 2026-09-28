import { API } from "@/infra/http/client.js";
import { HOME } from "@/domains/home/store/public/endpoints.js";
// BE 는 모든 응답을 { success, code, data } 로 감싼다. api 함수는 내용물(data.data)만 반환한다.

export const fetchGetHome = async () => {
  const { data } = await API.get(HOME.GET_HOME);
  return data.data;
};

// 이 엔드포인트만 예외적으로 봉투가 없다 — BE 가 성공·실패 무관하게 204 No Content 를
// 고정 반환한다(StatisticsController). 그래서 반환값이 없다(authentication fetchLogout 과 동일).
export const fetchSupportClick = async (target) => {
  await API.post(HOME.SUPPORT_CLICK, { target });
};
