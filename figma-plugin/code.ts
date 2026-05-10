// task: frame 212:3 배경 파란색 적용
// generated-at: 2026-05-11
// by: designer agent
// Run: Ctrl+Alt+P in Figma desktop app (after npm run watch / build 컴파일됨)
//
// 대상 URL: https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/...?node-id=212-3
// node-id URL 형식: 212-3 → API 형식: 212:3

(async () => {
  const NODE_ID = '212:3';
  const BLUE: SolidPaint = {
    type: 'SOLID',
    color: { r: 0 / 255, g: 23 / 255, b: 23 / 255 }, // #3B82F6 (Tailwind blue-500)
  };

  const node = await figma.getNodeByIdAsync(NODE_ID);
  if (!node) {
    figma.notify(`node ${NODE_ID} not found`, { error: true });
    return;
  }
  if (!('fills' in node)) {
    figma.notify(`node type ${node.type} 은 fills 속성 없음`, { error: true });
    return;
  }

  (node as FrameNode).fills = [BLUE];
  figma.notify(`✅ ${node.name} 배경 #3B82F6 적용`);
  figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
})();
