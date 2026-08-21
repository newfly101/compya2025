// ============================================================
// figma-plugin/shared/helpers.ts
// 공통 헬퍼 — color / frame / text / sizing / fonts
// docs/global-guide/design/figma-plugin-rules.md §11 의 5 PHASE 표준 시퀀스 준수
// ============================================================

namespace Helpers {
  // ── color ──────────────────────────────────────────────────
  export function hexToRgb(hex: string): RGB {
    const v = hex.replace('#', '');
    const r = parseInt(v.substring(0, 2), 16) / 255;
    const g = parseInt(v.substring(2, 4), 16) / 255;
    const b = parseInt(v.substring(4, 6), 16) / 255;
    return { r, g, b };
  }

  export function solid(hex: string): SolidPaint {
    return { type: 'SOLID', color: hexToRgb(hex) };
  }

  export function solidA(rgba: { r: number; g: number; b: number; a: number }): SolidPaint {
    return { type: 'SOLID', color: { r: rgba.r, g: rgba.g, b: rgba.b }, opacity: rgba.a };
  }

  // ── fonts ──────────────────────────────────────────────────
  // 룰 4: 모든 텍스트 노드는 PHASE 0 에서 폰트 await 완료된 상태에서만 생성
  export async function loadFonts(): Promise<void> {
    await figma.loadFontAsync({ family: Tokens.FONT_FAMILY, style: Tokens.FW_REGULAR });
    await figma.loadFontAsync({ family: Tokens.FONT_FAMILY, style: Tokens.FW_SEMIBOLD });
    await figma.loadFontAsync({ family: Tokens.FONT_FAMILY, style: Tokens.FW_BOLD });
  }

  // ── text ───────────────────────────────────────────────────
  export interface TextOpts {
    size: number;
    weight: Tokens.Weight;
    color: SolidPaint;
    align?: 'LEFT' | 'CENTER' | 'RIGHT';
    lineHeightPct?: number;
    letterSpacingPct?: number; // DESIGN.md 자간(em) → percent 환산해서 넘긴다 (0.04em = 4)
    // 룰 6: append 전 child sizing 완료 — textAutoResize 명시
    autoResize?: 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'NONE';
    fixedWidth?: number;     // autoResize='HEIGHT' 시 width 고정
    layoutAlign?: 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';
    layoutGrow?: number;     // text node 도 layoutGrow 1 적용 가능 (flex:1 효과)
  }

  // 텍스트 노드 1개 생성 — PHASE 3 의 child 사전 준비
  export function makeText(content: string, opts: TextOpts): TextNode {
    const t = figma.createText();
    t.fontName = { family: Tokens.FONT_FAMILY, style: opts.weight };
    t.fontSize = opts.size;
    t.characters = content;
    t.fills = [opts.color];
    if (opts.align) t.textAlignHorizontal = opts.align;
    if (opts.lineHeightPct !== undefined) {
      t.lineHeight = { unit: 'PERCENT', value: opts.lineHeightPct };
    }
    if (opts.letterSpacingPct !== undefined) {
      t.letterSpacing = { unit: 'PERCENT', value: opts.letterSpacingPct };
    }
    // 룰 6: textAutoResize 명시 (default 회피)
    const autoResize = opts.autoResize ?? 'WIDTH_AND_HEIGHT';
    t.textAutoResize = autoResize;
    if (autoResize === 'HEIGHT' && opts.fixedWidth !== undefined) {
      t.resize(opts.fixedWidth, t.height);
    }
    if (opts.layoutAlign) t.layoutAlign = opts.layoutAlign;
    if (opts.layoutGrow !== undefined) t.layoutGrow = opts.layoutGrow;
    return t;
  }

  // 인스턴스 내부에 이미 존재하는 TEXT 노드의 글자만 안전하게 덮어쓴다.
  // (인스턴스 자식은 remove/append 가 금지라 makeText 로 새로 만들 수 없다 — 이 경로만 허용된다.)
  // characters 대입 전에 그 노드가 실제로 쓰는 폰트를 반드시 로드해야 한다 — 세션에서
  // 아직 안 불러온 폰트로 대입하면 그 자리에서 throw 한다. fontName 이 figma.mixed(구간마다
  // 폰트가 섞인 경우)이면 전체 글자 구간을 훑어 등장하는 폰트를 전부 로드한다.
  export async function setText(node: TextNode, content: string): Promise<void> {
    if (node.fontName === figma.mixed) {
      const len = node.characters.length;
      const loadedKeys = new Set<string>();
      for (let i = 0; i < len; i += 1) {
        const rangeFont = node.getRangeFontName(i, i + 1) as FontName;
        const key = `${rangeFont.family}::${rangeFont.style}`;
        if (!loadedKeys.has(key)) {
          loadedKeys.add(key);
          await figma.loadFontAsync(rangeFont);
        }
      }
    } else {
      await figma.loadFontAsync(node.fontName as FontName);
    }
    node.characters = content;
  }

