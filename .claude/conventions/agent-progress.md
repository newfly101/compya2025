# sub-agent 진행상황 stream 룰 (progress.log + Monitor)

> 백그라운드 sub-agent 가 단계 완료마다 메인에 한 줄씩 notify. 기본 sub-agent 는 완료 시점 단일 메시지만 전송 — 본 룰로 보강.

---

## 1. 폴더 / 파일 경로

```
.claude/.progress/{agent-name}-{YYYYMMDD-HHMMSS}.log
```

- `agent-name`: 예 `agents-rewrite`, `conventions-rewrite`
- 타임스탬프: dispatch 시각

---

## 2. 한 줄 포맷 (sub-agent 가 append)

```
YYYY-MM-DD HH:MM:SS | (N/M) | {단계명} | {상태}
```

| 컬럼 | 예 |
|---|---|
| 시각 | `2026-05-31 17:42:10` |
| 진행 | `(3/8)` |
| 단계명 | `frontend-developer.md` / `Phase 4 BE FN-2` |
| 상태 | `완료` / `진행중` / `실패` / `미해결` |

---

## 3. 메인 어시스턴트 책임

### 3.1 dispatch brief 에 명시 (필수 1줄)

```
"각 단계 완료마다 `.claude/.progress/{agent-name}-{timestamp}.log` 에
 한 줄 append. 포맷: `YYYY-MM-DD HH:MM:SS | (N/M) | {단계명} | {상태}`.
 N/M 은 작업 시작 시 사전 산정 — 도중 변경 시 새 줄 +주석."
```

### 3.2 dispatch 직후 Monitor 띄우기

```
Monitor(
  description: "{agent-name} progress (N/M)",
  persistent: true,
  command: "tail -F .claude/.progress/{agent-name}-{timestamp}.log
            | grep --line-buffered -E '\\([0-9]+/[0-9]+\\)|실패|미해결'"
)
```

- `tail -F` (대문자) — 파일 재생성에도 추적
- `grep --line-buffered` — buffer 지연 방지
- alternation 에 `실패|미해결` 포함 — silence 가 success 처럼 보이지 않게
- `persistent: true` — sub-agent 완료 알림 받으면 `TaskStop`

### 3.3 sub-agent 완료 시

1. 완료 notify 도착 → Monitor `TaskStop`
2. progress.log 는 **통합 후 원본 삭제** (§ 8 신규 룰) — 진행 중에는 보존 (race condition 회피)
3. 다음 라운드 시 새 타임스탬프 파일

---

## 4. sub-agent 책임

- 작업 시작 시 N (전체 단계 수) 사전 산정 → `(0/N) 시작` 1줄
- 각 단계 종료 시 1줄 append
- 실패/미해결도 1줄 (silence 금지)
- 전체 종료 시 `(N/N) 전체완료` 1줄

⭐ append 시 echo + redirect 사용 — Bash 권한 없는 agent 는 본 룰 적용 X (단일 완료 메시지로 fallback).

---

## 5. 적용 / 미적용 기준

| 작업 | 적용 |
|---|---|
| 단계 ≥ 3, 예상 시간 ≥ 5분 | ✅ 적용 |
| 단일 짧은 작업 (1~2분) | ❌ 불필요 |
| 메인이 직접 처리 | ❌ (메인 자체가 stream) |
| Bash 권한 없는 sub-agent | ❌ (fallback) |

---

## 6. 자가 점검

- [ ] dispatch brief 에 progress.log 룰 명시
- [ ] dispatch 직후 Monitor 띄움
- [ ] sub-agent 완료 시 Monitor 정리
- [ ] progress.log 파일 audit 보존
- [ ] sub-agent 완료 시 log 통합 + 원본 삭제 (§ 8)

---

---

## 7. 메인 로그 · sub-agent 로그 통합

메인 어시스턴트 자신의 `claude-YYYYMMDD.log` 와 완료된 sub-agent 로그 흡수 절차: `agent-progress-main.md`.
