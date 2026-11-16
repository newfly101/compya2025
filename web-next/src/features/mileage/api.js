import { API_INTERNAL_URL } from "@/lib/env.js";

// 서버 컴포넌트용 fetch — 저격 리스트 탭 개수·표를 첫 HTML 에 넣는다. 실패는 throw. 브라우저용은 store/public/api.js.
export const fetchSniperTargets = async () => {
  const res = await fetch(`${API_INTERNAL_URL}/mileage/sniper-targets`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`GET /mileage/sniper-targets → HTTP ${res.status}`);
  return (await res.json()).data ?? [];
};
