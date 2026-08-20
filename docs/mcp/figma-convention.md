# Figma MCP 작업 규칙

> 기준일 2026-08-21 · 출처: `docs/global-guide/design/figma-mcp-rules.md`, `docs/global-guide/design/figma-plugin-rules.md`, `docs/global-guide/design/figma-token-drift.md`

---

## 1. 언제 이 문서를 보나

Figma 에서 화면·컴포넌트를 읽거나(리서치, 스펙 확인), 새로 그리거나 고칠 때 본다.
디자인 토큰(색·간격·타이포)이 코드와 다를 때 어떻게 처리할지도 여기서 확인한다.
Figma 작업을 시작하기 전에는 이 문서를 먼저 읽고, 그다음 스킬을 로드한다.

---

## 2. 기본 원칙

| 항목 | 내용 |
|---|---|
| 방식 | Claude 가 **Figma MCP 로 직접** 파일에 쓴다. 사용자 수작업 없음 |
| 대상 파일 | `VCVQzOpSIpwpZw11gxG7N1` (컴프야펀) |
| 작업 페이지 | `0:1` 컴프야펀 모바일 (68 노드) |
| 계정 | newfly101 / Pro / Full seat — write 권한 있음 |
| 화면 모드 | 모바일 우선 단일 모드. 태블릿·PC 도 모바일 형태로 보여준다 (반응형 분기 없음) |

**작업 전 반드시 할 일** — Figma 스킬은 로컬이 아니라 MCP 서버가 제공한다. 매 세션 `get_figma_skill` 로 읽어야 한다. 스킬 없이 `use_figma` 를 호출하면 디버그하기 어려운 실패가 난다.

| 하려는 일 | 먼저 읽을 스킬 | 쓸 도구 |
|---|---|---|
| 무엇이든 Figma 에 쓰기 (필수 기본) | `skill://figma/figma-use/SKILL.md` | `use_figma` |
| 화면·페이지·모달 만들기 | 위 + `figma-generate-design` | `use_figma` |
| 토큰·컴포넌트 라이브러리 구축 | 위 + `figma-generate-library` | `use_figma` |
| Figma → React 코드 구현 | `figma-design-to-code` | `get_design_context` |
| 컴포넌트 ↔ 코드 매핑 | `figma-code-connect` | `add_code_connect_map` |
| 새 파일 생성 | `figma-create-new-file` | `create_new_file` |
| 다이어그램 | `figma-generate-diagram` | `generate_diagram` |

---

## 3. 읽기 작업

Figma 에서 현재 상태를 파악할 때 아래 순서로 쓴다.

1. `get_metadata` — 페이지/노드 전체 트리, 좌표, 사이즈 확인 (전체 지도 파악용)
2. `search_design_system` — 그리려는 것과 비슷한 기존 컴포넌트가 있는지 먼저 검색
3. `get_design_context` — 특정 노드의 스타일·바인딩된 토큰 변수까지 상세 확인
4. `get_variable_defs` — 색·간격·타이포가 Variable 에 바인딩됐는지 확인
5. `get_screenshot` — 시각적으로 눈으로 확인

읽기만으로 끝나는 작업(스펙 확인, 코드 구현용 조사)은 스킬 로드 없이도 가능하다. **쓰기가 들어가는 순간부터 § 2 의 스킬 로드가 필수**다.

---

## 4. 쓰기 작업

### 4.1 절차

1. `get_figma_skill` 로 목적에 맞는 스킬 로드 (§ 2 표)
2. `use_figma` 로 직접 조작 — 그리기/수정 모두 이 도구 하나로 처리
3. 아래 재사용 강제 룰 준수
4. 완료 후 `get_screenshot` 으로 **되읽어 자가 검수**하고 어긋나면 바로 고친다

### 4.2 재사용 강제 룰

| # | 룰 |
|---|---|
| 1 | 색·간격·타이포는 **Figma Variable 에 바인딩**. 생값(raw hex) 금지 |
| 2 | 토큰 이름은 `web/src` 의 2단 구조를 따른다 — `variables/` 원시값 → `semantic/_color.scss` 의 `--color-*` |
| 3 | 이미 있는 컴포넌트는 `search_design_system` 으로 찾아 **인스턴스로 배치**. 새로 그리지 않는다 |
| 4 | 반복되는 UI 는 컴포넌트로 만들고 **variant** 로 상태(hover/disabled/error 등)를 표현 |
| 5 | 레이아웃은 **auto layout**. 절대 좌표 배치 금지 |
| 6 | 완성 후 `get_screenshot` 자가 검수 필수 |

### 4.3 산출물 위치

| 산출물 | 위치 |
|---|---|
| 디자인 분석·검수 문서 | `docs/domain/{feature}/design/*.md` |
| 디자인 → 구현 핸드오프 | `docs/domain/{feature}/design/implementation-handoff.md` |
| Code Connect 파일 | 해당 컴포넌트 옆 `*.figma.jsx` |

---

## 5. 디자인 토큰 규칙

### 5.1 토큰 이름 체계 (2026-08-20 구축)