  // ── frame ──────────────────────────────────────────────────
  // frame 1개 — PHASE 1 + PHASE 2 합본. children/PHASE 4 는 호출자 책임.
  export interface FrameOpts {
    name: string;
    width: number;
    height: number;          // 룰 3: createFrame 직후 최소 height ≥ 1
    dir: 'HORIZONTAL' | 'VERTICAL';
    itemSpacing?: number;
    padTop?: number;
    padBottom?: number;
    padLeft?: number;
    padRight?: number;
    fill?: SolidPaint;
    cornerRadius?: number;
    stroke?: SolidPaint;
    strokeWeight?: number;
    strokeBottomWeight?: number;
    primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
    counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
    layoutAlign?: 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';
    layoutGrow?: number;
    effects?: ReadonlyArray<Effect>;
  }

  export function makeFrame(opts: FrameOpts): FrameNode {
    // PHASE 1: createFrame + 즉시 최소 size (룰 3 — height 0 방지)
    const f = figma.createFrame();
    f.name = opts.name;
    f.resize(Math.max(1, opts.width), Math.max(1, opts.height));

    // PHASE 2: layoutMode + spacing + padding + fills
    f.layoutMode = opts.dir;
    f.itemSpacing = opts.itemSpacing ?? 0;
    f.paddingTop = opts.padTop ?? 0;
    f.paddingBottom = opts.padBottom ?? 0;
    f.paddingLeft = opts.padLeft ?? 0;
    f.paddingRight = opts.padRight ?? 0;
    f.fills = opts.fill ? [opts.fill] : [];
    if (opts.cornerRadius !== undefined) f.cornerRadius = opts.cornerRadius;
    if (opts.stroke) {
      f.strokes = [opts.stroke];
      f.strokeAlign = 'INSIDE';
      if (opts.strokeBottomWeight !== undefined) {
        f.strokeTopWeight = 0;
        f.strokeRightWeight = 0;
        f.strokeLeftWeight = 0;
        f.strokeBottomWeight = opts.strokeBottomWeight;
      } else if (opts.strokeWeight !== undefined) {
        f.strokeWeight = opts.strokeWeight;
      } else {
        f.strokeWeight = 1;
      }
    }
    if (opts.primaryAxisAlignItems) f.primaryAxisAlignItems = opts.primaryAxisAlignItems;
    if (opts.counterAxisAlignItems) f.counterAxisAlignItems = opts.counterAxisAlignItems;
    if (opts.layoutAlign) f.layoutAlign = opts.layoutAlign;
    if (opts.layoutGrow !== undefined) f.layoutGrow = opts.layoutGrow;
    if (opts.effects) f.effects = opts.effects;
    return f;
  }

  // ── sizing ─────────────────────────────────────────────────
  // PHASE 4: children append 완료 후에만 호출 (룰 1, 2)
  // FrameNode / ComponentNode 모두 동일한 Auto Layout sizing API 를 공유한다.
  export function applySizing(
    f: FrameNode | ComponentNode,
    primary: 'AUTO' | 'FIXED',
    counter: 'AUTO' | 'FIXED',
  ): void {
    // 룰 1: HUG (AUTO) 는 children >0 일 때만
    if (primary === 'AUTO' && f.children.length === 0) {
      f.primaryAxisSizingMode = 'FIXED';
    } else {
      f.primaryAxisSizingMode = primary;
    }
    if (counter === 'AUTO' && f.children.length === 0) {
      f.counterAxisSizingMode = 'FIXED';
    } else {
      f.counterAxisSizingMode = counter;
    }
  }

  // ── component (2026-08-20 admin-components 승격 작업 추가) ──────
  // ComponentOpts 는 FrameOpts 와 옵션이 완전히 동일하다 (Auto Layout 절차 공유).
  export type ComponentOpts = FrameOpts;

