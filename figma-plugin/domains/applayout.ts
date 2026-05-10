/// <reference path="../shared/tokens.ts" />
/// <reference path="../shared/helpers.ts" />

// ============================================================
// figma-plugin/domains/applayout.ts
// AppLayout F1~F10 — applayout 도메인 frame 생성
//
// 출처:
//   web/src/app/wrapper/mobile/MobileLayout.jsx + .module.scss
//   web/src/app/wrapper/mobile/parts/TopBar.jsx + .module.scss
//   web/src/app/wrapper/mobile/parts/Drawer.jsx + .module.scss
//   web/src/app/wrapper/mobile/config/MENU_GROUPS.js
//   web/src/global/ui/renewalNoticeModal/RenewalNoticeModal.jsx + .module.scss
//   web/src/global/ui/responseModal/ResponseModal.jsx + .module.scss
//   web/src/global/styles/variables/{_colors,_spacing,_radius,_font,_breakpoints,_zindex}.scss
// ============================================================

namespace ApplayoutDomain {
  // local aliases (namespace 단축)
  const COLOR = Tokens.COLOR;
  const ALPHA = Tokens.ALPHA;
  const SPACE = Tokens.SPACE;
  const RADIUS = Tokens.RADIUS;
  const LAYOUT = Tokens.LAYOUT;
  const FS = Tokens.FS;
  const FW_REGULAR = Tokens.FW_REGULAR;
  const FW_SEMIBOLD = Tokens.FW_SEMIBOLD;
  const FW_BOLD = Tokens.FW_BOLD;

  const solid = Helpers.solid;
  const solidA = Helpers.solidA;
  const makeFrame = Helpers.makeFrame;
  const makeText = Helpers.makeText;
  const applySizing = Helpers.applySizing;

  // ── F1: Mobile wrapper ──────────────────────────────────────
  // 출처: MobileLayout.jsx + MobileLayout.module.scss
  //   .appWrapper  — bg-deepest, flex column, overflow hidden
  //   .pageContent — padding-top 52 (TopBar 영역 확보)
  function buildF1(): FrameNode {
    const f = makeFrame({
      name: 'F1 Mobile wrapper',
      width: LAYOUT.mobileLg,
      height: LAYOUT.mobileH,
      dir: 'VERTICAL',
      itemSpacing: 0,
      fill: solid(COLOR.bgDeepest),
    });

    // PHASE 3: children
    const topbar = buildTopBarHome(false);
    topbar.layoutAlign = 'STRETCH';
    f.appendChild(topbar);

    const pageContent = makeFrame({
      name: '.pageContent',
      width: LAYOUT.mobileLg,
      height: LAYOUT.mobileH - LAYOUT.topbarHeight,
      dir: 'VERTICAL',
      layoutAlign: 'STRETCH',
      layoutGrow: 1,
    });
    applySizing(pageContent, 'FIXED', 'FIXED');
    f.appendChild(pageContent);

    // PHASE 4
    applySizing(f, 'FIXED', 'FIXED');
    return f;
  }

