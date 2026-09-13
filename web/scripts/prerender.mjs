// web/scripts/prerender.mjs
// 빌드타임 정적 스냅샷 생성 — 구글 애드센스 크롤러가 CSR 빈 페이지를 보는 문제 대응.
// `vite build` 이후 실행. dist/assets/* 는 건드리지 않고, 라우트별 index.html 만 추가한다.
//
// 방식: vite preview 로 dist 를 로컬 서빙 → puppeteer 로 각 라우트 방문 →
//       렌더 완료된 DOM(head 포함)을 그대로 파일로 저장.
// 하이드레이션 방식은 바꾸지 않는다 (createRoot 그대로, hydrateRoot 전환 X).
//
// ⚠️ /notices, /coupons, /events, /players, /legend-stats, /history-mode/legend 는 BE API 로 본문을 채운다.
// (/players 는 2026-09-13 게이트 제거 이후 진입 즉시 선수 리스트를 부른다 — 데이터 확인 대상에 포함)
// ⚠️ /notice/:slug (공지 상세) 는 빌드 시점에 공지 목록 API 를 별도로 받아 동적으로 라우트를
// 늘려서 프리렌더한다 — STATIC_ROUTES 에는 안 넣는다(§ main() 하단, notice-source.mjs 공유).
// API_BASE_URL(src/config/env.js) 이
// 운영 빌드에서 절대경로 https://api.compyafun.com/api 라서 vite.config.js 의 프록시는
// 관여하지 않는다 — 실제 관문은 BE CorsConfig.java 의
// allowedOrigins("http://localhost:3000", "https://compyafun.com") 다. 그래서 아래 preview
// 서버를 반드시 host=localhost, port=3000 으로 고정한다. 이 값이 어긋나면 브라우저가 CORS 로
// fetch 를 막아 목록이 빈 채로 스냅샷된다(콘솔 에러는 나지만 page load 자체는 성공하므로
// 별도 데이터 도착 확인 없이는 실패를 못 알아챈다 — DATA_ROUTES 체크가 그 역할).

import { preview } from "vite";
import puppeteer from "puppeteer";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { fetchVisibleInternalNotices, noticeTitleToSlug } from "./notice-source.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const distDir = path.join(webRoot, "dist");

// verify-prerender.mjs 가 이 목록을 그대로 import 해서 쓴다 — 라우트 목록을 다른 곳에
// 또 하드코딩하지 않기 위함(export 추가 외 로직 변경 없음).
export const STATIC_ROUTES = [
  "/",
  "/coupons",
  "/events",
  "/notices",
  "/probability",
  "/players",
  // 레전드 재료 평점표 · 히스토리 재료 탐색기 — API(BE) 데이터로 렌더되는 페이지.
  "/legend-stats",
  "/history-mode/legend",
  // 마일리지 저격 경로 — config/mileage.js 정적 계산 데이터로 렌더된다(BE API 미의존).
  // 기본 진입 화면(쿼리 없음)은 목표 선택 hero 화면이라 DATA_ROUTES 셀렉터 대상은 아니다.
  "/mileage",
  // 스킬 백과사전 — 스킬명 92개와 설명문이 실려 색인 가치가 있다.
  "/skills",
  // 가이드 — 자체 작성 공략/활용 글(AdSense 심사 대응, 2026-09-13). 콘텐츠가 로컬 JS 데이터라
  // API 왕복 없이 즉시 렌더되므로 DATA_ROUTES 셀렉터 없이 STATIC_ROUTES 취급으로 충분하다.
  "/guides",
  "/guides/legend-material-priority",
  "/guides/legend-stats-guide",
  "/guides/mileage-sniping",
  "/guides/history-legend-guide",
  "/guides/player-skills-guide",
  "/guides/player-encyclopedia",
  "/guides/probability-guide",
  "/guides/coupon-guide",
  "/guides/event-guide",
  "/guides/notice-guide",
  "/guides/home-guide",
  "/guides/start",
  "/privacy",
  "/terms",
  "/contact",
  "/about",
  // "/mode/history" 는 v1 폐기 후 "/history-mode/legend" 로 가는 리다이렉트만 남아
  // 콘텐츠가 없다 — 대상에서 제외.
  // "/community" 는 infra/seo/routeSeo.js NOINDEX_PATHS 대상이라 넣지 않는다.
  // "/probability/:sectionId" (섹션 61개) 도 같은 이유(2026-09-04, 원본성 없는 공시표 재게재)로
  // NOINDEX_PATHS 에 들어가 대상에서 뺐다 — sitemap.xml 도 동일하게 인덱스만 남겼다.
];

