import { REVALIDATE_TAGS } from "@/infra/http/revalidateTags.js";

// 관리자 변경 뒤 공개 ISR 페이지를 즉시 갱신. 같은 출처 POST /api/revalidate (서버가 ADMIN 쿠키 확인).
// 실패해도 관리자 작업은 성공 — 300초 ISR 이 안전망이다.
export const revalidatePublic = (tags) => {
  const list = tags.filter((t) => REVALIDATE_TAGS.includes(t));
  if (!list.length) return;
  fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ tags: list }),
  })
    .then((r) => { if (!r.ok) console.warn("[revalidate] 공개 페이지 즉시 갱신 실패", r.status); })
    .catch((e) => console.warn("[revalidate] 공개 페이지 즉시 갱신 실패", e));
};
