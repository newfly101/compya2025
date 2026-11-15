import { API_INTERNAL_URL } from "@/config/env.js";

// 원본 store/public/{endpoints,api,thunks}.js 를 서버 fetch 로 합침 — Redux 미사용.
// 실패(HTTP 오류·네트워크)는 null 이 아니라 예외를 던진다 → Next 가 직전 정상 캐시를 유지하고,
// 최초라면 app/error.jsx 로 간다(안내 문구를 캐시하지 않기 위함).
const getData = async (path) => {
  const res = await fetch(`${API_INTERNAL_URL}${path}`, { next: { revalidate: 300, tags: ["notices"] } });
  if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
  return (await res.json()).data;
};

// 공개 공지만. 내부 작성(INTERNAL)=사이트 공지, 외부(EXTERNAL)=공식 공지. 최신(id 큰) 순.
export const fetchNotices = async () => {
  const visible = [...(await getData("/notices"))].filter((n) => n.isVisible).sort((a, b) => b.id - a.id);
  return {
    siteNotices: visible.filter((n) => n.source === "INTERNAL"),
    officialNotices: visible.filter((n) => n.source === "EXTERNAL"),
  };
};

// 목록 응답에는 본문(content)이 없다.
export const fetchNoticeDetail = (id) => getData(`/notices/${id}`);