// 본문이 렌더돼야 의미가 있는 라우트 — 이 셀렉터로 실제 항목이 DOM 에 나타날 때까지 기다린 뒤
// 개수를 재확인한다. CSS Module 해시 클래스는 빌드마다 값이 바뀌므로 쓰지 않는다 — 구조 기반
// 선택자(table tbody tr) 또는 속성 기반 선택자([href^="..."]), 필요한 경우 원래 클래스명이
// 접두로 남는 부분일치([class*="..."])를 쓴다.
const DATA_ROUTES = {
  // NoticeCard(featured/list 공용) 는 Link(to=/notice/:id) → <a href="/notice/...">
  "/notices": 'a[href^="/notice/"]',
  // CouponCard 는 항상 <article> 로 렌더된다 (앱 전체에서 <article> 사용처가 여기뿐).
  "/coupons": "article",
  // EventCard 는 externalLink 유무에 따라 <a>/<div> 로 갈리므로 태그 대신 클래스 부분일치.
  "/events": '[class*="eventCard"]',
  // PlayerCard 는 항상 <div className={styles.card}> 로 렌더된다 — 로컬 클래스명이 "card" 하나뿐이라
  // 부분일치로 충분하다. 기본 진입 시 구단 1개 + 연도 1개 로스터만 보여줘 자연히 첫 페이지 분량(수십 장)만
  // 스냅샷된다 — 별도 상한 로직 불필요.
  "/players": '[class*="card"]',
  "/legend-stats": "table tbody tr",
  "/history-mode/legend": "table tbody tr",
  // OddsIndexScreen 은 정적 데이터(src/data/odds)지만 렌더 자체는 동일하게 확인한다.
  "/probability": 'a[href^="/probability/"]',
  // 스킬 바는 펼침 토글이라 aria-expanded 를 갖는다 — 이 화면에서 유일한 속성이다.
  "/skills": "[aria-expanded]",
};

// 공지 상세(/notice/:slug) 는 목록이 빌드 시점에 API 로 동적으로 정해지므로 DATA_ROUTES 에
// 고정 키로 넣을 수 없다 — 모든 공지 상세가 공유하는 셀렉터 하나만 둔다.
// NoticeDetailScreen 은 로딩/에러/없는글 상태에서는 title 을 렌더하지 않고, 정상 로드 시에만
// <h1 className={styles.title}>제목</h1> 을 렌더한다 — 데이터 도착의 유일한 신호다.
const NOTICE_DETAIL_SELECTOR = 'h1[class*="title"]';

// 정적 라우트는 DATA_ROUTES 고정 매핑, 공지 상세(/notice/ 로 시작하되 목록 자신은 제외)는
// 공통 셀렉터를 쓴다.
function getDataSelector(route) {
  if (DATA_ROUTES[route]) return DATA_ROUTES[route];
  if (route.startsWith("/notice/")) return NOTICE_DETAIL_SELECTOR;
  return undefined;
}

// verify-prerender.mjs 가 그대로 import 해서 라우트 → 산출 파일 경로 매핑을 재사용한다.
// 한글 slug 는 인코딩하지 않고 원문 그대로 세그먼트로 써서 실제 문자로 된 디렉터리를 만든다 —
// S3 오브젝트 키는 UTF-8 원문으로 저장되고, CloudFront 가 요청 URI 의 퍼센트 인코딩을 디코딩해
// 그 키로 조회하기 때문이다(즉 서빙 시점 조회 키 = 원문 slug). 여기서 encodeURIComponent 를
// 쓰면 파일명과 실제 조회 키가 어긋나 404 가 난다 — sitemap.xml 의 <loc> 인코딩(사람이 보는
// URL 표기용)과는 목적이 다르다.
export function routeToOutputFile(route) {
  if (route === "/") return path.join(distDir, "index.html");
  const segments = route.split("/").filter(Boolean);
  return path.join(distDir, ...segments, "index.html");
}

