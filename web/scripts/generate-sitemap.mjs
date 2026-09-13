// web/scripts/generate-sitemap.mjs
// 빌드 시점에 공지 목록(BE API)을 받아 sitemap.xml 에 공지 상세(/notice/:slug) URL 을 병합한다.
// public/sitemap.xml(정적 base)은 건드리지 않고, dist/sitemap.xml 만 덮어쓴다.
// `vite build` 이후 실행 전제(dist/ 필요).
//
// ⚠️ API 실패는 빌드를 깨뜨리지 않는다 — 경고만 남기고 base sitemap 그대로 dist 에 기록,
// exit 0. (prerender.mjs 와 달리 sitemap 확장은 best-effort.)

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const distDir = path.join(webRoot, "dist");
const baseSitemapPath = path.join(webRoot, "public", "sitemap.xml");
const outSitemapPath = path.join(distDir, "sitemap.xml");

const SITE_ORIGIN = "https://compyafun.com";
const NOTICES_API = "https://api.compyafun.com/api/notices";

// src/domains/notices/mobile/noticeSlug.js 의 noticeTitleToSlug 를 그대로 복제.
// 이 스크립트가 vite 빌드 산출물(src alias)에 의존하지 않고 node 로 단독 실행돼야 하므로
// import 대신 로직을 그대로 옮겨온다 — 원본이 바뀌면 이 쪽도 같이 맞춰야 한다.
const noticeTitleToSlug = (title, id) => {
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

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// 공지 목록(공개 API 응답) → sitemap <url> 블록 문자열 배열.
// - 내부 작성 공지(source: "INTERNAL")만 대상. 외부(EXTERNAL) 공지는 목록 카드 클릭 시
//   외부 링크로 나가고 내부 상세 페이지가 없어 sitemap 대상이 아니다.
// - 비공개(isVisible: false) 공지는 실제로 접근 불가능하므로 제외.
function buildNoticeUrlEntries(notices) {
  return notices.map((notice) => {
    const slug = noticeTitleToSlug(notice.title, notice.id);
    // slug 는 [0-9a-z가-힣-] 만 남지만, 한글은 퍼센트 인코딩이 필요해 encodeURIComponent 를 쓴다
    // (하이픈/영숫자는 그대로 유지된다).
    const loc = `${SITE_ORIGIN}/notice/${encodeURIComponent(slug)}`;
    const dateRaw = notice.publishedAt || notice.createdAt || null;
    const lastmod = dateRaw ? String(dateRaw).slice(0, 10) : null;

    return [
      "    <url>",
      `        <loc>${escapeXml(loc)}</loc>`,
      lastmod ? `        <lastmod>${lastmod}</lastmod>` : null,
      "        <changefreq>monthly</changefreq>",
      "        <priority>0.5</priority>",
      "    </url>",
    ]
      .filter(Boolean)
      .join("\n");
  });
}

function writeBaseAsIs(baseXml, reason) {
  fs.mkdirSync(path.dirname(outSitemapPath), { recursive: true });
  fs.writeFileSync(outSitemapPath, baseXml, "utf-8");
  console.log(`[generate-sitemap] base sitemap 그대로 기록 (${reason})`);
}

async function main() {
  // ⚠️ 이 아래로는 fetch() 를 거친다 — Node 24 + Windows 조합에서 fetch 이후
  // process.exit() 를 명시 호출하면 undici 커넥션 정리 타이밍과 겹쳐 libuv assertion
  // 크래시가 나는 게 관찰됨(관측: "Assertion failed ... UV_HANDLE_CLOSING"). 그래서
  // 이 파일 전체에서 명시적 process.exit() 호출을 쓰지 않고, process.exitCode 지정 +
  // return 으로 자연 종료시킨다.
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    console.error("[generate-sitemap] dist/index.html 이 없다 — 먼저 vite build 를 실행해야 한다.");
    process.exitCode = 1;
    return;
  }
  if (!fs.existsSync(baseSitemapPath)) {
    console.error("[generate-sitemap] public/sitemap.xml 이 없다.");
    process.exitCode = 1;
    return;
  }

  const baseXml = fs.readFileSync(baseSitemapPath, "utf-8");

  let visibleInternalNotices;
  try {
    // AbortSignal.timeout() 은 Node 24 + Windows 조합에서 process.exit 직후 타이머 핸들이
    // 남아 있으면 libuv assertion 크래시를 낼 수 있어(관찰됨) 쓰지 않는다 — 직접 만든
    // AbortController + clearTimeout 으로 타이머를 확실히 정리한다.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    let res;
    try {
      res = await fetch(NOTICES_API, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!res.ok) {
      // 실패 응답 바디를 소비하지 않고 버리면 undici 커넥션이 열린 채 남아 Node 종료 시
      // libuv assertion 크래시를 낸 사례가 관찰됨 — 던지기 전에 반드시 비운다.
      await res.text().catch(() => {});
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : [];
    visibleInternalNotices = list.filter((n) => n.isVisible && n.source === "INTERNAL");
  } catch (err) {
    console.warn(`[generate-sitemap] 경고 — 공지 API 조회 실패: ${err.message}`);
    writeBaseAsIs(baseXml, "API 실패");
    return; // exit code 0 그대로 — 빌드는 계속 성공 처리
  }

  if (visibleInternalNotices.length === 0) {
    writeBaseAsIs(baseXml, "병합할 공지 없음");
    return;
  }

  const noticeEntries = buildNoticeUrlEntries(visibleInternalNotices);

  if (!baseXml.includes("</urlset>")) {
    console.warn("[generate-sitemap] 경고 — base sitemap 에 </urlset> 마커가 없어 병합을 건너뛴다.");
    writeBaseAsIs(baseXml, "</urlset> 마커 없음");
    return;
  }

  const insertion = `${noticeEntries.join("\n")}\n`;
  const merged = baseXml.replace("</urlset>", `${insertion}</urlset>`);

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(outSitemapPath, merged, "utf-8");
  console.log(`[generate-sitemap] 완료 — dist/sitemap.xml 에 공지 상세 URL ${noticeEntries.length}건 병합`);
}

main().catch((err) => {
  // sitemap 확장은 best-effort — 예상치 못한 오류도 빌드를 깨뜨리지 않는다.
  // (명시적 process.exit() 은 fetch 이후 호출 시 크래시 위험이 있어 쓰지 않는다 — 위 주석 참고)
  console.error("[generate-sitemap] 치명적 오류(무시하고 계속 진행)", err);
});