  // ── TopBar (home variant) ───────────────────────────────────
  // 출처: TopBar.module.scss .topBar
  //   grid 1fr auto 1fr / height 52 / padding 0 16 / bg-deepest / border-bottom 1px white-06
  // D-08: HomeDomain 등 외부 namespace 에서 재사용 — export
  export function buildTopBarHome(isAuthenticated: boolean): FrameNode {
    const bar = makeFrame({
      name: isAuthenticated ? '.topBar (home, user)' : '.topBar (home, guest)',
      width: LAYOUT.mobileLg,
      height: LAYOUT.topbarHeight,
      dir: 'HORIZONTAL',
      itemSpacing: 0,
      padLeft: LAYOUT.hPad,
      padRight: LAYOUT.hPad,
      fill: solid(COLOR.bgDeepest),
      stroke: solidA(ALPHA.border),
      strokeBottomWeight: 1,
      counterAxisAlignItems: 'CENTER',
    });

    // .left — flex 1, justify-content flex-start
    const left = makeFrame({
      name: '.left',
      width: 1, height: LAYOUT.topbarHeight,
      dir: 'HORIZONTAL',
      counterAxisAlignItems: 'CENTER',
      primaryAxisAlignItems: 'MIN',
      layoutGrow: 1,
      layoutAlign: 'STRETCH',
    });

    // .burger — flex-col gap 4, width 24, 3 spans (24×2 radius 2 white-92)
    const burger = makeFrame({
      name: '.burger',
      width: 24, height: 16,
      dir: 'VERTICAL',
      itemSpacing: SPACE.s1,
    });
    for (let i = 0; i < 3; i++) {
      const span = figma.createRectangle();
      span.name = 'span';
      span.resize(24, 2);
      span.cornerRadius = 2;
      span.fills = [solidA(ALPHA.textPrimary)];
      span.layoutAlign = 'STRETCH';
      burger.appendChild(span);
    }
    applySizing(burger, 'AUTO', 'FIXED');
    left.appendChild(burger);
    applySizing(left, 'AUTO', 'FIXED');

    // .logo — text-topBar (17 / 600 / lh 120%) — center
    const logo = makeText('⚾  컴프야펀', {
      size: FS.fs17,
      weight: FW_SEMIBOLD,
      color: solidA(ALPHA.textPrimary),
      align: 'CENTER',
      lineHeightPct: 120,
      autoResize: 'WIDTH_AND_HEIGHT',
    });
    logo.name = '.logo';

    // .right — flex 1, justify-content flex-end
    const right = makeFrame({
      name: '.right',
      width: 1, height: LAYOUT.topbarHeight,
      dir: 'HORIZONTAL',
      counterAxisAlignItems: 'CENTER',
      primaryAxisAlignItems: 'MAX',
      layoutGrow: 1,
      layoutAlign: 'STRETCH',
    });

    // .loginBtn / .logoutBtn — height 28, padding 0 12, radius 4
    const btn = makeFrame({
      name: isAuthenticated ? '.logoutBtn' : '.loginBtn',
      width: 80, height: 28,
      dir: 'HORIZONTAL',
      padLeft: SPACE.s3, padRight: SPACE.s3,
      fill: solid(isAuthenticated ? COLOR.bgCard : COLOR.naverGreen),
      cornerRadius: RADIUS.sm,
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
    });
    const btnLabel = makeText(
      isAuthenticated ? '로그아웃' : 'N 네이버 로그인',
      {
        size: FS.fs10,
        weight: FW_REGULAR,
        color: solid(COLOR.white),
        lineHeightPct: 150,
        autoResize: 'WIDTH_AND_HEIGHT',
      },
    );
    btn.appendChild(btnLabel);
    applySizing(btn, 'AUTO', 'FIXED');
    right.appendChild(btn);
    applySizing(right, 'AUTO', 'FIXED');

    bar.appendChild(left);
    bar.appendChild(logo);
    bar.appendChild(right);

    applySizing(bar, 'FIXED', 'FIXED');
    return bar;
  }

  // ── TopBar (page variant) ───────────────────────────────────
  // 출처: TopBar.jsx variant === "page"
  //   .backBtn (36×36) / .pageTitle (text-topBar 17/600) / .right (rightAction slot)
  function buildTopBarPage(title: string): FrameNode {
    const bar = makeFrame({
      name: '.topBar (page)',
      width: LAYOUT.mobileLg,
      height: LAYOUT.topbarHeight,
      dir: 'HORIZONTAL',
      itemSpacing: 0,
      padLeft: LAYOUT.hPad,
      padRight: LAYOUT.hPad,
      fill: solid(COLOR.bgDeepest),
      stroke: solidA(ALPHA.border),
      strokeBottomWeight: 1,
      counterAxisAlignItems: 'CENTER',
    });

    const left = makeFrame({
      name: '.left',
      width: 1, height: LAYOUT.topbarHeight,
      dir: 'HORIZONTAL',
      counterAxisAlignItems: 'CENTER',
      primaryAxisAlignItems: 'MIN',
      layoutGrow: 1,
      layoutAlign: 'STRETCH',
    });
    const backBtn = makeFrame({
      name: '.backBtn',
      width: 36, height: 36,
      dir: 'HORIZONTAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
    });
    const backIcon = makeText('‹', {
      size: FS.fs22,
      weight: FW_BOLD,
      color: solidA(ALPHA.textPrimary),
      align: 'CENTER',
      lineHeightPct: 120,
      autoResize: 'WIDTH_AND_HEIGHT',
    });
    backIcon.name = '.backIcon';
    backBtn.appendChild(backIcon);
    applySizing(backBtn, 'FIXED', 'FIXED');
    left.appendChild(backBtn);
    applySizing(left, 'AUTO', 'FIXED');

    const titleText = makeText(title, {
      size: FS.fs17,
      weight: FW_SEMIBOLD,
      color: solidA(ALPHA.textPrimary),
      align: 'CENTER',
      lineHeightPct: 120,
      autoResize: 'WIDTH_AND_HEIGHT',
    });
    titleText.name = '.pageTitle';

    const right = makeFrame({
      name: '.right',
      width: 1, height: LAYOUT.topbarHeight,
      dir: 'HORIZONTAL',
      counterAxisAlignItems: 'CENTER',
      primaryAxisAlignItems: 'MAX',
      layoutGrow: 1,
      layoutAlign: 'STRETCH',
    });
    applySizing(right, 'FIXED', 'FIXED');

    bar.appendChild(left);
    bar.appendChild(titleText);
    bar.appendChild(right);

    applySizing(bar, 'FIXED', 'FIXED');
    return bar;
  }

