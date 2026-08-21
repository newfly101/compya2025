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
/// <reference path="./domains/admin-components.ts" />
/// <reference path="./domains/admin-screens-v2.ts" />

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

    // === [실행됨 2026-05-31] admin 4종 + wiki 5종 신규 ===
    // await AdminCouponDomain.run();
    // await AdminEventDomain.run();
    // await AdminNoticeDomain.run();
    // await AdminUserDomain.run();
    // await WikiEntryDomain.run();
    // await WikiSkillDomain.run();
    // await WikiRecommendDomain.run();
    // await WikiGameInfoDomain.run();
    // figma.notify('admin 4종 + wiki 5종 렌더 완료 (2026-05-31)');

    // === [실행 중 2026-08-20] admin 재설계 2단계 — 부품 섹션 재배치(x:10400) + 화면 7장 조립 ===
    await AdminComponentsDomain.run();
    await AdminScreensV2Domain.run();

    figma.notify('Admin v2 — 부품 섹션 이동 + 화면 7장 조립 완료 (2026-08-20)');
    figma.closePlugin();
  } catch (err) {
    // console.error 를 먼저 동기 호출 — figma.closePlugin() 이 뒤이어 콘솔 출력을 잘라먹지 않게 순서 고정.
    console.error('[code.ts] Plugin error:', err, (err as any) && (err as any).stack);
    figma.notify(`Plugin error: ${String(err)}`, { error: true });
    figma.closePlugin();
  }
})();
