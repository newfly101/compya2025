# 파일 Lock 시스템 — 다중 기능 병렬

> 다중 기능 병렬 워크플로 공용. 메인 어시스턴트가 dispatch 직전 검사.

---

## 1. 개요

OS-level 파일 lock 불가 → **dispatch 시점 사전 차단**.
`dispatch 전 → .locks/ 확인 → 충돌? (없음=lock+dispatch / 있음=대기) → 완료 후 lock 삭제`

---

## 2. Lock 파일 형식

| 항목 | 값 |
|---|---|
| 위치 | `.claude/.locks/{feature}__{phase}.lock` |
| feature | 도메인명 (예: `coupons`) |
| phase | `planner` / `designer` / `analyze` / `BE` / `FE` / `integrate` |
| 구분자 | `__` (언더스코어 2개) |

### 내용 (YAML)

```yaml
agent: backend-developer
feature: coupons
phase: BE
started: 2026-05-31T15:30:00+09:00
files:
  - src/main/java/com/example/coupons/**
shared_files:
  - web/src/app/router/routes/PublicRoutes.jsx
  - web/src/app/store/store.js
```

| 필드 | 필수 | 설명 |
|---|---|---|
| `agent` / `feature` / `phase` / `started` / `files` | ✅ | 기본 |
| `shared_files` | 선택 | 공용 파일 (충돌 우선 검사) |

---

## 3. 충돌 검사

1. Glob `.claude/.locks/*.lock` → 각 Read
2. 신규 dispatch files/shared_files 와 비교 — 일치 = 충돌 (files↔files, files↔shared, shared↔shared)
3. 충돌 → 대기 / 미충돌 → lock 생성 + dispatch

⭐ **경로 prefix 매칭**: `.../coupons/` 와 `.../coupons/CouponService.java` 동일 영역.

---

## 4. 공용 파일 (충돌 위험 高)

| 파일 | 용도 |
|---|---|
| `web/src/app/router/routes/{Public,Admin,User}Routes.jsx` | route 등록 |
| `web/src/app/router/config/{routeMeta,routePath}.js` | 메타 / 경로 상수 |
| `web/src/app/store/store.js` | reducer 등록 |
| `build.gradle` | BE 의존성 |
| `web/package.json` | FE 의존성 |
| `application.properties` | 설정 |

---

## 5. Lock 생명주기

| 시점 | 동작 |
|---|---|
| dispatch 직전 | 메인이 lock Write |
| dispatch 직후 (성공/실패 무관) | 메인이 lock 삭제 |
| 세션 시작 | stale lock (started 30분+) 검사 → 사용자 보고 |

⭐ **agent 실패 시에도 lock 삭제** (영구 차단 방지).
⭐ sub-agent 는 lock 직접 read/write X. 메인만 관리.

---

## 6. 메인 체크리스트

- [ ] dispatch 전 — Glob + 충돌 검사
- [ ] 충돌 시 — 대기 큐 + 다른 비충돌 작업 진행
- [ ] 미충돌 — lock Write + dispatch
- [ ] dispatch 완료 — lock 삭제
- [ ] 세션 시작 — stale lock 검사
