// web/scripts/notice-source.mjs
// 공지 목록 조회 + 필터링 + slug 변환 — generate-sitemap.mjs 와 prerender.mjs 가 공유하는
// 단일 소스. "sitemap 에 실리는 공지 목록 = 프리렌더되는 공지 상세 목록"이 항상 일치하도록
// 필터 기준(내부 작성 + 공개)을 한 곳에서만 관리한다.
//
// 이 파일은 node 로 단독 실행되는 빌드 스크립트에서만 쓰인다(vite src alias 미의존).
// 원본 slugify 로직: src/domains/notices/mobile/noticeSlug.js — 바뀌면 이 쪽도 같이 맞출 것.

export const NOTICES_API = "https://api.compyafun.com/api/notices";

export const noticeTitleToSlug = (title, id) => {
  const cleaned = (title ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180)
    .replace(/-+$/g, "");

  return cleaned || `notice-${id}`;
};

// 공지 API 조회 → 내부 작성(source: "INTERNAL") + 공개(isVisible: true) 공지만 반환.
// - 외부(EXTERNAL) 공지는 목록 카드 클릭 시 외부 링크로 나가고 내부 상세 페이지가 없다.
// - 비공개(isVisible: false) 공지는 실제로 접근 불가능하다.
//
// 실패 시 에러를 던진다 — best-effort 판단은 호출자 몫이다(스크립트마다 실패 시 동작이
// 다르다: sitemap 은 base 그대로 기록하고 계속 진행, prerender 는 공지 상세만 건너뛰고
// 정적 라우트 프리렌더는 계속 진행).
export async function fetchVisibleInternalNotices(timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(NOTICES_API, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) {
    // 실패 응답 바디를 소비하지 않고 버리면 undici 커넥션이 열린 채 남아 Node 종료 시
    // libuv assertion 크래시를 낼 수 있어(generate-sitemap.mjs 관찰 사례) 던지기 전에 비운다.
    await res.text().catch(() => {});
    throw new Error(`HTTP ${res.status}`);
  }
  const json = await res.json();
  const list = Array.isArray(json?.data) ? json.data : [];
  return list.filter((n) => n.isVisible && n.source === "INTERNAL");
}
