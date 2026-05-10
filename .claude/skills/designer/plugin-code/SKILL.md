---
name: designer-plugin-code
description: design-analysis.md 토대로 figma-plugin/code.ts 통째 덮어쓰기 + tsc 빌드 + 사용자 액션 안내. Figma 에 디자인을 직접 그리거나 수정하는 plugin code 를 생성. 산출물 figma-plugin/code.ts (+ code.js 자동 생성) + docs/domain/{name}/design/design-report.md + implementation-handoff.md.
---

# Skill: designer-plugin-code

`designer-analyze` 의 결과(`design-analysis.md`) 토대로 **Figma Plugin TypeScript 코드** 를 작성해 `figma-plugin/code.ts` 에 통째 덮어쓰고, `tsc` 빌드까지 수행한다. 이후 사용자에게 단축키 1회 안내. 적용 후 `mcp__figma-dev-mode__get_screenshot` 으로 검증 + design-report / implementation-handoff 작성.

## 1. 목적

- 분석 결과 토대로 Figma 변경/생성을 자동화하는 plugin code 생성
- code.ts 매번 통째 덮어쓰기 (이전 작업은 git history 로 복구)
- npm run build 로 code.js 자동 생성 (사용자 watch 모드면 skip)
- 사용자가 Figma 에서 `Ctrl+Alt+P` 1회로 적용
- 적용 결과 검증 (screenshot)
- design-report.md (디자이너 → 사용자/기획자) + implementation-handoff.md (디자이너 → 주니어 개발자) 작성

**산출물**:
- `figma-plugin/code.ts` (단일 파일 덮어쓰기)
- `figma-plugin/code.js` (tsc 빌드 결과 — 자동 생성)
- `docs/domain/{name}/design/design-report.md`
- `docs/domain/{name}/design/implementation-handoff.md`

## 2. 입력 (input)

### 필수
- `design-analysis.md` 경로 (`docs/domain/{name}/design/design-analysis.md`)
- 작업 단위 이름 (`{name}`)
- 작업 모드 (create / update)

### 선택
- 사용자 명시 변경 사양 (예: "frame 212:3 배경 #3B82F6 적용")
- 기존 Figma URL (이미 design-analysis 에 있다면 skip)

### 호출 args 예시
```
name: coupons-admin, mode: create, analysis: docs/domain/coupons-admin/design/design-analysis.md
name: bg-color-change, mode: update, target-node: 212:3, change: "fill #3B82F6"
```

## 3. 절차 (steps)

### Step 1 — 입력 확인
- `name`, `mode` 필수. 누락 시 사용자 질문 후 중단
- `analysis` 경로 있으면 우선 read. 없으면 사용자 명시 변경 사양만으로 진행

### Step 2 — design-analysis.md 읽기 (있다면)

- 재사용 / 신규 정의 항목 식별
- HITL 4 분야 (🔴) 항목 식별

### Step 3 — HITL 검증

🔴 항목 있으면 → **stop & 사용자 답변 대기**. design-analysis 에 정리된 위험 항목이 답변 받기 전 진행되지 않도록 차단.

🟨 / ❓ 만 있으면 → 진행.

### Step 4 — code.ts 통째 덮어쓰기

`figma-plugin/code.ts` 에 다음 컨벤션으로 Write:

```typescript
// task: {feature 또는 작업명}
// generated-at: YYYY-MM-DD
// by: designer-plugin-code skill
// Run: Ctrl+Alt+P in Figma desktop app (after npm run watch / build 컴파일됨)
//
// (작업 컨텍스트 주석 — 어떤 frame / 어떤 변경 / 사용자 의도)

(async () => {
  // 1. 폰트 로드 (사용 폰트만)
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  // ...

  // 2. (필요 시) 기존 frame read
  // const node = await figma.getNodeByIdAsync('NNN:NN');

  // 3. 신규 frame / 컴포넌트 생성 또는 기존 update
  // ...

  // 4. focus + notify
  figma.viewport.scrollAndZoomIntoView([...]);
  figma.notify('✅ {작업명} 완료');
})();
```

⭐ **단일 code.ts 매번 덮어쓰기**. 기존 코드 보존하지 말 것.

⭐ **node-id URL 형식 변환**: URL 의 `212-3` → API 의 `212:3` (대시 → 콜론)

⭐ **TypeScript strict 모드** 가 켜져있음 (`tsconfig.json`). 타입 명시 필수:
- `SolidPaint` / `FrameNode` / `SceneNode` 등 명시
- `(node as FrameNode).fills = [...]` cast 필요
- `'fills' in node` type guard

