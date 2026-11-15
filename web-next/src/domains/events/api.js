import { API_INTERNAL_URL } from "@/config/env.js";

// 원본 store/public/{endpoints,api,thunks}.js 를 서버 fetch 로 합침 — Redux 미사용.
// 실패는 예외 throw(직전 정상 캐시 유지 / 최초면 app/error.jsx). 상세 404 만 null → notFound().
export const fetchEvents = async () => {
  const res = await fetch(`${API_INTERNAL_URL}/events/external`, { next: { revalidate: 300, tags: ["events"] } });
  if (!res.ok) throw new Error(`GET /events/external → HTTP ${res.status}`);
  return [...(await res.json()).data].filter((e) => e.visible).sort((a, b) => b.id - a.id);
};

export const fetchEventDetail = async (id) => {
  const res = await fetch(`${API_INTERNAL_URL}/events/${encodeURIComponent(id)}`, { next: { revalidate: 300, tags: ["events"] } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /events/${id} → HTTP ${res.status}`);
  return (await res.json()).data;
};
