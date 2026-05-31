# 파일 분할 룰

> 모든 산출물 (agent.md / convention.md / 코드 / docs) 공용. 사용자 확인 편의 + 토큰 효율.

---

## 1. 분할 트리거

| 파일 유형 | 분할 검토 한도 | 절대 상한 |
|---|---|---|
| convention.md (`.claude/conventions/*.md`) | 100줄 | 150줄 |
| screen-spec.md (`docs/domain/{f}/design/*.md`) | 200줄 | 300줄 |
| analysis.md (`docs/domain/{f}/develop/*.md`) | 200줄 | 300줄 |
| planner 산출물 (`docs/domain/{f}/prd/*.md`) | 150줄 | 250줄 |
| agent.md (`.claude/agents/*.md`) | 200줄 | 300줄 (별도 한도) |
| 코드 파일 | 권장 200줄 | 400줄 |

⭐ **본 파일 자체는 예외** — 50줄 내 유지 (단일 짧은 파일).

---

## 2. 분할 우선순위

1. **의미 단위 분리** — 기능별 § 를 별도 파일로 (예: `figma-plugin.md` → `figma-plugin-tokens.md` + `figma-plugin-helpers.md`)
2. **컨벤션 외부 추출** — 1차 가이드는 함축, 깊이 명세는 `docs/global-guide/**` 로
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

- `_decision_log.md` — append-only, 길어져도 분할 X
- `_deprecated_/*` — 보존용, 손대지 않음