| 컬렉션 | 개수 | 내용 |
|---|---|---|
| `Primitives` | 31 | raw 색상. 모든 피커에서 숨김(`scopes: []`) — **직접 쓰지 말 것** |
| `Color` | 28 | semantic. 전부 Primitives 를 alias. code syntax = `var(--color-*)` |
| `Spacing` | 20 | `spacing/*` `layout/*` `control/*` |
| `Radius` | 8 | `radius/none` ~ `radius/full` |
| `Typography` | 20 | size·weight·line-height·letter-spacing·family |

텍스트 스타일 9종(`text/hero` ~ `text/badge`)도 존재하며 `fontSize` 가 변수에 바인딩돼 있다.

⚠️ **단위 주의** — Figma 는 line-height / letter-spacing 이 **% 단위**다. CSS 무단위 배수 `1.5` → `150`, `-0.02em` → `-2` 로 변환해야 한다.

컴포넌트 10 세트(222 노드)는 이미 변수 바인딩 완료 — 커버리지 94% (색·스트로크·폰트는 100%). Code Connect 매핑(Figma ↔ `web/src`)은 아직 없다.

### 5.2 코드와 어긋났을 때 (드리프트) 처리

2026-08-20 전 화면(3,640 노드) 실측 기준, 코드 토큰에 대응이 없어 하드코딩으로 남은 값들이 있다. **임의로 옮기면 시각이 바뀌므로 발견해도 마음대로 고치지 않는다.**

| 종류 | 코드 토큰 | 어긋난 값 예시 |
|---|---|---|
| 간격 | `$space-1`(4)부터 8pt 그리드 | `padding 6`(440+건), `10`(110+건), `3`(150+건) 등 800건 이상 |
| 글자 크기 | 9·10·11·12·13·15·17·22·28 (9단계) | `14`(180건), `16`(37건), `8`(50건) |
| 모서리 | 0·2·4·6·8·10·12·9999 | `1·3·5·9·11·14` (각 6~34건) |
| 색 | 코드 알파 5단계(0.92/0.60/0.38/0.12/0.06) | Figma 는 13단계. `#272033`(149건), `#666685`(68건) 등 |

**처리 원칙**:
1. 발견해도 **그 화면을 직접 손대는 시점에만** 정리한다 (한 번에 전체 마이그레이션 X)
2. 처리 방향은 3가지 중 선택 — **가. 흡수(가장 가까운 토큰으로 옮김, 권고)** / 나. 토큰 추가 / 다. 유지(하드코딩)
3. **어느 방향으로 갈지는 사용자 결정 사안이다. 임의 실행 금지** — 발견 시 표로 보고만 한다
4. 토큰 자체 정의(`Tokens`/`Primitives`/`Color` 등 namespace) 변경은 항상 HITL

---

## 6. 모바일 우선 규칙

| 항목 | 값 |
|---|---|
| 화면 모드 | 모바일 우선 단일 모드. 미디어 쿼리로 PC/모바일 나누지 않는다 |
| 태블릿/PC | 모바일 레이아웃 그대로, 좌우 여백만 생김 |
| 글로벌 wrapper | 코드 기준 `MobileLayout` max-width 480 (PC/tablet 좌우 여백 담당) |
| Admin 화면 | 480px 고정 (16화면 전부) |

과거(2026-05-11) 기준으로는 `applayout` 영역(TopBar/Drawer/Modal)이 428px, `home` 도메인 컨텐츠 영역이 375px 로 분리돼 있었다. 현재 진리 페이지가 `0:1` 로 옮겨오면서 이 폭 구분이 그대로 유지되는지는 **재확인이 필요**하다 — 새로 그리거나 검수할 때는 추정하지 말고 `get_metadata` 로 실제 프레임 폭을 먼저 읽는다.

---

## 7. 하지 말 것

- ❌ 스킬 로드 없이 `use_figma` 호출
- ❌ 생값 하드코딩 (색·간격) — Variable 바인딩 필수
- ❌ 절대 좌표 배치 — auto layout 사용
- ❌ 그리고 나서 검수 생략 — `get_screenshot` 되읽기 필수
- ❌ 기존 컴포넌트 무시하고 중복 생성
- ❌ 토큰 드리프트를 발견 즉시 임의로 흡수/변경 (사용자 결정 없이)
- ❌ `figma-plugin/` 에 새 코드 작성 — 폐기된 방식 (§ 8)

---

## 8. 폐기된 방식

과거에는 `figma-plugin/code.ts` + `domains/*.ts` 에 Figma Plugin API 코드를 작성하고, 사용자가 `npm run watch` 로 빌드한 뒤 Figma 안에서 직접 플러그인을 실행(`Ctrl+Alt+P`)하는 방식이었다. 2026-08-20 폐기.

**폐기 사유**: ① agent 가 결과를 볼 수 없어 자가 수정이 불가능했다 ② Variables 바인딩을 지원하지 않았다(`setBoundVariable` 미사용) ③ Figma ↔ 코드 매핑이 불가능했다 ④ 매번 사용자 수작업이 필요했다.

`figma-plugin/` 코드 자체는 삭제하지 않고 참조용으로 남아 있지만, **재실행하지 않는다**. 새로 그릴 때 화면 구조를 참고하는 용도로만 열어본다.
