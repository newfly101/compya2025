import { API_INTERNAL_URL } from "@/lib/env.js";
import { HOME_FETCH_TAGS } from "@/lib/http/revalidateTags.js";

const PREVIEW_LIMIT = 3;
const byIdDesc = (a, b) => b.id - a.id;

// 원본 store/public/{api,thunks}.js 의 GET /home 을 서버 fetch 로 합침 — Redux 미사용.
// /api/home 은 쿠폰·이벤트·공지·퀴즈 4개 공개 섹션뿐이라 쿠키 없이 호출한다(ISR HTML 은 모두에게 같다).
// 요청 실패나 섹션 일부 실패(failedSections)는 예외 → 직전 정상 캐시 유지, 최초면 app/error.jsx
// (오류 상태가 ISR 캐시에 저장되지 않게 coupons·notices·events 와 같은 방식).
export const fetchHome = async () => {
  const get = async (init) => {
    const res = await fetch(`${API_INTERNAL_URL}/home`, init);
    if (!res.ok) throw new Error(`GET /home → HTTP ${res.status}`);
    return (await res.json()).data;
  };
  let data = await get({ next: { revalidate: 300, tags: HOME_FETCH_TAGS } });
  // 섹션 실패도 HTTP 200 이라 data cache 에 5분간 남는다 → 캐시를 건너뛰고 한 번 더 확인
  if (data.failedSections?.length) data = await get({ cache: "no-store" });
  if (data.failedSections?.length) throw new Error(`GET /home → 섹션 실패: ${data.failedSections.join(",")}`);

  const notices = (data.notices ?? [])
    .filter((n) => n.isVisible && n.source === "INTERNAL")
    .sort(byIdDesc);
  // 고정 공지를 미리보기 맨 앞에 둔다
  const featured = notices.find((n) => n.isPinned) ?? notices[0];
  return {
    coupons: (data.coupons ?? []).filter((c) => c.visible).sort(byIdDesc),
    events: (data.events ?? []).filter((e) => e.visible).sort(byIdDesc),
    notices: featured ? [featured, ...notices.filter((n) => n !== featured)].slice(0, PREVIEW_LIMIT) : [],
    quiz: data.quiz ?? null,
  };
};
