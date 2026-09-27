# Multi-Feature Parallel Workflow

> 다중 도메인(feature) 한 세션 병렬 처리. 메인 어시스턴트가 절차 따라 dispatch. B2C 단일 권한 · mobile-first 고정.
> 경로는 `rules/common/docs-policy.md` § 8 을 따른다 — `docs/domain/**` 는 폐지됐다.

## 1. 목적

```
coupons: planner → designer → analyze → BE/FE → integrate  ┐
events:  planner → designer → analyze → BE/FE → integrate  ├─ 병렬
notices: planner → designer → analyze → BE/FE → integrate  ┘
```

파일 충돌 시 lock 기반 대기 → 해제 후 진행. 각 feature 는 자기 브랜치 `feat/{feature}-{요약}` 에서 진행하고 작업 문서는 `.claude/.progress/<branch>/` 에 둔다.

## 2. 사전 조건

| 조건 | 확인 |
|---|---|
| agent 9개 | `ls .claude/agents/` |
| `.claude/.locks/` | 없으면 생성. stale lock 검사 (§ 7) |
| 브랜치 | feature 마다 `master` 에서 분기. master 직접 작업 금지 (CLAUDE.md § 3-5) |

## 3. 사용자 input

`"multi-parallel 워크플로로 coupons, events, notices 진행해줘"` → features `[coupons, events, notices]`, 기획 모드 `planner-lite`(default) 또는 `planner-division`(명시 시), `Figma 렌더: skip` 옵션.

## 4. 전체 흐름 (5 Phase)

| Phase | agent | 산출 (feature 마다) | 영속 여부 |
|---|---|---|---|
| 1 기획 | `planner-lite` \| `planner-division` | `docs/features/<f>/spec.md` · `.progress/<b>/{tasks.md,decisions.log}` | spec 영속 |
| 2 디자인 | `designer-render` | `docs/features/<f>/design.md` · Figma · `.progress/<b>/design-report.md` | design 영속 |
| 3 분석 | `developer-analyze` | `.progress/<b>/analysis.md` · `decisions.log` append | 작업 문서 |
| 4 개발 | `backend-developer` + `frontend-developer` 병렬 | 코드 · `.progress/<b>/{be,fe}-history.md` | 작업 문서 |
| 5 통합 | `developer-integrate` | `.progress/<b>/verification.md` → 마지막 § 를 `docs/features/<f>/history.md` 맨 위에 | history 영속 |

brief 는 `templates/dispatch-brief.md`, Read 할 rules 는 `agents/README.md` § 1.

## 5. 공용 파일 — 순차 처리

| Phase | feature 전용 (병렬 OK) | 공용 (순차 · lock `shared_files`) |
|---|---|---|
| 1 | `docs/features/<f>/spec.md` · `.progress/<b>/**` | — |
| 2 | `docs/features/<f>/design.md` | Figma 파일 `VCVQzOpSIpwpZw11gxG7N1` 페이지 `0:1` (`use_figma` 쓰기는 한 번에 하나) |
| 3 | `.progress/<b>/analysis.md` | — (`decisions.log` 는 브랜치별이라 충돌 없음) |
| 4 BE | `src/main/java/.../domain/{f}/**` · `resources/mapper/{site\|fun}/{f}/**` | `build.gradle` · `application*.properties` |
| 4 FE | `web/src/domains/{f}/**` | `web/src/app/router/routes/*.jsx` · `router/config/{routeMeta,routePath}.js` · `app/store/store.js` · `web/package.json` |
| 5 | `.progress/<b>/verification.md` · `docs/features/<f>/history.md` | `CHANGELOG.md` `[Unreleased]` (메인이 기록) |

## 6. Phase 4 사전 통합 (FE 공용 파일)

메인이 Phase 4 진입 전 FE 공용 파일에 모든 feature 의 route/reducer 를 **한 번에** 추가한다. 이건 CLAUDE.md § 3-1 "메인 직접 처리" 예외에 해당한다 — 공용 파일 4개, 각 몇 줄.

1. 모든 feature 의 `analysis.md` FE 명세 Read
2. `{Public|User|Admin}Routes.jsx` lazy import + Route · `routeMeta.js` · `routePath.js` · `store.js` reducer — 패턴은 `rules/fe/fe-convention.md` § 6
3. 각 frontend-developer brief 에 "공용 파일 수정 금지 — 이미 등록됨" 명시

## 7. Stale Lock (세션 시작 시)

`.claude/.locks/` Glob → `started` 30분+ 경과 → 사용자 보고 "stale lock {feature}__{phase} (started …). 삭제 후 진행?" → 예/아니오. 상세 `conventions/file-locks.md` § 5.

## 8. 진행 로그

- 메인: 요청 수신 시 `.claude/.progress/claude-YYYYMMDD.log` 에 `# === HH:MM 사용자 요청: multi-parallel {features} ===` + `(0/M)`. Phase·feature 전환마다 1줄
- sub-agent: Bash 있는 agent(BE/FE/render/integrate)는 progress.log + 메인 Monitor. 완료 시 로그 흡수 + 원본 삭제 (`agent-progress-main.md` § 2)

## 9. 보고

진행 중 (feature × Phase 한 줄씩 + 활성 lock / 대기 큐 수). 전체 완료 시:

```
✅ multi-parallel 완료 — feature {N}개
- coupons: ✅ / [미해결] {n}   - events: ✅   - notices: ⚠️ Phase 4 일부 미해결
📂 docs/features/{f}/history.md 항목 {N}개 · PR {N}개 (본문에 analysis·verification 요약)
🔴 결정 대기 {N} (각 .progress/<b>/decisions.log)
```

## 10. 실패 / 중단

| 케이스 | 처리 |
|---|---|
| agent 실패 | lock 삭제 + [실패] 마크 + 다른 feature 진행. progress.log 에 `실패` 1줄 |
| 사용자 중단 | 진행 중 dispatch 종료 + 모든 lock 삭제 + 부분 보고 |
| Phase 2 실패 | Phase 3 진행 (analysis 가 design.md 없음을 decisions.log 에 기록) |
| Phase 3 실패 | Phase 4 중단 |
| Phase 4 BE 성공 / FE 실패 | Phase 5 진행 (verification 에 미해결 기록) |
| Phase 5 완료 | 브랜치별 `.progress/<b>/` 삭제 커밋 → PR (본문에 analysis·verification 핵심) → 머지 |

## 11. 명령 예시

`"multi-parallel coupons, events, notices"` · `"multi-parallel coupons / 기획: planner-division / Figma 렌더: skip"` · `"multi-parallel coupons Phase 4 부터 재실행"` · `".claude/.locks/ 30분 이상 lock 모두 삭제"`

## 12. 메인 체크리스트

- [ ] 세션 시작: `.locks/` 확인 · stale lock · features 파싱 · feature 별 브랜치 분기
- [ ] Phase 공통: dispatch 전 충돌 검사 → lock → brief(rules 명시) → dispatch → 완료 → lock 삭제 → 로그 1줄
- [ ] Phase 4 사전: FE 공용 파일 일괄 등록
- [ ] Phase 5 후: history 항목 확인 · `CHANGELOG.md` `[Unreleased]` 판단 · `.progress/<b>/` 삭제 · PR
- [ ] 전체 종료: lock 0건 확인 · 사용자 보고