⭐ **dynamic-page documentAccess** 모드 (`manifest.json`):
- `figma.getNodeByIdAsync()` 사용 (sync 버전 deprecated)
- `figma.loadAllPagesAsync()` 필요 시 호출
- `figma.setCurrentPageAsync()` (sync 버전 deprecated)

### Step 5 — 빌드 (Bash)

사용자 watch 모드 안 띄웠으면 한 번 빌드:

```bash
cd figma-plugin && npm run build
```

watch 모드 띄웠으면 skip (자동 컴파일됨). 사용자 watch 여부 모르면 일단 한 번 빌드 (idempotent — 이미 컴파일된 거면 즉시 종료).

빌드 실패 시 stop & 첫 에러만 보고. cascading 수정 시도 금지 — 사용자에게 에러 라인 + 원인 안내.

### Step 6 — 사용자 액션 안내

빌드 성공 후 사용자에게 명시적으로:

```
✅ figma-plugin/code.ts 작성 + 빌드 완료
👉 Figma desktop app 에서 Ctrl+Alt+P (Run Last Plugin) 1회 클릭

(plugin 미등록 시: Plugins → Development → Import plugin from manifest → figma-plugin/manifest.json 1회 setup)
```

### Step 7 — 적용 결과 검증 (사용자 실행 후)

사용자가 plugin 실행 후:

1. `mcp__figma-dev-mode__get_screenshot` — 변경된 frame 캡처
2. 의도된 변경이 적용됐는지 확인
3. (선택) `mcp__figma-dev-mode__get_design_context` — 토큰 / 노드 검증

검증 결과를 design-report.md 에 임베드.

### Step 8 — design-report.md / implementation-handoff.md Write

각 산출물 위치:
- `docs/domain/{name}/design/design-report.md`
- `docs/domain/{name}/design/implementation-handoff.md`

템플릿은 `.claude/agents/designer.md` 의 "산출물 형식" 섹션 참조.

### Step 9 — 다음 단계 안내

보고:
- code.ts 작성 라인 수
- 빌드 결과 (PASS/FAIL)
- 사용자 액션 안내 (Ctrl+Alt+P)
- 적용 후 검증 가능 여부
- 산출물 경로 (code.ts / design-report.md / implementation-handoff.md)

## 4. code.ts 패턴 라이브러리

자주 쓰는 Plugin API 패턴:

### 4.1 frame 배경 색상 변경
```typescript
const node = await figma.getNodeByIdAsync('212:3');
if (!node || !('fills' in node)) {
  figma.notify('node not found or no fills', { error: true });
  return;
}
const BLUE: SolidPaint = {
  type: 'SOLID',
  color: { r: 59 / 255, g: 130 / 255, b: 246 / 255 }, // #3B82F6
};
(node as FrameNode).fills = [BLUE];
```

### 4.2 신규 frame 생성 (auto-layout)
```typescript
const frame = figma.createFrame();
frame.name = 'AdminCouponList';
frame.resize(375, 812);
frame.layoutMode = 'VERTICAL';
frame.itemSpacing = 12;
frame.paddingLeft = frame.paddingRight = 16;
frame.paddingTop = frame.paddingBottom = 24;
frame.fills = [{ type: 'SOLID', color: { r: 0.10, g: 0.10, b: 0.12 } }]; // #1a1a1f
frame.cornerRadius = 0;
frame.x = 100;
frame.y = 100;
figma.currentPage.appendChild(frame);
```

### 4.3 텍스트 노드
```typescript
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
const title = figma.createText();
title.fontName = { family: 'Inter', style: 'Bold' };
title.fontSize = 18;
title.characters = '쿠폰 관리';
title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
frame.appendChild(title);
```

### 4.4 컴포넌트 인스턴스 추가 (기존 컴포넌트 재사용)
```typescript
const componentSet = await figma.getNodeByIdAsync('NNN:NN'); // Button COMPONENT_SET
if (componentSet?.type === 'COMPONENT_SET') {
  const variant = componentSet.children.find(
    c => c.name === 'variant=primary, size=md'
  ) as ComponentNode | undefined;
  if (variant) {
    const instance = variant.createInstance();
    instance.x = 16;
    instance.y = 600;
    frame.appendChild(instance);
  }
}
```

### 4.5 새 페이지 생성
```typescript
const page = figma.createPage();
page.name = '🎨 Style Guide';
await figma.setCurrentPageAsync(page);
```

