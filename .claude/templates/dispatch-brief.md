<!-- 최종 위치: .claude/templates/dispatch-brief.md -->
<!-- 언제 쓰나: 메인 어시스턴트가 sub-agent 를 dispatch 할 때마다. 빈칸을 채워 그대로 Agent 도구 prompt 로 넘긴다 -->
<!-- 한도: 100줄 권장 / 200줄 상한. 넘으면 분석문서 § 참조로 대체 -->

# {agent-name} — {feature} / {phase}

## 목적
<한 줄. 무엇이 끝나면 완료인가>

## 입력
| 입력 | 경로 | 읽을 § |
|---|---|---|
| <분석문서/기획서/design.md> | <경로> | <§ 번호만> |

## 반드시 Read 할 규칙
<agent 가 만질 경로에 맞는 rules 파일. 자동 로드를 믿지 않는다. 표: `.claude/agents/README.md` § 1>
- `.claude/rules/common/hitl-markers.md` (결정 항목이 있을 때)
- `.claude/rules/{be|fe}/...`

## 작업 범위
| 구분 | 경로 |
|---|---|
| Edit 가능 | <파일군. 한 파일군 = 이 agent 하나> |
| Read only | <참조만> |
| 절대 금지 | <공용 파일 · 타 영역 · `community/**` · `sql/**`> |

lock: `.claude/.locks/{feature}__{phase}.lock` (메인이 생성·삭제. agent 는 건드리지 않는다)

## 산출물
| 산출 | 경로 | 한도 |
|---|---|---|
| <파일> | `.claude/.progress/<branch>/...` 또는 `docs/features/<f>/...` | <줄> |

## 결정 처리
- 🟨 / ❓ → 가정값으로 진행 + `.claude/.progress/<branch>/decisions.log` append
- 🔴 (법무·결제·권한·DB 파괴적·secret·디자인 토큰 변경·외부 자산) → **가정값 + 마커만, 확정 X.** 코드·Figma 적용 금지

## 버전 영향
`기능 {MAJOR|MINOR|PATCH|무영향} / 플랫폼 {MAJOR|MINOR|무영향}` — 근거 한 줄. 판단표 `.claude/rules/common/commit-version.md`

## 진행 로그 (단계 ≥ 3 또는 5분 이상일 때)
각 단계 완료마다 `.claude/.progress/{agent-name}-{YYYYMMDD-HHMMSS}.log` 에 한 줄 append:
`YYYY-MM-DD HH:MM:SS | (N/M) | {단계명} | {완료|진행중|실패|미해결}` — 시작 시 `(0/M) 시작`, 끝에 `(M/M) 전체완료`. 실패·미해결도 한 줄(침묵 금지). Bash 없는 agent 는 생략.

## 완료 보고 — 이 형식만, 300줄 이하
1. 산출물 절대 경로 (1줄씩)
2. 핵심 결과 표 (3~7행)
3. build / 검증 결과 (1줄) — 실행한 명령 그대로
4. 미해결 / 🔴 / ❓ (있을 때만)
진행 단계 나열 · 코드 snippet · 변경 라인별 설명 금지. 상세는 산출 파일에.

## 중단 조건
- 입력 파일 미존재 → 선행 agent 이름 보고 후 종료
- 범위 밖 파일을 고쳐야만 진행 가능 → 즉시 중단 + 어느 파일인지 보고
- 같은 오류 3회 → `[미해결]` 마크 후 다음 항목
