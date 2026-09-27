# Figma MCP 작업 룰 (designer-render · designer-review 가 brief 에서 Read)

> paths 없음 — 코드 경로에 묶이지 않는다. 자동 로드도 안 한다. designer agent dispatch 시 brief 에 명시.
> 출처: designer-render.md § 3 Phase 2 + responsive-mobile-first § 3·§ 9 (figma-mcp-rules.md 는 존재하지 않았다).

## 1. 대상

| 항목 | 값 |
|---|---|
| 파일 | `VCVQzOpSIpwpZw11gxG7N1` (컴프야펀) |
| 페이지 | `0:1` (컴프야펀 모바일, 단일 페이지) |
| frame | **480 단일.** 375/390/414 별도 frame 금지 — auto layout + clamp 로 자연 축소 (`fe-design.md` § 1) |

## 2. 쓰기 절차 (`use_figma`)

1. `get_metadata` + `get_variable_defs` — 기존 컴포넌트·토큰 확인
2. `search_design_system` — 재사용 가능 컴포넌트 탐색. **재사용 > 신규**
3. `get_figma_skill("skill://figma/figma-use/SKILL.md")` 로드. 화면 생성이면 `figma-generate-design` 추가 — **스킬 없이 `use_figma` 호출 금지, 예외 없음**
4. `use_figma` — 색·간격·타이포는 **Variable 바인딩**(raw hex 0건) · **auto layout**(절대 좌표 0건) · 기존 컴포넌트는 인스턴스
5. `get_screenshot` 으로 되읽어 자가 검수. 어긋나면 4 재수행
6. 쓰기는 한 번에 하나 — 병렬 feature 는 Figma 파일을 `shared_files` lock 으로 순차 (`workflows/multi-feature-parallel.md` § 5)

## 3. 금지

- 사용자 수작업(플러그인 빌드·`Ctrl+Alt+P`) 전제 — `figma-plugin/` 방식은 2026-08-20 폐기, 재실행 금지
- 🔴 항목(토큰 값 변경 · 컴포넌트 구조 변경 · 외부 자산 도입)을 사용자 답변 전 적용
- 도메인 자체 헤더 frame — 상단바는 `MobileLayout.TopBar` 3형 중 하나

## 4. 산출

`docs/features/<f>/design.md` (템플릿) + `.claude/.progress/<b>/design-report.md`(100줄: node-id 표 · Variable 바인딩 · 재사용/신규 수 · `get_screenshot` URL).
