import { API_INTERNAL_URL } from "@/lib/env.js";

// 원본 store/public/{endpoints,api,thunks}.js 를 서버 fetch 한 함수로 합침 — Redux 미사용.
// BE 응답은 { success, code, data }. 실패는 예외를 던진다 → 직전 정상 캐시 유지, 최초면 app/error.jsx
// (오류 화면이 ISR 캐시에 저장되지 않게 notices·events 와 같은 방식).
export const fetchCoupons = async () => {
  const res = await fetch(`${API_INTERNAL_URL}/coupons`, { next: { revalidate: 300, tags: ["coupons"] } });
  if (!res.ok) throw new Error(`GET /coupons → HTTP ${res.status}`);
  const json = await res.json();
  return [...json.data].filter((c) => c.visible).sort((a, b) => b.id - a.id);
};
