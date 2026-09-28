# 릴리스 절차 · 태그 · 브랜치

> 판단표·커밋 표기는 `.claude/rules/common/commit-version.md`. 배경·세대 매트릭스·미결은 `docs/decisions/0002-versioning-two-axes.md`. CHANGELOG 는 루트 `CHANGELOG.md`.

## 5. 두 버전 매핑

| 어디에 | 무엇을 | 형식 |
|---|---|---|
| CHANGELOG 섹션 제목 | 기능 버전 + 플랫폼 버전 | `## [v2.1.0] (platform-2.0) — 2026-10-01` |
| 기능 태그 annotation | 첫 줄에 플랫폼 버전 명시 | `platform: platform-2.0` |
| 플랫폼 태그 annotation | 도입된 기능 버전 명시 | `release: v2.1.0` |
| 사이트 표기 (선택) | 이용자에게는 기능 버전만 | `v2.1.0` |

- 플랫폼만 바뀌고 기능 변화가 없는 릴리스 → 기능 버전은 **PATCH 만 올리거나 그대로** 두고 `platform-X.Y` 태그만 단다. CHANGELOG 에는 `[platform-3.0]` 단독 섹션.
- 기능 MAJOR 와 플랫폼 MAJOR 를 **같은 커밋**에 동시에 찍을 수 있다 (예: `v3.0.0 (platform-3.0)`).

```bash
# 기능 릴리스 태그 (annotated 필수)
git tag -a v2.1.0 -m "v2.1.0 (platform-2.0)" -m "platform: platform-2.0" -m "요약: 선수 백과 리스트형 완성"
# 플랫폼 세대 태그
git tag -a platform-3.0 -m "platform-3.0" -m "release: v2.3.0" -m "요약: FE TypeScript 도입"
```

---

## 6. git 태그 · 브랜치

### 태그 네임스페이스

| 패턴 | 용도 | 예 |
|---|---|---|
| `vX.Y.Z` | 기능 릴리스 | `v2.0.0`, `v2.1.0`, `v2.1.1` |
| `vX.Y.Z-rc.N` | (선택) 사전 릴리스 | `v2.1.0-rc.1` |
| `platform-X.Y` | 플랫폼 세대/구조 변경 | `platform-2.0`, `platform-2.1` |

- **annotated 태그만** (`git tag -a`). lightweight 태그 금지.
- 태그는 **master 에 머지된 커밋**에만 단다. 태그 이동·삭제(force) 금지 — 잘못 달았으면 다음 PATCH 로 새로 단다.
- 태그 push 는 명시적으로: `git push origin v2.1.0`.

### 브랜치 전략

| 브랜치 | 역할 | 수명 |
|---|---|---|
| `master` | 운영 배포 기준 (FE 는 push 시 자동 배포) | 영구 |
| `dev` | 통합 확인용 (원격에 존재, 현재 master 와 동일 커밋) | 영구 — 운용 여부 § 9 HITL |
| `feat/{도메인}-{요약}` | 기능 작업 → master 머지 | 짧게 (수일) |
| `fix/{도메인}-{요약}` | 버그 수정 | 짧게 |
| `refactor/platform-{N}-{요약}` | 플랫폼 MAJOR 장기 작업 (예: `refactor/platform-3-typescript`) | 세대 전환 완료 시 머지 후 삭제 |
| `claude/*` | 자동 agent 작업 브랜치 | PR 머지 후 삭제 |

- 도메인 이름은 CLAUDE.md § 6 의 살아있는 도메인만 쓴다 (`home` `coupons` `events` `notices` `users` `quiz` `authentication` `historyLegend` `community` `admin`).
- 장기 리팩터 브랜치는 master 를 주기적으로 merge 받아 격차를 줄인다. 기능 작업을 장기 브랜치에 섞지 않는다.

### 기존 `v2.0.0-refactor-mobile` 해석

| 항목 | 정리 |
|---|---|
| 의미 | v1(PC) → v2(모바일) 전환 = **기능 MAJOR v2 + platform-2 세대 전환**을 한 브랜치에서 진행한 옛 방식 |
| 현재 상태 | 원격에는 `master`, `dev` 만 보임 (2026-09-25 `git ls-remote`). 로컬 문서에만 이름이 남아 있음 |
| 앞으로 | 새 이름 규칙(`refactor/platform-{N}-…`)으로 **대체**. 브랜치명에 기능 버전(`v2.0.0-`)을 넣지 않는다 — 버전은 태그로만 표시 |
| 보존 | 브랜치가 어딘가 남아 있다면 삭제 대신 `v2.0.0` 태그로 끝점을 고정 → 브랜치 정리 여부는 § 9 HITL |

---

## 7. 버전 필드 동기화 정책 (정책만 — 파일 변경은 미적용)

