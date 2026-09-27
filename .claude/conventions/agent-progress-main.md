# 메인 어시스턴트 진행 로그 · sub-agent 로그 통합

> `agent-progress.md` 의 § 7·§ 8 분리본. sub-agent 는 읽을 필요 없다 — 메인 세션 전용.

## 1. 메인 어시스턴트 진행 로그 (claude-*.log)

> sub-agent 룰과 별개로, **메인 어시스턴트도 작업 완료마다 1줄 append**. 사용자가 `.progress/` 만 보면 메인+sub 모든 흐름을 추적할 수 있도록.

### 1.1 파일 경로

```
.claude/.progress/claude-YYYYMMDD.log
```

- **하루 1 파일** — 같은 일자의 모든 사용자 요청·작업이 동일 파일에 누적 (단일 파일로 추적이 훨씬 편함)
- 새 사용자 요청이 들어오면 구분 표시 줄 권장:
  ```
  # === 17:28 사용자 요청: {짧은 요약} ===
  ```
- 일자가 바뀌면 새 파일 자동 시작

### 1.2 한 줄 포맷 (sub-agent 룰과 동일)

```
YYYY-MM-DD HH:MM:SS | (N/M) | {작업 내용} | {상태} [| ref:{ref-log-or-path}]
```

| 컬럼 | 예 |
|---|---|
| 시각 | `2026-05-31 17:24:10` |
| (N/M) | `(2/7)` — 요청 안 N번째 / 총 M (시작 시점 추정, 도중 변경 OK) |
| 작업 내용 | `developer-analyze BE 분석 dispatch` |
| 상태 | `시작` / `완료` / `진행중` / `실패` / `위임` |
| ref | `mobile-frame-2026...log`, `docs/.../analysis.md`, agent-id 등 (선택) |

### 1.3 기록 시점

- 새 사용자 요청 받자마자: 구분 표시 줄 (`# === HH:MM 사용자 요청: ... ===`) + `(0/M) 요청수신 | 시작`
- 트랙 분류 / agent 디스패치 / 메인 직접 처리 / 검증 / 사용자 응답 각 1줄
- 요청 단위 마지막 줄: `(M/M) 전체완료 | 완료`
- (N/M) 의 N/M 은 **해당 요청 안에서의 카운트** — 일자 전체가 아님

### 1.4 도구 / 인코딩

- 첫 줄: `Write` 로 파일 생성
- 이후: `Edit` (old_string=마지막 줄, new_string=마지막 줄+개행+새 줄) 또는 PowerShell
  ```powershell
  Add-Content -Path .claude/.progress/claude-YYYYMMDD-HHMM.log -Value '...' -Encoding utf8
  ```
  ⭐ `-Encoding utf8` 명시 필수 (기본 UTF-16 LE 회피)

### 1.5 예외 (로그 생략 OK)

- 한 줄 인사 / 즉답류 짧은 응답
- 사용자가 명시적으로 "로그 생략" 요청

⭐ 메모리/CLAUDE.md/컨벤션 갱신 같은 메타 작업도 기록 대상.

---

## 2. sub-agent log 통합 룰 (완료 후 흡수 + 원본 삭제)

> sub-agent 완료 notify 가 도착하면, 해당 sub-agent 의 `.progress/{agent-name}-{timestamp}.log` 를 메인 `claude-YYYYMMDD.log` 끝에 흡수하고 원본 파일은 삭제. **단일 파일 추적** 일관성을 위해.

### 2.1 트리거

- sub-agent `completed` notify 도착 후
- (진행 중인 sub-agent log 는 절대 손대지 않음 — race condition 회피)

### 2.2 작업 순서

1. sub-agent log 파일(`.claude/.progress/{agent-name}-{timestamp}.log`) 전체 읽기
2. 메인 `.claude/.progress/claude-YYYYMMDD.log` 끝에 sub-section 으로 append:
   ```
   # ===== sub-agent log 통합: {agent-name}-{timestamp} =====
   {sub-agent log 전체 내용 그대로}
   # ===== sub-agent log 통합 끝 =====
   ```
3. 통합 완료 후 sub-agent log 파일 `Remove-Item`
4. 메인 진행 로그에 1줄 append:
   ```
   YYYY-MM-DD HH:MM:SS | (N/M) | sub-agent log {file} 통합 + 원본 삭제 | 완료
   ```

### 2.3 위임 권장

- 통합 작업 자체도 **백그라운드 agent 로 위임** (메인 세션 부담 회피)
- brief 예: "sub-agent log `{path}` 를 메인 `claude-YYYYMMDD.log` 끝에 sub-section 흡수 + 원본 `Remove-Item` 후 메인 로그에 통합 1줄 append. 완료 메시지 1줄."

### 2.4 예외

- sub-agent 가 log 자체를 안 만든 경우 (Bash 권한 없는 fallback) — 통합 작업 불필요
- 진행 중 agent log 는 보존 (해당 agent 완료 후에만 통합)
- 사용자가 명시적으로 "원본 보존" 요청 시 삭제 생략
