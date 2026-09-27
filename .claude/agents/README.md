# agents/README — agent · rules · 산출물 대응표

> 메인 어시스턴트가 dispatch brief(`templates/dispatch-brief.md`)의 "반드시 Read 할 규칙"과 "산출물 경로"를 채울 때 보는 표. agent 파일 9개를 2026-09-28 rules 와 대조한 결과이며, § 3 은 각 agent 파일에 가해야 할 수정 목록이다.

## 1. agent × Read 할 rules

| agent | model | Bash | 항상 (자동) | brief 에 명시 | 만지는 경로 |
|---|---|---|---|---|---|
| `planner-lite` | sonnet | ✗ | common/* | `docs-policy` § 5 버전, `templates/spec.md` | `docs/features/<f>/spec.md` · `.progress/<b>/{tasks.md,decisions.log}` |
| `planner-division` (+`.rounds`) | opus | ✗ | common/* | 동상 + `templates/history-entry.md`(R4) | 동상 |
| `designer-render` | sonnet | ✓ | common/* | `fe/fe-design.md` · `fe/fe-convention.md` § 5(TopBar) · `references/designer/figma-mcp-rules.md` ❓ | `docs/features/<f>/design.md` · Figma · `.progress/<b>/design-report.md` |
| `designer-review` | sonnet | ✗ | common/* | `fe/fe-design.md` · `fe/fe-badges.md` | `.progress/<b>/review-YYYY-MM-DD.md` |
| `developer-analyze` | sonnet | ✗ | common/* | `be/be-structure-map.md` · `fe/fe-convention.md` · `fe/fe-store.md` (명세가 이 규칙을 인용해야 함) | `.progress/<b>/{analysis.md,decisions.log}` |
| `backend-developer` | sonnet | ✓ | common/* + be/* | `be/be-convention.md` § 7(삭제)·§ 9 체크리스트 | `src/main/**` `src/test/**` · `.progress/<b>/be-history.md` |
| `frontend-developer` | sonnet | ✓ | common/* + fe/* | `fe/fe-convention.md` · `fe-store.md` · `fe-design.md` · (광고 화면) `fe-ads.md` | `web/src/domains/<f>/**` · `.progress/<b>/fe-history.md` |
| `developer-integrate` | opus | ✓ | common/* | `be-convention` § 5-6 · `fe-store` § 1-3 · `templates/{verification,history-entry}.md` | `.progress/<b>/verification.md` → `docs/features/<f>/history.md` 1항목 |

`common/*` = docs-policy · file-split · hitl-markers · commit-version. Bash 없는 agent 는 progress.log 생략(단일 완료 보고).

## 2. 파이프라인 산출물 → docs-policy 위치

```
planner ─ spec.md ──────────────┐
designer ─ design.md ───────────┤  docs/features/<f>/   (영속, 템플릿 강제)
integrate ─ history.md 1항목 ───┘
analyze ─ analysis.md, decisions.log ┐
BE/FE ─ be-history.md, fe-history.md  ├ .claude/.progress/<branch>/  (머지 전 삭제, PR 본문 첨부)
integrate ─ verification.md           │
multi ─ integrate-summary → PR 본문    ┘
```

`docs/domain/**` 는 폐지. workflows/multi-feature-parallel.md § 5·§ 6 의 경로표를 위 그림으로 교체한다.

## 3. agent 파일 수정 목록 (rules 와 어긋난 곳)

### 전 agent 공통 (9/9)
| 항목 | 현재 | 고칠 것 |
|---|---|---|
| 산출물 경로 | `docs/domain/{feature}/{prd,design,develop}/` | § 2 표 |
| 컨벤션 JIT 표 | `.claude/conventions/{hitl-markers,file-split,responsive-mobile-first}.md`, `docs/convention/frontend.md`, `docs/global-guide/design/figma-mcp-rules.md` | `.claude/rules/**` 경로. `responsive-mobile-first` → `fe/fe-design.md`. `figma-mcp-rules.md` 는 **존재하지 않음** — `references/designer/` 확인 후 경로 확정 ❓ D5 |
| 프로젝트 컨텍스트 | `v2.0.0-refactor-mobile` 브랜치 언급 | 삭제 (브랜치 규칙 교체됨) |
| 보고 템플릿 | agent 별 이모지 양식 | `dispatch-brief.md` 의 4항 형식으로 통일 (300줄 상한 명시) |

### 개별
| agent | 위치 | 문제 | 수정 |
|---|---|---|---|
| backend-developer | § 6.2 | `BusinessException 패턴` | `BaseException(도메인Messages.코드, HttpStatus)` |
| | § 6.1 | DTO `record / class` | record 만 |
| | § 4 | mapper XML 경로 `mapper/{Feature}Mapper.xml` | `mapper/{site\|fun}/{도메인}/` — 갈래 규칙 |
| | § 11 | 소프트 삭제 언급 없음 | `be-convention` § 7 표 인용 — `is_deleted` 는 4테이블뿐 |
| frontend-developer | § 1-6, § 7.2 | `useSetTopBar({ variant: "page" })` | `useDomainTopBar` / `useAdminTopBar` (D1) |
| | § 7.2 | `applyAsyncHandlers … (auth slice 외)` | auth 도 적용됨(09-28). 예외는 id 별 로딩이 필요한 `admin`·`notices` 상세만 |
| | § 6 트리 | `config/` 없음 | 선택 항목으로 추가. `dto.js`/`adapter.js` 도 |
| | § 7.2 | 날짜·bulk·loaded·업로드 규칙 없음 | `fe-store.md` § 1 인용 (thunk 는 서버 응답 반환 · `toBulkResult` · `loaded` · 업로드 공용) |
| | § 5 | `figma-plugin/**` 금지 행 | 폴더가 남아 있을 때만 유지 |
| developer-analyze | § 7 default 표 | `soft delete: is_deleted 컬럼 (hard delete 회피)` | **틀림** — 삭제 방식은 `be-convention` § 7 표에서 고른다 |
| | § 7 | `CORS 동일 origin`, 비밀번호 정책, session 만료, rate limit | 이 프로젝트에 없음(네이버 OAuth 단일, api.compyafun.com 교차 origin). 행 삭제 |
| | § 5.1 FE 명세 예시 | `useSetTopBar` | D1 |
| | § 1 vs § 12.5 | 200줄 한도 vs "길이 한도 없음(600~900 OK)" | 모순. `file-split` 표: 분석 300줄 상한, brief 는 § 참조로 분리 |
| | § 12 | 7항목 구조가 § 5.1 구조와 다름 | 둘 중 하나로 — § 5.1(FN 분해) 을 `templates/analysis.md` 에 "기능 분해" § 로 추가하고 § 12 는 리뷰형 분석 전용으로 명시 ❓ D13 |
| designer-render | § 3 screen-spec § 7 | `기준 frame 사이즈: 375 × 812` | **480 단일** (`fe-design` § 1) |
| | § 3 screen-spec § 7 | "누적 보존 패턴 — 이전 도메인 코드 주석 처리" | 플러그인 방식 잔재 — 삭제 |
| | § 3 screen-spec § 4 예시 | `useSetTopBar` | D1 |
| | § 3 screen-spec § 3 예시 | `color.accent #a78bfa` | 토큰 이름은 `--color-*` 실제 이름. 등급·분류 3축 표기 |
| | 산출 | `screen-spec.md` 자체 구조 | `templates/design.md` 구조로(구조 도식·화면 구성·데이터 흐름·상태 관리). 화면 인벤토리·FE/BE 가이드 § 는 design.md 에 추가 § 로 허용 ❓ D14 |
| designer-review | § 4 경로 | `docs/review/…` | `.progress/<b>/review-YYYY-MM-DD.md`. P0 이 코드 수정으로 이어지면 history 항목 |
| | § 3 ③ 일관성 | 토큰·컴포넌트 항목 | `fe-badges.md`·분류 3축 명시 |
| developer-integrate | § 5 § 6 통합 history | "Jira sync 시 그대로 전송" | 삭제. 대신 마지막 § 는 `history-entry.md` 블록 (verification 템플릿과 동일) |
| | § 4 2-4 에러 코드 | FE 매핑 확인 | `client.js` 가 코드 문자열을 갖는다 → 변경 시 동반 배포 표기 확인 항목 추가 |
| planner-lite | § 3 | 3파일 (`_common` `{feature}` `_tasks`) | `spec.md` 1파일(템플릿) + `.progress/tasks.md`. `_common` 의 "도메인 공통 정책"은 spec § 규칙과 제약. ❓ D15 — 3파일 구조를 spec 하나로 접는 데 사용자 동의 필요 |
| planner-division | § 2-5 | 500줄 한도 | spec 250줄 상한(`file-split`). 넘으면 sub-feature 분리 |
| | § 4 prefix | `docs/domain/` grep | `docs/features/` |
| planner-division.rounds | § 4 R4 | 구 문서 정리 | 이번 통합 후에는 대상이 없어야 정상 — 절차는 유지 |

## 4. multi-feature-parallel.md 수정

- § 5 경로표 → 본 문서 § 2
- § 6 공용 파일에 `.claude/.progress/<branch>/decisions.log` 추가 (append-only 이나 동시 append 충돌 가능 → feature 별 파일로 분리 권장)
- § 8 "상세 FE 코드 패턴: docs/convention/frontend.md" → `.claude/rules/fe/fe-convention.md` § 6
- Phase 4 사전 통합(메인이 공용 파일 직접 Edit)은 CLAUDE.md § 3-1 "메인 직접 처리 예외"에 해당함을 명시

## 5. 결정 ❓

| # | 내용 |
|---|---|
| D13 | `templates/analysis.md` 는 수정 작업용(현재 동작/문제/계획). 신규 기능용 FN 분해 § 를 같은 템플릿에 추가할지, `analysis-feature.md` 를 따로 둘지 |
| D14 | designer `screen-spec` 의 화면 인벤토리·FE/BE 가이드 § 를 `templates/design.md` 에 넣을지 (템플릿 확장) |
| D15 | planner 3파일 → `spec.md` 1파일. `_common.md` 의 공통 정책이 여러 feature 에 걸치면 ADR |
| D16 | `settings.local.json` 의 `Bash(git commit *)` 허용 — CLAUDE.md § 3-5 (master 직접 커밋 금지)와 충돌하지 않도록 hook 으로 브랜치 검사 추가 여부 |
