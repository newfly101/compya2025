/// <reference path="./shared/tokens.ts" />
/// <reference path="./shared/helpers.ts" />
/// <reference path="./domains/applayout.ts" />
/// <reference path="./domains/home.ts" />

// ============================================================
// figma-plugin/code.ts — entry
// 도메인 dispatch 진입점. 각 도메인은 namespace 로 분리 (domains/*.ts).
// Option A: tsc outFile + namespace 패턴 (외부 의존 0).
//
// 사용:
//   1. cd figma-plugin && npm run build (또는 npm run watch)
//   2. Figma desktop → Ctrl+Alt+P (Run Last Plugin)
// ============================================================

(async () => {
  try {
    await figma.loadAllPagesAsync();
    // await ApplayoutDomain.run();
    await HomeDomain.run();
    figma.closePlugin();
  } catch (err) {
    figma.notify(`Plugin error: ${String(err)}`, { error: true });
    figma.closePlugin();
  }
})();