  // ── F2: TopBar home (2 states stacked) ──────────────────────
  function buildF2(): FrameNode {
    const f = makeFrame({
      name: 'F2 TopBar home',
      width: LAYOUT.mobileLg,
      height: 1,
      dir: 'VERTICAL',
      itemSpacing: SPACE.s4,
      padTop: SPACE.s4,
      padBottom: SPACE.s4,
      fill: solid(COLOR.bgDeep),
    });

    const guest = buildTopBarHome(false);
    guest.layoutAlign = 'STRETCH';
    f.appendChild(guest);

    const user = buildTopBarHome(true);
    user.layoutAlign = 'STRETCH';
    f.appendChild(user);

    applySizing(f, 'AUTO', 'FIXED');
    return f;
  }

  // ── F3: TopBar page ─────────────────────────────────────────
  function buildF3(): FrameNode {
    const f = makeFrame({
      name: 'F3 TopBar page',
      width: LAYOUT.mobileLg,
      height: 1,
      dir: 'VERTICAL',
      itemSpacing: 0,
      padTop: SPACE.s4,
      padBottom: SPACE.s4,
      fill: solid(COLOR.bgDeep),
    });

    const page = buildTopBarPage('페이지 제목');
    page.layoutAlign = 'STRETCH';
    f.appendChild(page);

    applySizing(f, 'AUTO', 'FIXED');
    return f;
  }

