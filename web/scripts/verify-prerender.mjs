#!/usr/bin/env node
// web/scripts/verify-prerender.mjs
// 배포 전 게이트 — dist/<route>/index.html 이 실제 prerender 스냅샷인지 확인한다.
// (AdSense 반려 재발 방지) build:prerender 가 중간에 실패해도 vite build 가 만든
// 루트 index.html(SPA 셸)만으로 배포가 나가는 사고를 막는 게 목적.
//
// 라우트 목록은 prerender.mjs 의 STATIC_ROUTES 를 그대로 import 해서 쓴다 — 여기 또
// 하드코딩하면 유지보수 지점이 하나 더 늘어난다(현재 prerender.mjs / sitemap.xml 두 곳).
//
// 사용: node web/scripts/verify-prerender.mjs
// exit code: 0 = 통과, 1 = 누락 또는 의심 스냅샷 존재

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STATIC_ROUTES, routeToOutputFile } from "./prerender.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const distDir = path.join(webRoot, "dist");
const rootIndexFile = path.join(distDir, "index.html");

// "빈 SPA 셸 의심" 판정 기준
// ------------------------------------------------------------------
// 루트 index.html 자체도 "/" 라우트의 prerender 스냅샷이라(STATIC_ROUTES 에 "/" 포함),
// build:fast 가 만드는 순수 SPA 셸의 "원래 크기"를 별도로 알 방법이 없다(prerender 단계가
// 그 파일을 덮어쓴다). 대신 아래 두 신호로 "이 route 파일이 사실 루트 콘텐츠의 복사본
// 아니냐"를 의심한다:
//   1) 바이트가 완전히 동일 — 가장 강한 신호. 서로 다른 라우트가 본문(카드/표/텍스트)까지
//      100% 같을 수는 없으므로, 동일하다면 복사본이라고 봐도 무방하다.
//   2) 크기 차이가 사소함(<= max(200바이트, 루트 크기의 1%)) — 완전 동일이 아니어도 실제
//      데이터(선수 카드, 쿠폰 목록, 표 row 등)가 들어간 페이지라면 최소 수백 바이트~수 KB
//      단위로 차이가 나야 정상이다. 차이가 이 정도로 작으면 데이터 없이 빈 틀만 찍힌
//      스냅샷이거나 셸이 그대로 복사됐을 가능성이 높다.
const SIZE_DIFF_MIN_ABS = 200;
const SIZE_DIFF_RATIO = 0.01;

function isSuspectShellCopy(routeSize, rootSize) {
  const diff = Math.abs(routeSize - rootSize);
  const tolerance = Math.max(SIZE_DIFF_MIN_ABS, rootSize * SIZE_DIFF_RATIO);
  return diff <= tolerance;
}

function main() {
  if (!fs.existsSync(rootIndexFile)) {
    console.error(
      `[verify-prerender] ✖ dist/index.html 이 없다 — 빌드 자체가 안 됐다. (web 디렉터리에서 build:prerender 를 먼저 실행할 것)`
    );
    process.exit(1);
  }

  const rootSize = fs.statSync(rootIndexFile).size;
  const rootContent = fs.readFileSync(rootIndexFile, "utf-8");

  const missing = [];
  const suspect = [];

  for (const route of STATIC_ROUTES) {
    const outFile = routeToOutputFile(route);
    const label = route === "/" ? "/" : route;

    if (!fs.existsSync(outFile)) {
      missing.push(label);
      continue;
    }

    if (route === "/") continue; // 루트 자기 자신과는 비교 대상이 아니다

    const size = fs.statSync(outFile).size;
    const content = fs.readFileSync(outFile, "utf-8");

    if (content === rootContent || isSuspectShellCopy(size, rootSize)) {
      suspect.push({ route: label, size, rootSize });
    }
  }

  console.log(`[verify-prerender] 대상 ${STATIC_ROUTES.length}개 라우트 확인`);

  if (missing.length > 0) {
    console.error("[verify-prerender] ✖ 스냅샷 누락:");
    missing.forEach((r) => console.error(`    - dist${r === "/" ? "" : r}/index.html`));
  }

  if (suspect.length > 0) {
    console.error("[verify-prerender] ✖ 빈 셸 의심 (루트 index.html 과 크기가 사실상 동일):");
    suspect.forEach(({ route, size, rootSize: rs }) =>
      console.error(`    - ${route}: ${size}B (루트 ${rs}B)`)
    );
  }

  if (missing.length > 0 || suspect.length > 0) {
    console.error(
      "[verify-prerender] 배포 중단 — build:fast 로 잘못 빌드됐거나 prerender.mjs 가 실패했을 가능성. build:prerender 로 재빌드 후 재확인할 것"
    );
    process.exit(1);
  }

  console.log("[verify-prerender] ✓ 통과 — 모든 라우트 스냅샷 확인됨");
}

main();
