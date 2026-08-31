// web/scripts/prerender.mjs
// 빌드타임 정적 스냅샷 생성 — 구글 애드센스 크롤러가 CSR 빈 페이지를 보는 문제 대응.
// `vite build` 이후 실행. dist/assets/* 는 건드리지 않고, 라우트별 index.html 만 추가한다.
//
// 방식: vite preview 로 dist 를 로컬 서빙 → puppeteer 로 각 라우트 방문 →
//       렌더 완료된 DOM(head 포함)을 그대로 파일로 저장.
// 하이드레이션 방식은 바꾸지 않는다 (createRoot 그대로, hydrateRoot 전환 X).

import { preview } from "vite";
import puppeteer from "puppeteer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const distDir = path.join(webRoot, "dist");

// 확률 공시 — 섹션 목록은 정적 데이터 파일에서 그대로 읽는다 (sitemap.xml 과 동일 소스여야 함)
const oddsDocPath = path.join(webRoot, "src/data/odds/cpb2015_1_3.json");
const oddsDoc = JSON.parse(fs.readFileSync(oddsDocPath, "utf-8"));

const STATIC_ROUTES = [
  "/",
  "/coupons",
  "/events",
  "/notices",
  "/probability",
  "/players",
  "/mode/history",
  "/privacy",
  "/terms",
  "/contact",
  "/about",
];

const DYNAMIC_ROUTES = oddsDoc.sections.map((s) => `/probability/${s.id}`);

const ROUTES = [...STATIC_ROUTES, ...DYNAMIC_ROUTES];

// 공지 상세(/notice/:id)는 DB 동적이라 빌드 시점에 목록을 알 수 없어 제외한다.

function routeToOutputFile(route) {
  if (route === "/") return path.join(distDir, "index.html");
  const segments = route.split("/").filter(Boolean);
  return path.join(distDir, ...segments, "index.html");
}

// MobileLayout.jsx 의 Suspense fallback 문구 — 이 텍스트가 사라지면 lazy 청크 렌더 완료로 간주
const LOADING_TEXT = "로딩중";

async function main() {
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    console.error("[prerender] dist/index.html 이 없다 — 먼저 vite build 를 실행해야 한다.");
    process.exit(1);
  }

  console.log(
    `[prerender] 대상 라우트 ${ROUTES.length}개 (정적 ${STATIC_ROUTES.length} + 확률공시 ${DYNAMIC_ROUTES.length})`
  );

  const server = await preview({
    root: webRoot,
    logLevel: "warn",
    preview: { host: "127.0.0.1" },
  });
  const base = server.resolvedUrls.local[0].replace(/\/$/, "");
  console.log(`[prerender] preview 서버: ${base}`);

  const browser = await puppeteer.launch({ headless: true });

  const failed = [];
  let ok = 0;

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      try {
        // 'load' 까지만 대기 — 목록 화면의 API fetch(coupons/events/notices)가
        // 응답 지연/실패해도 스냅샷 생성이 그것 때문에 막히지 않게 한다.
        await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 30000 });

        // React.lazy + Suspense 청크 렌더 대기 (로컬 자산이라 보통 수백ms 내 완료)
        await page
          .waitForFunction(
            (text) => !document.body.innerText.includes(text),
            { timeout: 8000 },
            LOADING_TEXT
          )
          .catch(() => {
            // 8초 내 못 벗어나도 있는 그대로 스냅샷 — 레이아웃 확인 목적은 달성됨
          });

        // useDocumentMeta 의 useEffect(title/description/canonical) flush 유예
        await new Promise((resolve) => setTimeout(resolve, 150));

        const html = await page.content();
        const outFile = routeToOutputFile(route);
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, html, "utf-8");
        ok++;
      } catch (err) {
        failed.push({ route, message: err.message });
        console.error(`[prerender] 실패: ${route} — ${err.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => {
      server.httpServer.close((err) => (err ? reject(err) : resolve()));
    });
  }

  console.log(`[prerender] 완료 ${ok}/${ROUTES.length}`);
  if (failed.length > 0) {
    console.error("[prerender] 실패 목록:");
    failed.forEach((f) => console.error(`  - ${f.route}: ${f.message}`));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("[prerender] 치명적 오류", err);
  process.exitCode = 1;
});