  // Component 노드 1개 생성 — makeFrame 과 동일한 PHASE 1~2 절차, 대상만 createComponent().
  // children append + applySizing() 호출은 makeFrame 과 동일하게 호출자 책임 (PHASE 3~4).
  export function makeComponent(opts: ComponentOpts): ComponentNode {
    const c = figma.createComponent();
    c.name = opts.name;
    // PHASE 1: 즉시 최소 size (룰 3 — height 0 방지)
    c.resize(Math.max(1, opts.width), Math.max(1, opts.height));

    // PHASE 2: layoutMode + spacing + padding + fills
    c.layoutMode = opts.dir;
    c.itemSpacing = opts.itemSpacing ?? 0;
    c.paddingTop = opts.padTop ?? 0;
    c.paddingBottom = opts.padBottom ?? 0;
    c.paddingLeft = opts.padLeft ?? 0;
    c.paddingRight = opts.padRight ?? 0;
    c.fills = opts.fill ? [opts.fill] : [];
    if (opts.cornerRadius !== undefined) c.cornerRadius = opts.cornerRadius;
    if (opts.stroke) {
      c.strokes = [opts.stroke];
      c.strokeAlign = 'INSIDE';
      if (opts.strokeBottomWeight !== undefined) {
        c.strokeTopWeight = 0;
        c.strokeRightWeight = 0;
        c.strokeLeftWeight = 0;
        c.strokeBottomWeight = opts.strokeBottomWeight;
      } else if (opts.strokeWeight !== undefined) {
        c.strokeWeight = opts.strokeWeight;
      } else {
        c.strokeWeight = 1;
      }
    }
    if (opts.primaryAxisAlignItems) c.primaryAxisAlignItems = opts.primaryAxisAlignItems;
    if (opts.counterAxisAlignItems) c.counterAxisAlignItems = opts.counterAxisAlignItems;
    if (opts.layoutAlign) c.layoutAlign = opts.layoutAlign;
    if (opts.layoutGrow !== undefined) c.layoutGrow = opts.layoutGrow;
    if (opts.effects) c.effects = opts.effects;
    return c;
  }

  // 여러 ComponentNode 를 ComponentSet(variant 그룹)으로 묶는다.
  // combineAsVariants 는 노드들을 combine 시점에 지정한 parent 아래로 옮기므로,
  // 호출 전 각 노드의 x/y 를 원하는 grid 위치로 미리 잡아 둘 것 — 그 상대 배치가
  // 만들어진 ComponentSetNode 안 variant 격자 배치 그대로 보존된다.
  export function combineVariants(
    components: ReadonlyArray<ComponentNode>,
    setName: string,
    parent?: BaseNode & ChildrenMixin,
  ): ComponentSetNode {
    const target = parent ?? figma.currentPage;
    const set = figma.combineAsVariants(components, target);
    set.name = setName;
    return set;
  }

  // 이름으로 Component 를 찾는다 (2단계 — 화면 조립 agent 가 인스턴스 생성 전 사용).
  // ComponentSet 안의 특정 variant 를 지정하려면 Figma variant 표준 이름
  // ("variant=primary, size=md, state=default" 형식)을 그대로 name 에 넘긴다.
  // 이름이 COMPONENT_SET(variant 그룹) 자체와 일치하면 defaultVariant 로 대체한다 —
  // 호출부가 findSet() 으로 미리 범위를 좁히지 않고 이름만 넘기는 경로도 방어.
  export function findComponent(
    name: string,
    root?: BaseNode & ChildrenMixin,
  ): ComponentNode | null {
    const scope: BaseNode & ChildrenMixin = root ?? figma.currentPage;
    const direct = scope.findOne((n) => n.type === 'COMPONENT' && n.name === name);
    if (direct) return direct as ComponentNode;
    const set = scope.findOne((n) => n.type === 'COMPONENT_SET' && n.name === name);
    if (set) return (set as ComponentSetNode).defaultVariant;
    return null;
  }

  // createInstance / inst() 가 정상 경로에서 돌려주는 값과, 컴포넌트를 못 찾았을 때
  // 대신 돌려주는 자리표시 FrameNode 를 통일해서 다루기 위한 타입.
  // 호출부가 쓰는 API(layoutMode/layoutAlign/fills/findOne/findAll/appendChild 등)는
  // 전부 BaseFrameMixin 공통이라 InstanceNode 자리에 FrameNode 가 와도 그대로 동작한다.
  export type Instantiable = InstanceNode | FrameNode;

