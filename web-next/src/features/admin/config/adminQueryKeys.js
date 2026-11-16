import { revalidatePublic } from "@/lib/http/revalidate.js";

// 관리자 변경 뒤 같이 무효화할 공개 쪽 queryKey 묶음.
// 공개 coupons/events/notices/home 은 서버 렌더(ISR 300초)라 지금은 구독하는 클라이언트 query 가 없다 — 이 키들은 no-op 이지만,
// 공개 쪽이 query 로 바뀌면 바로 반영되도록 키 이름을 도메인 폴더명으로 고정한다. ISR 은 아래 invalidatePublic 이 POST /api/revalidate 로 태그 갱신.
export const PUBLIC_KEYS = {
  coupons: [["coupons"], ["home"]],
  events: [["events"], ["home"]],
  notices: [["notices"], ["home"]],
  quiz: [["quiz"], ["home"]],
  users: [["users"]],
};

export const invalidatePublic = (qc, name) => {
  PUBLIC_KEYS[name].forEach((queryKey) => qc.invalidateQueries({ queryKey }));
  // 서버 렌더(ISR) 쪽은 태그로 즉시 갱신 — 홈은 하위 도메인 태그를 같이 달고 있어 도메인 태그 하나면 된다.
  if (name !== "users") revalidatePublic([name]);
};