  // ── Drawer panel ─────────────────────────────────────────────
  // 출처: Drawer.module.scss .drawer / .profile / .nav / .group / .menuItem / .badge
  //   width 250 (max-width pin) / height 932-52 / bg-deep / flex column
  function buildDrawerPanel(isAuthenticated: boolean, activeIdx: number): FrameNode {
    const panelHeight = LAYOUT.mobileH - LAYOUT.topbarHeight;

    const panel = makeFrame({
      name: isAuthenticated ? '.drawer (user)' : '.drawer (guest)',
      width: LAYOUT.drawerMaxWidth,
      height: panelHeight,
      dir: 'VERTICAL',
      itemSpacing: 0,
      fill: solid(COLOR.bgDeep),
    });

    // .profile wrapper (margin-top 12, margin-left/right 16)
    const profileWrap = makeFrame({
      name: 'profile-wrap',
      width: LAYOUT.drawerMaxWidth,
      height: 1,
      dir: 'VERTICAL',
      padTop: SPACE.s3,
      padLeft: SPACE.s4,
      padRight: SPACE.s4,
      layoutAlign: 'STRETCH',
    });

    // .profile — flex-row gap 12 / padding 12 / bg-card / radius 10 / border 1 white-06
    const profile = makeFrame({
      name: '.profile',
      width: LAYOUT.drawerMaxWidth - SPACE.s4 * 2,
      height: 1,
      dir: 'HORIZONTAL',
      itemSpacing: SPACE.s3,
      padTop: SPACE.s3, padBottom: SPACE.s3,
      padLeft: SPACE.s3, padRight: SPACE.s3,
      fill: solid(COLOR.bgCard),
      cornerRadius: RADIUS.xl,
      stroke: solidA(ALPHA.border),
      strokeWeight: 1,
      counterAxisAlignItems: 'CENTER',
      layoutAlign: 'STRETCH',
    });

    if (isAuthenticated) {
      // .avatar — 44×44 radius full, brand-dark
      const avatar = makeFrame({
        name: '.avatar',
        width: 44, height: 44,
        dir: 'HORIZONTAL',
        fill: solid(COLOR.brandDark),
        cornerRadius: RADIUS.full,
        primaryAxisAlignItems: 'CENTER',
        counterAxisAlignItems: 'CENTER',
      });
      applySizing(avatar, 'FIXED', 'FIXED');
      profile.appendChild(avatar);

      // .userInfo — flex-col gap 4
      const info = makeFrame({
        name: '.userInfo',
        width: 1, height: 1,
        dir: 'VERTICAL',
        itemSpacing: SPACE.s1,
        layoutGrow: 1,
      });
      const userName = makeText('사용자 닉네임', {
        size: FS.fs13, weight: FW_SEMIBOLD,
        color: solidA(ALPHA.textPrimary),
        lineHeightPct: 150,
        autoResize: 'WIDTH_AND_HEIGHT',
      });
      userName.name = '.userName';
      const userStatus = makeText('user@example.com', {
        size: FS.fs10, weight: FW_REGULAR,
        color: solidA(ALPHA.textMuted),
        lineHeightPct: 150,
        autoResize: 'WIDTH_AND_HEIGHT',
      });
      userStatus.name = '.userStatus';
      info.appendChild(userName);
      info.appendChild(userStatus);
      applySizing(info, 'AUTO', 'AUTO');
      profile.appendChild(info);
    } else {
      // .guestInfo — flex-col gap 4 / flex 1
      const guestInfo = makeFrame({
        name: '.guestInfo',
        width: 1, height: 1,
        dir: 'VERTICAL',
        itemSpacing: SPACE.s1,
        layoutGrow: 1,
      });
      const guestTitle = makeText('로그인하고 더 많은 컨텐츠 이용하기!', {
        size: FS.fs12, weight: FW_REGULAR,
        color: solidA(ALPHA.textPrimary),
        lineHeightPct: 150,
        autoResize: 'WIDTH_AND_HEIGHT',
      });
      guestTitle.name = '.guestTitle';

      const loginBtn = makeFrame({
        name: '.loginBtn',
        width: 120, height: 28,
        dir: 'HORIZONTAL',
        padLeft: SPACE.s3, padRight: SPACE.s3,
        fill: solid(COLOR.naverGreen),
        cornerRadius: RADIUS.sm,
        primaryAxisAlignItems: 'CENTER',
        counterAxisAlignItems: 'CENTER',
      });
      const loginLabel = makeText('N 네이버 로그인', {
        size: FS.fs10, weight: FW_REGULAR,
        color: solid(COLOR.white),
        lineHeightPct: 150,
        autoResize: 'WIDTH_AND_HEIGHT',
      });
      loginBtn.appendChild(loginLabel);
      applySizing(loginBtn, 'AUTO', 'FIXED');

      guestInfo.appendChild(guestTitle);
      guestInfo.appendChild(loginBtn);
      applySizing(guestInfo, 'AUTO', 'AUTO');
      profile.appendChild(guestInfo);
    }
    applySizing(profile, 'FIXED', 'AUTO');
    profileWrap.appendChild(profile);
    applySizing(profileWrap, 'AUTO', 'FIXED');
    panel.appendChild(profileWrap);

    // .nav — padding 12 0 32, flex 1
    const nav = makeFrame({
      name: '.nav',
      width: LAYOUT.drawerMaxWidth,
      height: 1,
      dir: 'VERTICAL',
      itemSpacing: 0,
      padTop: SPACE.s3, padBottom: SPACE.s8,
      layoutAlign: 'STRETCH',
      layoutGrow: 1,
    });

    // MENU_GROUPS — config/MENU_GROUPS.js (정확 1:1)
    const groups = [
      {
        label: '메인',
        items: [
          { icon: '🏠', label: '홈',          badge: null as number | null },
          { icon: '🎪', label: '이벤트',       badge: 5    as number | null },
          { icon: '🎫', label: '쿠폰 코드',    badge: 3    as number | null },
          { icon: '📢', label: '공지사항',     badge: null as number | null },
        ],
      },
      {
        label: '컨텐츠',
        items: [
          { icon: '🎮', label: '스킬 시뮬레이터',   badge: null as number | null },
          { icon: '📖', label: '추천 백과사전',     badge: null as number | null },
          { icon: '🎯', label: '히스토리 탐색기',   badge: null as number | null },
        ],
      },
    ];

    let cursor = 0;
    for (const grp of groups) {
      const group = makeFrame({
        name: '.group',
        width: LAYOUT.drawerMaxWidth,
        height: 1,
        dir: 'VERTICAL',
        itemSpacing: 0,
        layoutAlign: 'STRETCH',
      });

      // groupLabel wrap (padding 16 16 8)
      const labelWrap = makeFrame({
        name: 'groupLabel-wrap',
        width: LAYOUT.drawerMaxWidth, height: 1,
        dir: 'VERTICAL',
        padTop: SPACE.s4, padBottom: SPACE.s2,
        padLeft: SPACE.s4, padRight: SPACE.s4,
        layoutAlign: 'STRETCH',
      });
      const groupLabel = makeText(grp.label, {
        size: FS.fs10, weight: FW_REGULAR,
        color: solidA(ALPHA.textMuted),
        lineHeightPct: 150,
        autoResize: 'WIDTH_AND_HEIGHT',
      });
      groupLabel.name = '.groupLabel';
      labelWrap.appendChild(groupLabel);
      applySizing(labelWrap, 'AUTO', 'FIXED');
      group.appendChild(labelWrap);

      // .menuList
      const menuList = makeFrame({
        name: '.menuList',
        width: LAYOUT.drawerMaxWidth, height: 1,
        dir: 'VERTICAL',
        itemSpacing: 0,
        layoutAlign: 'STRETCH',
      });

      for (const item of grp.items) {
        const isActive = cursor === activeIdx;

        // .menuItem — flex-row gap 12 / height 52 / padding 0 16
        const row = makeFrame({
          name: isActive ? '.menuItem (active)' : '.menuItem',
          width: LAYOUT.drawerMaxWidth, height: 52,
          dir: 'HORIZONTAL',
          itemSpacing: SPACE.s3,
          padLeft: SPACE.s4, padRight: SPACE.s4,
          fill: isActive ? solid(COLOR.bgOverlay) : undefined,
          counterAxisAlignItems: 'CENTER',
          layoutAlign: 'STRETCH',
        });

        const icon = makeText(item.icon, {
          size: 20, weight: FW_REGULAR,
          color: solidA(ALPHA.textPrimary),
          lineHeightPct: 100,
          autoResize: 'WIDTH_AND_HEIGHT',
        });
        icon.name = '.menuIcon';

        const label = makeText(item.label, {
          size: FS.fs13, weight: FW_SEMIBOLD,
          color: solidA(isActive ? ALPHA.textPrimary : ALPHA.textSecondary),
          lineHeightPct: 150,
          autoResize: 'WIDTH_AND_HEIGHT',
          layoutAlign: 'STRETCH',
        });
        label.name = '.menuLabel';
        label.layoutGrow = 1;

        row.appendChild(icon);
        row.appendChild(label);

        if (item.badge != null) {
          const badge = makeFrame({
            name: '.badge',
            width: 20, height: 20,
            dir: 'HORIZONTAL',
            padLeft: SPACE.s1, padRight: SPACE.s1,
            fill: solid(COLOR.brandViolet),
            cornerRadius: RADIUS.full,
            primaryAxisAlignItems: 'CENTER',
            counterAxisAlignItems: 'CENTER',
          });
          const badgeText = makeText(String(item.badge), {
            size: FS.fs9, weight: FW_SEMIBOLD,
            color: solid(COLOR.white),
            lineHeightPct: 100,
            autoResize: 'WIDTH_AND_HEIGHT',
          });
          badge.appendChild(badgeText);
          applySizing(badge, 'AUTO', 'FIXED');
          row.appendChild(badge);
        }

        applySizing(row, 'FIXED', 'FIXED');
        menuList.appendChild(row);
        cursor++;
      }

      applySizing(menuList, 'AUTO', 'FIXED');
      group.appendChild(menuList);
      applySizing(group, 'AUTO', 'FIXED');
      nav.appendChild(group);
    }

    applySizing(nav, 'AUTO', 'FIXED');
    panel.appendChild(nav);

    applySizing(panel, 'FIXED', 'FIXED');
    return panel;
  }

