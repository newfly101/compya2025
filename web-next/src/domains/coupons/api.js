import { API_INTERNAL_URL } from "@/config/env.js";

// 원본 store/public/{endpoints,api,thunks}.js 를 서버 fetch 한 함수로 합침 — Redux 미사용.
// BE 응답은 { success, code, data }. 실패 시 null (빈 목록 + 안내 문구로 처리).
export const fetchCoupons = async () => {
  try {
    const res = await fetch(`${API_INTERNAL_URL}/coupons`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return [...json.data].filter((c) => c.visible).sort((a, b) => b.id - a.id);
  } catch {
    return null;
  }
};