| 파일 | 현재 값 | 정책 |
|---|---|---|
| `web/package.json` `version` | `"0.1.1"` | **기능 버전과 동일**하게 유지 (`"2.1.0"`, `v` 접두사 없음). 릴리스 커밋에서만 변경 |
| `build.gradle` `version` | `''` (빈 값) | **기능 버전과 동일** (`'2.1.0'`). BE 산출 jar 이름에 반영됨 |
| 플랫폼 버전 | 파일에 없음 | 코드 파일에 넣지 않는다. 태그 + CHANGELOG 로만 관리 |

- 단일 진실 원천 = **git 태그**. 파일 값은 태그를 따라간다 (반대 방향 금지).
- FE/BE 가 한 릴리스에서 한쪽만 바뀌어도 **두 파일 모두 같은 값**으로 맞춘다 (저장소 1개 = 버전 1개).

### 후속 작업 (미적용 — ops 트랙에서 별도 진행)

- [ ] `web/package.json` `version` → `"2.0.0"` 로 정렬
- [ ] `build.gradle` `version` → `'2.0.0'` 설정 (jar 이름 변경 영향 → `deploy-be.yml`·수동 배포 스크립트 확인 후)
- [ ] 기준선 태그 `v2.0.0`, `platform-2.0` 부착 (대상 커밋 결정 — § 9 HITL)
- [ ] (선택) FE 빌드에 버전 주입 (`import.meta.env` 등) → 푸터/사이트 소개에 기능 버전 노출
- [ ] (선택) `deploy-*.yml` 에 태그 push 트리거 추가 여부 검토

---

## 8. 릴리스 절차 체크리스트

1. **버전 결정**
   - [ ] 직전 태그 이후 커밋 목록 확인: `git log --oneline v2.0.0..master`
   - [ ] § 2 판단표로 기능 bump(MAJOR/MINOR/PATCH/없음) + 플랫폼 bump(MAJOR/MINOR/없음) 결정
2. **CHANGELOG 갱신**
   - [ ] `CHANGELOG.md` 의 `[Unreleased]` 내용을 새 섹션 `## [vX.Y.Z] (platform-A.B) — YYYY-MM-DD` 로 이동
   - [ ] 이용자 관점 문장으로 작성 (커밋 제목 복붙 금지), 커밋 해시는 대표 1~3개만
   - [ ] 플랫폼 bump 시 § 4 매트릭스 갱신 + 해당 컨벤션 문서 개정 여부 확인
   - > agent 워크플로우에서는 각 트랙 agent 완료 보고 시점에 **메인 세션**이 `[Unreleased]` 를 갱신한다 (CLAUDE.md § 2-7). 릴리스 섹션 확정·태깅·버전 필드 변경은 사용자 확인 후 메인 세션이 진행
3. **버전 필드** (§ 7 후속 작업 적용 이후부터)
   - [ ] `web/package.json`, `build.gradle` version 동기화
   - [ ] 커밋: `[리뉴얼] [chore] 릴리스 vX.Y.Z`
4. **태그**
   - [ ] master 머지 확인 → `git tag -a vX.Y.Z …` (+ 필요 시 `platform-A.B`)
   - [ ] `git push origin vX.Y.Z`
5. **배포**
   - [ ] FE: master push 로 `deploy-fe.yml` 자동 실행 확인
   - [ ] BE: `deploy-be.yml` 수동 dispatch (또는 수동 배포) — 변경 있을 때만
   - [ ] DB: 스키마 변경 있으면 `sql/V3/` DDL 을 배포 **전** 운영 적용 (자동 실행 금지 파일 주의)
6. **사후**
   - [ ] master 에서 생성 스크립트 재실행: `python .claude/scripts/build-traceability.py` · `python .claude/scripts/build-readme-table.py` · `python .claude/scripts/docs-check.py`
   - [ ] 운영 화면 확인 후 CHANGELOG 에 이상 없음 확인, 문제 시 PATCH 릴리스

---

## 10. 트랙 연동 — 4트랙이 완료 시 무엇을 기록하나

| 트랙 | 완료 시 기록 | 위치 |
|---|---|---|
| **develop** | 기능 변경이면 `Added`/`Changed`/`Fixed`, 플랫폼 변경이면 `Platform` | `CHANGELOG.md` `[Unreleased]` |
| **planner** | 기획 확정만으로는 기록 안 함 — 실제 반영(develop 완료)까지 대기 | — |
| **designer** | 디자인 확정만으로는 기록 안 함 — 코드 반영 시점에 develop 이 기록 | — |
| **ops** | 이용자 무관이면 `Internal`, 스키마 세대 교체 등 구조 변경이면 `Platform` | `CHANGELOG.md` `[Unreleased]` |

- 기획·디자인 단계는 CHANGELOG 를 직접 건드리지 않는다 — 코드로 실현된 시점(develop)에 한 번만 기록해 중복을 막는다.

---