  // ── F4 / F5: Drawer (절대 위치 — auto-layout 미사용) ────────
  // fixed positioning 흉내. F4=guest (active 없음), F5=user (이벤트 active idx=1).
  function buildDrawerFrame(name: string, isAuthenticated: boolean): FrameNode {
    // 외곽 frame — auto-layout OFF (절대 위치 자식)
    const f = figma.createFrame();
    f.name = name;
    f.resize(LAYOUT.mobileLg, LAYOUT.mobileH);
    f.fills = [solid(COLOR.bgDeepest)];
    f.clipsContent = true;

    const topbar = buildTopBarHome(isAuthenticated);
    topbar.x = 0;
    topbar.y = 0;
    f.appendChild(topbar);

    const overlay = figma.createRectangle();
    overlay.name = '.overlay (visible)';
    overlay.resize(LAYOUT.mobileLg, LAYOUT.mobileH - LAYOUT.topbarHeight);
    overlay.fills = [solidA(ALPHA.overlayBlack60)];
    overlay.x = 0;
    overlay.y = LAYOUT.topbarHeight;
    f.appendChild(overlay);

    const panel = buildDrawerPanel(isAuthenticated, isAuthenticated ? 1 : -1);
    panel.x = 0;
    panel.y = LAYOUT.topbarHeight;
    f.appendChild(panel);

    return f;
  }
  function buildF4(): FrameNode { return buildDrawerFrame('F4 Drawer guest', false); }
  function buildF5(): FrameNode { return buildDrawerFrame('F5 Drawer user',  true); }

