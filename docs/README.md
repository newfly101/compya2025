# docs/

이 프로젝트의 모든 문서. **도메인 단위 entry** + **글로벌 가이드** 두 갈래.

```
docs/
├── domain/                  도메인 단위 entry
│   ├── legacy/              ⚠️ PC 버전 기획 (참고용 / 폐기 기능 포함)
│   └── {feature}/           신규 도메인 작업물
│       ├── prd/             기획 (planner)
│       ├── design/          디자인 (designer)
│       └── develop/         구현 (developer + BE/FE)
│
└── global-guide/            전역 참조 가이드
    ├── plan/                기획자 공통 가이드
    ├── design/              디자이너 공통 가이드
    └── develop/             개발자 공통 가이드 + 코드 spec
        ├── backend-developer.md
        ├── frontend-developer.md
        ├── auth-developer.md
        └── specs/           코드 구조/컨벤션 reference (be/db/fe)
```

## 어디서 시작?

| 알고 싶은 것 | 폴더 |
|---|---|
| 어떤 도메인의 기획 / 디자인 / 코드 구조가 궁금하다 | `domain/{feature}/` |
| 새 도메인 작업을 시작한다 | `domain/{feature}/prd/` 부터 작성 (planner agent) |
| 옛날 PC 버전 기획이 어땠는지 보고 싶다 | `domain/legacy/` |
| BE/FE 작업 컨벤션이 궁금하다 | `global-guide/develop/` |
| 코드 구조 / 엔드포인트 명세가 궁금하다 | `global-guide/develop/specs/` |

## 도메인 폴더 안 (`domain/{feature}/`)

| 하위 폴더 | 누가 만드나 | 산출물 |
|---|---|---|
| `prd/` | 기획자 (planner agent) | ia / requirements / policy-draft / **feature-spec** / endpoint-spec-draft / edge-cases / qa-checklist |
| `design/` | 디자이너 (designer agent) | design-analysis / design-report / **implementation-handoff** |
| `develop/` | 테크리드 + 개발자 | dispatch-plan / integrate-review / structure |

**굵게** 표시된 게 가장 자주 보는 핵심 산출물.

## 작업 흐름

```
planner → designer → backend-developer + frontend-developer (병렬) → developer (통합 검증)
   ↓        ↓                ↓
  prd/    design/          develop/
```

각 agent 정의: `.claude/agents/` 참조.