  // 이름을 못 찾았을 때 눈에 띄는 대체 표시. 실제 컴포넌트 인스턴스가 아니라
  // 재실행 정리(cleanupByName) 대상에도 안 걸리도록 이름에 원래 찾던 이름을 그대로 담는다.
  function makePlaceholder(name: string): FrameNode {
    const f = figma.createFrame();
    f.name = `⚠ MISSING: ${name}`;
    f.resize(140, 40);
    f.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 0.15 }];
    f.strokes = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
    f.strokeWeight = 2;
    f.layoutMode = 'HORIZONTAL';
    f.primaryAxisAlignItems = 'CENTER';
    f.counterAxisAlignItems = 'CENTER';
    f.primaryAxisSizingMode = 'FIXED';
    f.counterAxisSizingMode = 'FIXED';
    return f;
  }

  // 컴포넌트 이름으로 인스턴스 1개 생성. 못 찾아도 throw 로 전체 실행을 죽이지 않는다 —
  // console.error 로 어떤 이름을 못 찾았는지 남기고, 나머지가 계속 그려지도록 빨간 테두리
  // 자리표시 프레임을 대신 반환한다. 호출한 화면/카드 1개만 어색해 보이고 끝난다.
  export function createInstance(
    name: string,
    root?: BaseNode & ChildrenMixin,
  ): Instantiable {
    const comp = findComponent(name, root);
    if (!comp) {
      console.error(
        `[Helpers.createInstance] component not found: "${name}"` +
          ` (root: ${root ? root.name : 'currentPage'})`,
      );
      return makePlaceholder(name);
    }
    return comp.createInstance();
  }

  // 재실행 정리 — 이름이 같은 "현재 페이지 직계 자식" 노드를 지운다.
  // 컴포넌트 승격 섹션 프레임처럼 최상위 컨테이너 이름을 넘기면, 재실행 시 그 섹션
  // 전체를 지우고 새로 만들 수 있어 동명 컴포넌트가 중복 생성되지 않는다.
  // 페이지 "직계 자식"만 검사하므로 admin 화면 7장·DS v3.0 등 다른 하위 트리는 건드리지 않는다.
  export function cleanupByName(names: ReadonlyArray<string>): void {
    const targets = figma.currentPage.findChildren((n) => names.indexOf(n.name) !== -1);
    targets.forEach((n) => n.remove());
  }

  // 재실행 정리 — cleanupByName 으로 못 잡는 실패 잔재까지 지운다. 대상은 "페이지 직계 자식"만:
  // 1) 이름이 namePrefixes 중 하나로 시작하는 프레임 (예: 실패한 화면 조립이 남긴 미완성 프레임)
  // 2) 타입이 INSTANCE 인 노드 전부 (부모에 붙지 못하고 페이지 루트에 뜬 고아 인스턴스)
  // ⛔ COMPONENT / COMPONENT_SET 은 절대 대상이 아니다 — type 조건이 'INSTANCE' 로 고정돼 있어
  //    컴포넌트 승격 섹션(admin-components.ts)의 진짜 부품은 이 함수로 지워지지 않는다.
  export function cleanupOrphans(namePrefixes: ReadonlyArray<string>): void {
    const targets = figma.currentPage.findChildren((n) => {
      if (n.type === 'INSTANCE') return true;
      return namePrefixes.some((p) => n.name.indexOf(p) === 0);
    });
    targets.forEach((n) => n.remove());
  }

  // ABSOLUTE 배치를 시도하되, 부모가 auto layout(layoutMode !== 'NONE')이 아니면
  // "Can only set layoutPositioning to ABSOLUTE if the parent node has layoutMode != NONE"
  // 런타임 에러를 내는 대신 조용히 x/y 직접 배치로 폴백한다.
  // 반드시 node 가 이미 최종 부모에 appendChild 된 "뒤"에 호출할 것 — 그래야 node.parent 가
  // 실제 부모를 가리킨다(생성 직후 노드의 parent 는 잠시 currentPage 다).
  export function placeAbsolute(node: SceneNode, x: number, y: number): void {
    const parent = node.parent as (BaseNode & { layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL' }) | null;
    const parentIsAutoLayout = !!parent && 'layoutMode' in parent && parent.layoutMode !== 'NONE' && parent.layoutMode !== undefined;
    if (parentIsAutoLayout && 'layoutPositioning' in node) {
      (node as SceneNode & LayoutMixin).layoutPositioning = 'ABSOLUTE';
    }
    node.x = x;
    node.y = y;
  }
}