  // ── F6: RenewalNoticeModal ──────────────────────────────────
  // 출처: RenewalNoticeModal.module.scss
  //   .modal width 320 / radius 14 / padding 28 20 20 / bg #1e1e1e / shadow 0 20 50 black-40
  //   .message font 15 / lh 1.5 / color #e5e7eb / margin-bottom 20 / pre-line
  //   .confirmBtn width 100% / padding 10 0 / radius 8 / bg #6366f1 / white / weight 600
  function buildF6(): FrameNode {
    const f = figma.createFrame();
    f.name = 'F6 RenewalNoticeModal';
    f.resize(LAYOUT.mobileLg, LAYOUT.mobileH);
    f.fills = [solid(COLOR.bgDeepest)];
    f.clipsContent = true;

    const overlay = figma.createRectangle();
    overlay.name = '.overlay';
    overlay.resize(LAYOUT.mobileLg, LAYOUT.mobileH);
    overlay.fills = [solidA(ALPHA.overlayBlack55)];
    overlay.x = 0; overlay.y = 0;
    f.appendChild(overlay);

    const modal = makeFrame({
      name: '.modal',
      width: 320,
      height: 1,
      dir: 'VERTICAL',
      itemSpacing: SPACE.s5,
      padTop: 28,                                   // raw — 코드 baseline
      padBottom: SPACE.s5,
      padLeft: SPACE.s5,
      padRight: SPACE.s5,
      fill: solid(COLOR.modalBg),
      cornerRadius: 14,                             // raw — 코드 baseline
      counterAxisAlignItems: 'CENTER',
      effects: [{
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.4 },
        offset: { x: 0, y: 20 },
        radius: 50,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL',
      }],
    });

    const msg = makeText('리뉴얼 작업 중인 컨텐츠입니다.\n빠른 시일 내에 만나뵙겠습니다.', {
      size: FS.fs15, weight: FW_REGULAR,
      color: solid(COLOR.modalText),
      align: 'CENTER',
      lineHeightPct: 150,
      autoResize: 'HEIGHT',
      fixedWidth: 320 - SPACE.s5 * 2,               // 280
      layoutAlign: 'STRETCH',
    });
    msg.name = '.message';

