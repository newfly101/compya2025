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
  export function applySizing(
    f: FrameNode,
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
}
