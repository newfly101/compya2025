# Multi-Feature Parallel Workflow

> 다중 도메인(feature) 한 세션 병렬 처리. 메인 어시스턴트가 절차 따라 dispatch.
> 본 프로젝트: **B2C 단일 권한 / mobile-first 고정**. Role / SuperAdmin 분기 없음.

---

## 1. 목적

```
도메인1 (예: coupons): planner → designer → analyze → BE/FE → integrate  ┐
도메인2 (예: events):  planner → designer → analyze → BE/FE → integrate  ├─ 병렬
도메인3 (예: notices): planner → designer → analyze → BE/FE → integrate  ┘
```

파일 충돌 시 → lock 기반 대기 → 해제 후 진행.

---

## 2. 사전 조건

| 조건 | 확인 |
|---|---|
| `.claude/agents/` agent 존재 | `ls .claude/agents/` |
| `.claude/conventions/file-locks.md` 존재 | `ls .claude/conventions/file-locks.md` |
| `.claude/.locks/` 폴더 | 없으면 `mkdir -p .claude/.locks` |
| stale lock 검사 | § 7 참조 |

---

## 3. 사용자 input

```
"multi-parallel 워크플로로 coupons, events, notices 진행해줘"
```

추출:
- features: `[coupons, events, notices]`
- 기획 모드: `planner-lite` (default) 또는 `planner-division` (명시 시)

---

## 4. 전체 흐름 (5 Phase)

```
Phase 1 — 기획         (planner-lite | planner-division)
Phase 2 — 디자인       (designer-render, 기존 screen-spec 있으면 개선)
Phase 3 — 분석         (developer-analyze)
Phase 4 — 개발         (backend-developer + frontend-developer 병렬)
Phase 5 — 통합 검증    (developer-integrate)
```

---

## 5. 도메인별 산출물 위치

| 단계 | 위치 |
|---|---|
| 기획 | `docs/domain/{feature}/prd/*.md` |
| 디자인 | `docs/domain/{feature}/design/screen-spec.md` |
| 분석 | `docs/domain/{feature}/develop/analysis.md` |
| 개발 BE/FE history | `docs/domain/{feature}/develop/{be,fe}-history.md` |
| 통합 검증 | `docs/domain/{feature}/develop/integrate-report.md` |
| 통합 요약 | `docs/domain/integrate-summary.md` |
| 공용 decision log | `docs/domain/_decision_log.md` (append-only) |

⭐ 모든 산출물은 `docs/domain/{feature}/**` 하위. `docs/build/`, `docs/{Role}/` 사용 X.

---

## 6. Phase 별 충돌 영역

| Phase | 도메인 전용 (병렬 OK) | 공용 (순차) |
|---|---|---|
| 1 기획 | `docs/domain/{feature}/prd/**` | — |
| 2 디자인 | `docs/domain/{feature}/design/**` | Figma 파일 `VCVQzOpSIpwpZw11gxG7N1` 페이지 `0:1` (MCP `use_figma` 직접 반영 시만, 순차 필요) |
| 3 분석 | `docs/domain/{feature}/develop/analysis.md` | `docs/domain/_decision_log.md` (append-only) |
| 4 BE | `src/main/java/.../{feature}/**`, `src/main/resources/mapper/{feature}/**` | `build.gradle`, `application.properties` |
| 4 FE | `web/src/domains/{feature}/**` | `web/src/app/router/routes/*.jsx`, `web/src/app/router/config/{routeMeta,routePath}.js`, `web/src/app/store/store.js`, `web/package.json` |
| 5 통합 | `docs/domain/{feature}/develop/integrate-report.md` | — (read-only) |

---

## 7. Stale Lock 처리 (세션 시작 시)

```
1. .claude/.locks/ Glob
2. 각 lock Read → started 시각 확인
3. 30분+ 경과 → 사용자에게 보고:
   "stale lock 감지: {feature}__{phase} (started: {시각})
    이전 세션 비정상 종료일 수 있습니다. 삭제 후 진행할까요?"
4. 사용자 "예" → 삭제 / "아니오" → 종료
```

---

## 8. Phase 4 사전 통합 (공용 파일)

⭐ **default 전략**: 메인이 Phase 4 진입 전 FE 공용 파일 (router/store/routeMeta/routePath) 에 모든 features 의 route/reducer 일괄 추가. 각 frontend-developer 는 공용 파일 건드리지 않음.

```
1. 모든 features 의 analysis.md 읽기 (FE 명세)
2. 메인이 직접 Edit:
   - PublicRoutes.jsx / UserRoutes.jsx / AdminRoutes.jsx 에 lazy import + Route 추가
   - routeMeta.js 에 TopBar 메타 추가
   - routePath.js 에 경로 상수 추가
   - store.js 에 reducer 등록
3. 각 frontend-developer brief: "공용 파일 (router/store/routeMeta/routePath) 수정 금지 — 이미 등록됨"
```

상세 FE 코드 패턴: [.claude/conventions/fe-code-base.md](../conventions/fe-code-base.md)

---

## 9. 보고 템플릿

### Phase 진행 중 (간결)

```
🔄 진행:
- coupons: Phase 4 (BE / FE 진행 중)
- events:  Phase 3 (analyze)
- notices: Phase 2 (designer 완료, Phase 3 대기 — decision_log lock)

📍 활성 lock: 5건 / ⏳ 대기 큐: 1건
```

### 전체 완료

```
✅ Multi-Feature Parallel Workflow 완료

📊 도메인: {N}개
- coupons: ✅ 완료 / [미해결] {n}
- events:  ✅ 완료
- notices: ⚠️ Phase 4 일부 미해결

📂 산출물:
- docs/domain/integrate-summary.md
- docs/domain/{feature}/develop/integrate-report.md 각

🔴 검토 권장:
- _decision_log.md: {N}건 위험 항목
- 미해결: {N}건
```

---

## 10. 실패 / 중단 처리

| 케이스 | 처리 |
|---|---|
| Agent 실패 | lock 삭제 + 해당 feature/phase [실패] 마크 + 다른 features 진행 |
| 사용자 중단 | 진행 중 dispatch 종료 + 모든 lock 삭제 + 부분 보고 |
| Phase 2 실패 | Phase 3 진행 가능 (analysis 시 screen-spec 없음 인지) |
| Phase 3 실패 | Phase 4 중단 (analysis 필수) |
| Phase 4 BE 성공 / FE 실패 | Phase 5 진행 (integrate-report 미해결 보고) |

---

## 11. 명령어 예시

```
# 기본
"multi-parallel 워크플로로 coupons, events, notices 진행해줘"

# 옵션 명시
"multi-parallel features: coupons, events / 기획: planner-division / Figma 렌더: skip"

# 부분 재실행
"multi-parallel coupons Phase 4 부터 재실행"

# stale lock 정리
".claude/.locks/ 30분 이상 lock 모두 삭제"
```

---

## 12. 메인 어시스턴트 체크리스트

세션 시작:
- [ ] `.claude/.locks/` 폴더 존재 확인
- [ ] stale lock 검사
- [ ] features 파싱

Phase 1~5 공통:
- [ ] dispatch 전 충돌 검사 ([file-locks.md](../conventions/file-locks.md))
- [ ] lock 생성 → dispatch → 완료 → lock 삭제
- [ ] 대기 큐 관리

Phase 4 사전:
- [ ] FE 공용 파일 (router/store/routeMeta/routePath) 사전 통합

전체 종료:
- [ ] 모든 lock 삭제 확인
- [ ] `docs/domain/integrate-summary.md` 작성
- [ ] 사용자 최종 보고