### 4.6 hex → RGB 변환
```typescript
function hexToRgb(h: string): RGB {
  const v = h.replace('#', '');
  return {
    r: parseInt(v.slice(0, 2), 16) / 255,
    g: parseInt(v.slice(2, 4), 16) / 255,
    b: parseInt(v.slice(4, 6), 16) / 255,
  };
}
```

## 5. 검증 (산출물 완료 기준)

- [ ] `figma-plugin/code.ts` 통째 덮어쓰기 (헤더 주석 + async IIFE 패턴)
- [ ] TypeScript strict 모드 통과 (`tsc -p tsconfig.json` 빌드 성공)
- [ ] 빌드 결과 `figma-plugin/code.js` 생성 확인
- [ ] 사용자 액션 안내 (Ctrl+Alt+P) 명시
- [ ] (사용자 실행 후) screenshot 검증
- [ ] design-report.md / implementation-handoff.md Write

## 6. HITL (Human-in-the-Loop) 지점

### 강제 HITL (자동 진행 금지)

다음 항목은 사용자 답변 전 code.ts 적용 X (코드는 작성하지 말 것):
- 토큰 파괴적 변경 (예: 기존 `#a78bfa` 의 hex 값 변경)
- 기존 컴포넌트 variant 제거 / 컴포넌트 삭제
- 레이아웃 컨벤션 변경 (모바일 → 데스크탑 / TopBar 위치 등)
- 외부 자산 도입 (라이선스 불명확 이미지/폰트)

→ design-analysis.md 의 🔴 마커 항목은 본 skill 에서 자동 진행 금지.

### 완화 HITL (가정/미정 표시 후 진행)

- 신규 토큰 추가 (기존과 충돌 X)
- 기존 컴포넌트 variant 추가
- 화면 placeholder 콘텐츠
- icon 메타포 선택

### 마커

- 🟨 가정: default — code.ts 적용 OK
- ❓ 미정: 명시 후 진행 OK
- 🔴 위험: 사용자 답변 전 code.ts 적용 X

## 7. 다음 skill 추천

- 본 skill 이 designer 흐름의 마지막 단계.
- 후속 트랙: develop FE (`web/src/...`) — handoff 토대로 React 코드 작성

## 8. 예시

### 예시 1: 단순 frame 배경 색상 변경
```
입력: name: bg-blue, mode: update, target-node: 212:3, change: "fill #3B82F6"

→ HITL 4 분야 해당 X (단순 fill 변경, 토큰 변경 아님)
→ code.ts Write (figma.getNodeByIdAsync + fills 할당)
→ Bash: cd figma-plugin && npm run build → PASS
→ 사용자 안내: Ctrl+Alt+P
→ (실행 후) get_screenshot 으로 검증
→ design-report 짧게 (단일 변경)
→ handoff (코드 변경 없음 — Figma 만)
```

### 예시 2: 어드민 화면 신규 frame + 컴포넌트 생성
```
입력: name: coupons-admin, mode: create, analysis: docs/domain/coupons-admin/design/design-analysis.md

→ design-analysis.md read → 재사용/신규 항목 식별
→ HITL: 🔴 없음 → 진행
→ code.ts Write:
   - 폰트 로드 (Inter Bold/Regular)
   - 신규 페이지 "Admin / Coupons" 생성
   - AdminCouponList frame (375×812, VERTICAL auto-layout)
   - TopBar 인스턴스 (기존 컴포넌트 재사용)
   - FilterChipRow (가로 스크롤)
   - AdminCard × N (sample data)
   - FAB 우하단 fixed
   - viewport focus
→ Bash: 빌드 PASS
→ 사용자 안내: Ctrl+Alt+P
→ get_screenshot 검증
→ design-report (재사용/신규 분리, 마커, 적용 사항)
→ implementation-handoff (글로벌 컴포넌트 후보 / 토큰 매핑 / 화면 트리)
```

## 9. 작성 원칙

- **단일 code.ts 매번 덮어쓰기** — 이전 작업 보존 X
- **TypeScript 타입 명시** — strict 모드 통과 필수
- **async/await + getNodeByIdAsync** — dynamic-page 모드 정합
- **빌드 검증 필수** — 빌드 실패 시 stop, 추가 수정 시도 금지
- **사용자 액션 명시** — Ctrl+Alt+P 단축키 안내
- **검증 → 보고** — 사용자 실행 후 screenshot 으로 결과 확인
- **재사용 > 신규** — design-analysis 의 재사용 항목 우선 활용
