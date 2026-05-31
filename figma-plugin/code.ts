/// <reference path="./shared/tokens.ts" />
/// <reference path="./shared/helpers.ts" />
/// <reference path="./domains/applayout.ts" />
/// <reference path="./domains/home.ts" />
/// <reference path="./domains/admin-coupon.ts" />
/// <reference path="./domains/admin-event.ts" />
/// <reference path="./domains/admin-notice.ts" />
/// <reference path="./domains/admin-user.ts" />
/// <reference path="./domains/wiki-entry.ts" />
/// <reference path="./domains/wiki-skill.ts" />
/// <reference path="./domains/wiki-recommend.ts" />
/// <reference path="./domains/wiki-game-info.ts" />

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

    // === [실행됨 2026-05-29] home 화면 v1 (figma 진리 sync) ===
    // await ApplayoutDomain.run();
    // await HomeDomain.run();

    // === [실행 중 2026-05-31] admin 4종 + wiki 5종 신규 ===
    await AdminCouponDomain.run();
    await AdminEventDomain.run();
    await AdminNoticeDomain.run();
    await AdminUserDomain.run();
    await WikiEntryDomain.run();
    await WikiSkillDomain.run();
    await WikiRecommendDomain.run();
    await WikiGameInfoDomain.run();

    figma.notify('admin 4종 + wiki 5종 렌더 완료 (2026-05-31)');
    figma.closePlugin();
  } catch (err) {
    figma.notify(`Plugin error: ${String(err)}`, { error: true });
    figma.closePlugin();
  }
})();