// MobileLayout.jsx 의 Suspense fallback 마크업 — <div className={styles.loading}>로딩중...</div>.
// CSS Module 해시가 붙어도 원래 클래스명("loading")이 접두로 남으므로 부분일치로 잡는다.
// innerText 기반 판정은 CSS 로 숨겨진 fallback 도 "없는 것"으로 오판하므로 쓰지 않는다 — 항상
// DOM 존재 여부(querySelector)로만 판정한다.
const FALLBACK_SELECTOR = '[class*="loading"]';
const LOADING_TEXT = "로딩중";

async function main() {
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    console.error("[prerender] dist/index.html 이 없다 — 먼저 vite build 를 실행해야 한다.");
    process.exit(1);
  }

  // 공지 상세는 best-effort — sitemap 확장(generate-sitemap.mjs)과 같은 철학이다. 목록 API 가
  // 실패하거나 응답이 비어도 정적 라우트 프리렌더/빌드는 그대로 진행하고 공지 상세만 건너뛴다.
  let noticeRoutes = [];
  try {
    const notices = await fetchVisibleInternalNotices();
    // 원문(디코딩된) slug 그대로 라우트를 만든다 — routeToOutputFile 이 이 값을 그대로
    // 디렉터리 세그먼트로 써서 CloudFront/S3 조회 키와 맞춘다(위 routeToOutputFile 주석 참고).
    noticeRoutes = notices.map((n) => `/notice/${noticeTitleToSlug(n.title, n.id)}`);
    console.log(`[prerender] 공지 상세 ${noticeRoutes.length}건 대상에 추가`);
  } catch (err) {
    console.warn(`[prerender] 경고 — 공지 목록 API 조회 실패, 공지 상세 프리렌더를 건너뛴다: ${err.message}`);
  }

  const routes = [...STATIC_ROUTES, ...noticeRoutes];

  console.log(`[prerender] 대상 라우트 ${routes.length}개 (정적 ${STATIC_ROUTES.length} + 공지 상세 ${noticeRoutes.length})`);

  // host/port 고정 — BE CorsConfig 허용 origin(http://localhost:3000) 과 정확히 일치해야 한다.
  // strictPort: 포트가 이미 점유돼 다른 포트로 넘어가면 CORS 가 조용히 다시 막히므로, 그 경우
  // 넘어가지 말고 바로 실패시킨다.
  const server = await preview({
    root: webRoot,
    logLevel: "warn",
    preview: { host: "localhost", port: 3000, strictPort: true },
  });
  const base = server.resolvedUrls.local[0].replace(/\/$/, "");
  console.log(`[prerender] preview 서버: ${base}`);

  // --no-sandbox: GitHub Actions 러너(Ubuntu 23.10+)는 unprivileged user
  // namespace 를 막아 크롬 샌드박스가 "No usable sandbox" 로 크래시한다.
  // 러너는 격리된 일회성 환경이라 샌드박스 비활성이 안전하다.
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const failed = [];
  const dataWarnings = [];
  const fallbackWarnings = [];
  let ok = 0;

  try {
    for (const route of routes) {
      const page = await browser.newPage();
      try {
        // 'load' 까지만 대기 — 목록 화면의 API fetch(coupons/events/notices)가
        // 응답 지연/실패해도 스냅샷 생성이 그것 때문에 막히지 않게 한다.
        await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 30000 });

        const dataSelector = getDataSelector(route);

        if (dataSelector) {
          // React.lazy 청크 렌더 + API 응답(또는 정적 데이터 계산) 완료까지 실제 항목이 DOM 에
          // 나타나는 것으로 판정한다. "로딩중" 소멸은 청크 로드 신호일 뿐 데이터 도착 신호가
          // 아니라서 쓰지 않는다. /legend-stats, /history-mode/legend 는 운영 API 왕복이 껴서
          // 여유 있게 20초를 둔다.
          await page
            .waitForFunction(
              (sel) => document.querySelectorAll(sel).length > 0,
              { timeout: 20000 },
              dataSelector
            )
            .catch(() => {
              // 20초 내 못 채워도 있는 그대로 스냅샷 — 아래 rowCount 체크가 경고를 남긴다
            });
        } else {
          // 데이터 라우트가 아닌 정적 페이지 — Suspense fallback 이 DOM 에서 사라질 때까지만
          // 기다린다(청크 로드 완료 신호). innerText 대신 구조적 존재 여부로 판정한다.
          //
          // ⚠️ "사라짐"만 기다리면 레이스가 생긴다 — goto('load') 직후 아직 React 가 fallback을
          // 마운트하기 전 이 시점에 검사하면 "이미 없음"으로 즉시 통과해버려, 실제로는 chunk 가
          // 로드 중인데 그대로 스냅샷된다. 그래서 먼저 fallback 이 (있었다면) 한 번 나타나는
          // 것까지 짧게 확인한 뒤에, 사라지는 것을 기다린다.
          await page
            .waitForFunction(
              (sel) => Boolean(document.querySelector(sel)),
              { timeout: 2000 },
              FALLBACK_SELECTOR
            )
            .catch(() => {
              // fallback 이 뜰 새도 없이 이미 렌더 완료된 경우 — 정상
            });
          await page
            .waitForFunction(
              (sel) => !document.querySelector(sel),
              { timeout: 15000 },
              FALLBACK_SELECTOR
            )
            .catch(() => {
              // 15초 내 못 벗어나도 있는 그대로 스냅샷 — 레이아웃 확인 목적은 달성됨
            });
        }

        // useDocumentMeta 의 useEffect(title/description/canonical) flush 유예
        await new Promise((resolve) => setTimeout(resolve, 150));

        // 데이터 도착 확인 — CORS 가 막혀도 page load 자체는 성공하므로 이 체크가 없으면
        // 빈 목록이 그대로 "성공"으로 기록된다.
        if (dataSelector) {
          const rowCount = await page.$$eval(dataSelector, (els) => els.length).catch(() => 0);
          if (rowCount === 0) {
            const message = "데이터 없이 스냅샷됨 (항목 0개) — CORS/네트워크 확인 필요";
            dataWarnings.push({ route, message });
            console.warn(`[prerender] 경고: ${route} — ${message}`);
          }
        }

        const html = await page.content();

        // 모든 라우트 공통 — 최종 HTML 에 fallback 문구가 여전히 남아 있으면 경고.
        // (데이터 라우트는 위 rowCount 체크와 별개로, 정적 라우트까지 포함해 빠짐없이 확인)
        if (html.includes(LOADING_TEXT)) {
          const message = "최종 스냅샷에 fallback 문구('로딩중')가 남아 있음";
          fallbackWarnings.push({ route, message });
          console.warn(`[prerender] 경고: ${route} — ${message}`);
        }

        const outFile = routeToOutputFile(route);
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, html, "utf-8");
        ok++;
      } catch (err) {
        failed.push({ route, message: err.message, isNotice: route.startsWith("/notice/") });
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

  console.log(`[prerender] 완료 ${ok}/${routes.length}`);
  if (dataWarnings.length > 0) {
    console.warn("[prerender] 데이터 미도착 경고:");
    dataWarnings.forEach((w) => console.warn(`  - ${w.route}: ${w.message}`));
  }
  if (fallbackWarnings.length > 0) {
    console.warn("[prerender] fallback 잔존 경고:");
    fallbackWarnings.forEach((w) => console.warn(`  - ${w.route}: ${w.message}`));
  }
  if (failed.length > 0) {
    console.error("[prerender] 실패 목록:");
    failed.forEach((f) => console.error(`  - ${f.route}: ${f.message}`));

    // 공지 상세는 best-effort(§ generate-sitemap.mjs 와 동일 철학) — 이 라우트만 실패해도
    // 정적 라우트 프리렌더가 전부 성공했다면 빌드를 막지 않는다. 정적 라우트가 하나라도
    // 실패하면 기존과 동일하게 빌드를 실패시킨다.
    const staticFailed = failed.filter((f) => !f.isNotice);
    if (staticFailed.length > 0) {
      process.exitCode = 1;
    } else {
      console.warn("[prerender] 공지 상세 일부만 실패 — best-effort 이므로 빌드는 계속 진행");
    }
  }
}

// verify-prerender.mjs 가 STATIC_ROUTES/routeToOutputFile 만 재사용하려고 이 파일을
// import 할 때 puppeteer 전체 렌더 플로우가 부수효과로 다시 실행되면 안 된다 — 직접
// 실행(`node scripts/prerender.mjs`)했을 때만 main() 을 돌린다. 기존 직접 실행 동작은
// 그대로다.
const isMainModule = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) {
  main().catch((err) => {
    console.error("[prerender] 치명적 오류", err);
    process.exitCode = 1;
  });
}
