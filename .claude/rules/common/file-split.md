# 파일 분할 룰

> 모든 산출물 (agent.md / convention.md / 코드 / docs) 공용. 사용자 확인 편의 + 토큰 효율.

---

## 1. 분할 트리거

| 파일 유형 | 분할 검토 한도 | 절대 상한 |
|---|---|---|
| 규칙 (`.claude/rules/**/*.md`) | 120줄 | 150줄 |
| 현황 지도 (`.claude/rules/**/*-map.md`) | 120줄 | 150줄 — 넘으면 도메인별 분리 |
| 운영 절차 (`.claude/conventions/*.md`) | 100줄 | 150줄 |
| 허브 (`CLAUDE.md`) | 80줄 | 100줄 |
| 템플릿 (`.claude/templates/*.md`) | 50줄 | 70줄 |
| 기능 기획 (`docs/features/{f}/spec.md`) | 150줄 | 250줄 |
| 기능 설계 (`docs/features/{f}/design.md`) | 200줄 | 300줄 |
| 기능 이력 (`docs/features/{f}/history.md`) | 없음 | 없음 — 덧붙임 전용, § 5 참조 |
| 분석·실측 (`.claude/.progress/<branch>/*.md`) | 200줄 | 300줄 |
| 결정 기록 (`docs/decisions/*.md`) | 90줄 | 150줄 |
| 외부용 소개 (`docs/README.md`, `docs/overview/*.md`) | 100줄 | 150줄 |
| 에이전트 정의 (`.claude/agents/*.md`) | 200줄 | 300줄 — 라운드 디테일은 `{agent}.rounds.md` 로 |
| dispatch brief | 100줄 | 200줄 — 넘으면 분석문서 § 참조로 |
| 코드 파일 | 권장 200줄 | 400줄 |

⭐ **본 파일 자체는 예외** — 70줄 내 유지 (표가 늘어나도 설명은 늘리지 않는다).

---

## 2. 분할 우선순위

1. **의미 단위 분리** — 기능별 § 를 별도 파일로 (예: `responsive-mobile-first.md` → `responsive-mobile-first-tokens.md` + `responsive-mobile-first-patterns.md`)
2. **컨벤션 외부 추출** — 1차 가이드는 함축, 깊이 명세는 `.claude/references/**` 로
3. **부록 분리** — 본문 + `{name}.appendix.md` (예시 / 참고 자료)

---

## 3. 분할 금지

- ❌ 표 1개를 강제 분할 (가독성 ↓)
- ❌ 인덱스 없는 단순 길이 기준 분할
- ❌ `_decision_log.md` 같은 append-only 파일 분할

---

## 4. 분할 후 룰

- 모 파일에서 분할 파일 **링크 + 1줄 요약**
- 분할 파일은 같은 폴더 또는 명시된 하위 폴더
- 파일명: `{원본}-{subname}.md` 또는 `{원본}.appendix.md`

---

## 5. 적용 제외

- `_decision_log.md` — 덧붙임 전용, 길어져도 분할 X
- `docs/features/{f}/history.md` — 덧붙임 전용. 기능의 변경 이력 전체가 한 파일에 쌓이는 것이 목적이므로 길어져도 분할하지 않는다
- `_deprecated_/*` — 보존용, 손대지 않음