    const btn = makeFrame({
      name: '.confirmBtn',
      width: 320 - SPACE.s5 * 2, height: 40,        // 10+20+10
      dir: 'HORIZONTAL',
      padTop: 10, padBottom: 10,                    // raw — 코드 baseline
      fill: solid(COLOR.modalBtn),
      cornerRadius: RADIUS.lg,
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      layoutAlign: 'STRETCH',
    });
    const btnLabel = makeText('확인', {
      size: FS.fs15, weight: FW_SEMIBOLD,
      color: solid(COLOR.white),
      align: 'CENTER',
      lineHeightPct: 150,
      autoResize: 'WIDTH_AND_HEIGHT',
    });
    btn.appendChild(btnLabel);
    applySizing(btn, 'FIXED', 'FIXED');

    modal.appendChild(msg);
    modal.appendChild(btn);

    applySizing(modal, 'AUTO', 'FIXED');

    modal.x = (LAYOUT.mobileLg - 320) / 2;
    f.appendChild(modal);
    modal.y = (LAYOUT.mobileH - modal.height) / 2;
    return f;
  }

  // ── F7/F8: ResponseModal ────────────────────────────────────
  // 출처: ResponseModal.module.scss
  //   .modal width 320 / radius 14 / padding 24 20 / bg #1e1e1e / shadow
  //   .iconSuccess|Fail font 42 / mb 12
  //   .message font 15 / lh 1.5 / color #e5e7eb / mb 20
  //   .confirmBtn (F6 와 동일)
  function buildResponseModal(name: string, success: boolean): FrameNode {
    const f = figma.createFrame();
    f.name = name;
    f.resize(LAYOUT.mobileLg, LAYOUT.mobileH);
    f.fills = [solid(COLOR.bgDeepest)];
    f.clipsContent = true;

    const overlay = figma.createRectangle();
    overlay.name = '.overlay';
    overlay.resize(LAYOUT.mobileLg, LAYOUT.mobileH);
    overlay.fills = [solidA(ALPHA.overlayBlack55)];
    overlay.x = 0; overlay.y = 0;
    f.appendChild(overlay);

    const modal = makeFrame({
      name: '.modal',
      width: 320, height: 1,
      dir: 'VERTICAL',
      itemSpacing: SPACE.s3,                       // 12 (icon→msg gap, msg→btn 별 spacer 미사용 — 룰 7)
      padTop: SPACE.s6, padBottom: SPACE.s6,       // 24
      padLeft: SPACE.s5, padRight: SPACE.s5,       // 20
      fill: solid(COLOR.modalBg),
      cornerRadius: 14,
      counterAxisAlignItems: 'CENTER',
      effects: [{
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.4 },
        offset: { x: 0, y: 20 },
        radius: 50,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL',
      }],
    });

    const icon = makeText(success ? '✓' : '!', {
      size: 42, weight: FW_BOLD,
      color: solid(success ? COLOR.iconSuccess : COLOR.iconFail),
      align: 'CENTER',
      lineHeightPct: 100,
      autoResize: 'WIDTH_AND_HEIGHT',
    });
    icon.name = success ? '.iconSuccess' : '.iconFail';

    const msg = makeText(
      success ? '요청이 정상 처리되었습니다.' : '요청 처리에 실패했습니다.',
      {
        size: FS.fs15, weight: FW_REGULAR,
        color: solid(COLOR.modalText),
        align: 'CENTER',
        lineHeightPct: 150,
        autoResize: 'HEIGHT',
        fixedWidth: 320 - SPACE.s5 * 2,
        layoutAlign: 'STRETCH',
      },
    );
    msg.name = '.message';

    const btn = makeFrame({
      name: '.confirmBtn',
      width: 320 - SPACE.s5 * 2, height: 40,
      dir: 'HORIZONTAL',
      padTop: 10, padBottom: 10,
      fill: solid(COLOR.modalBtn),
      cornerRadius: RADIUS.lg,
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      layoutAlign: 'STRETCH',
    });
    const btnLabel = makeText('확인', {
      size: FS.fs15, weight: FW_SEMIBOLD,
      color: solid(COLOR.white),
      align: 'CENTER',
      lineHeightPct: 150,
      autoResize: 'WIDTH_AND_HEIGHT',
    });
    btn.appendChild(btnLabel);
    applySizing(btn, 'FIXED', 'FIXED');

    modal.appendChild(icon);
    modal.appendChild(msg);
    modal.appendChild(btn);

    applySizing(modal, 'AUTO', 'FIXED');

    modal.x = (LAYOUT.mobileLg - 320) / 2;
    f.appendChild(modal);
    modal.y = (LAYOUT.mobileH - modal.height) / 2;
    return f;
  }
  function buildF7(): FrameNode { return buildResponseModal('F7 ResponseModal success', true); }
  function buildF8(): FrameNode { return buildResponseModal('F8 ResponseModal error',   false); }

  // ── F9: Suspense loading ────────────────────────────────────
  // 출처: MobileLayout.jsx <Suspense fallback=<div .loading>로딩중...</div>>
  //   .loading: flex-center / min-height 100dvh / font 13 / color text-secondary
  function buildF9(): FrameNode {
    const f = makeFrame({
      name: 'F9 Suspense loading',
      width: LAYOUT.mobileLg,
      height: LAYOUT.mobileH,
      dir: 'VERTICAL',
      itemSpacing: 0,
      fill: solid(COLOR.bgDeepest),
    });

    const topbar = buildTopBarHome(false);
    topbar.layoutAlign = 'STRETCH';
    f.appendChild(topbar);

    const pageContent = makeFrame({
      name: '.pageContent (loading)',
      width: LAYOUT.mobileLg,
      height: LAYOUT.mobileH - LAYOUT.topbarHeight,
      dir: 'VERTICAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      layoutAlign: 'STRETCH',
      layoutGrow: 1,
    });
    const loading = makeText('로딩중...', {
      size: FS.fs13, weight: FW_REGULAR,
      color: solidA(ALPHA.textSecondary),
      align: 'CENTER',
      lineHeightPct: 150,
      autoResize: 'WIDTH_AND_HEIGHT',
    });
    loading.name = '.loading';
    pageContent.appendChild(loading);
    applySizing(pageContent, 'FIXED', 'FIXED');
    f.appendChild(pageContent);

    applySizing(f, 'FIXED', 'FIXED');
    return f;
  }

  // ── F10: AuthProvider blank ─────────────────────────────────
  // feature-spec § 7-2 미정 — placeholder.
  function buildF10(): FrameNode {
    const f = makeFrame({
      name: 'F10 AuthProvider blank ❓',
      width: LAYOUT.mobileLg,
      height: LAYOUT.mobileH,
      dir: 'VERTICAL',
      itemSpacing: 0,
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      fill: solid(COLOR.bgDeepest),
    });
    const note = makeText('❓ AuthProvider blank UX 미정\n(feature-spec § 7-2)', {
      size: FS.fs13, weight: FW_REGULAR,
      color: solidA(ALPHA.textMuted),
      align: 'CENTER',
      lineHeightPct: 150,
      autoResize: 'HEIGHT',
      fixedWidth: 280,
    });
    note.name = '.placeholder';
    f.appendChild(note);
    applySizing(f, 'FIXED', 'FIXED');
    return f;
  }

  // ── entry ───────────────────────────────────────────────────
  // 폰트 로드는 entry code.ts 에서 일괄 처리 (Helpers.loadFonts).
  export async function run(): Promise<void> {
    await Helpers.loadFonts();

    const builders: Array<() => FrameNode> = [
      buildF1,  buildF2,  buildF3,
      buildF4,  buildF5,  buildF6,
      buildF7,  buildF8,  buildF9,
      buildF10,
    ];

    // 4 행 × 3 열 격자 — 480 col / 1000 row
    const colGap = 480;
    const rowGap = 1000;
    const created: FrameNode[] = [];
    for (let i = 0; i < builders.length; i++) {
      const node = builders[i]();
      const row = Math.floor(i / 3);
      const col = i % 3;
      node.x = col * colGap;
      node.y = row * rowGap;
      figma.currentPage.appendChild(node);
      created.push(node);
    }

    figma.viewport.scrollAndZoomIntoView(created);
    figma.notify(`AppLayout ${created.length} frame 생성 완료 (Option A 마이그)`);
  }
}
