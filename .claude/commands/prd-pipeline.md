---
description: 단일 도메인 PRD pipeline 오케스트레이터. IA 정립(foreground) → wireframe 생성 + design-sync (background, parallel) 순서로 실행. 컨텐츠(도메인) 단위 병렬 처리 패턴.
---

# /prd-pipeline {domain}

도메인 단위 PRD 파이프라인을 실행한다.

## 실행 순서

### Phase A — IA (foreground, 사용자 대화 필수)
**`prd-ia-interactive`** sub-agent 호출 (`domain: $ARGUMENTS`).

이 단계는 사용자와 직접 대화한다 — 사용자가 "확정" / "Yes" 명시할 때까지 대기. 임의 진행 금지.

완료 조건: `docs/prd/domains/{domain}.md` Part B 가 placeholder → 확정 내용으로 수정됨.

### Phase B — Wireframe + Design Sync (background, 병렬)
Phase A 가 사용자 승인으로 완료되면 **즉시** 다음 두 sub-agent 를 **단일 메시지에서 병렬로** Task tool 호출:

1. **`prd-wireframe-generator`** — `domain: $ARGUMENTS`
2. **`prd-design-sync`** — `domain: $ARGUMENTS`

이 단계는 사용자 입력 받지 않음. 완료 시 결과만 보고.

★ **중요**: 두 sub-agent 호출은 한 번의 어시스턴트 응답 안에 병렬로 발사. 순차 호출 금지 (병렬 처리 핵심).

### Phase C — 결과 통합 보고
두 background sub-agent 가 모두 끝나면 통합 결과 보고:
- IA 확정: P0/P1/P2 기능 수
- wireframe: 화면 수 + figma 매칭률
- design-sync: 갭 수 + figma/코드 수정 제안 수

사용자에게 다음 안내:
- "다음 도메인 IA 시작 시 `/prd-pipeline {next_domain}` 호출"
- "여러 도메인을 동시 진행하려면 본 명령을 다른 세션에서 다시 실행"

## 컨텐츠 단위 병렬 처리 패턴

본 명령은 **하나의 도메인** 만 처리한다. 사용자가 coupon, event 등 여러 도메인을 병렬 진행하려면:

- 도메인 1 (예: coupon) IA → 사용자 답변 → 확정 → background 자동 실행 시작
- background 진행 중에 사용자는 도메인 2 (예: event) IA 시작 (`/prd-pipeline event` 새로 호출)
- 도메인 2 IA 가 끝나면 background 또 자동 실행 — 도메인 1 background 와 **병행 진행**

즉:
- **사용자 입력 (IA)** 은 직렬 (사용자 한 명이라)
- **background 처리 (wireframe + design-sync)** 는 도메인 단위로 병렬 누적

## Pipeline 사전 조건

- `docs/prd/domains/{domain}.md` Part A 가 PRD synthesizer 산출물로 채워져 있어야 함
- `docs/prd/_overview.md` 존재
- Figma MCP 가 활성화돼 있어야 wireframe + design-sync 가 의미 있음 (없으면 텍스트 모드로 진행 — 결과는 제한적)

## 도메인별 추천 진행

도메인 분류에 따라 Phase B 다르게 실행:

| Part A.1 분류 | Phase A | Phase B-Wireframe | Phase B-DesignSync |
|---|---|---|---|
| **live / partial-mock** | 진행 | 진행 | 진행 (★ 의미 있음) |
| **mock-only** | 진행 | 진행 (BE shape 기반) | 보류 (구현 후 진행) |
| **미구현 / V2 작동 불능** | 진행 | 진행 (figma frame 만) | 보류 |
| **PC 레거시 보류** (dictionary, simulate, kbo) | Owner 보류 권장 | 미진행 | 미진행 |
| **폐기 권고** (mobile) | Part B 작성 X | 미진행 | 미진행 |

위 분류는 `docs/prd/_overview.md` § 1.3 + 각 domain PRD Part A.1 확인.

## 출력 위치 정리

- Phase A 결과: `docs/prd/domains/{domain}.md` Part B (Edit)
- Phase B 결과:
  - `docs/prd/wireframes/{domain}.md` (Write)
  - `docs/prd/design-sync/{domain}.md` (Write)
- 모두 덮어쓰기 OK

## 호출 예시

```
/prd-pipeline coupons
/prd-pipeline events
/prd-pipeline community
```

argument 미명시 시: 사용자에게 도메인명 요청 후 진행.
