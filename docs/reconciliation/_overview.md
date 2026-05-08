# _overview.md — 프로젝트 전체 reconciliation 종합

> 입력: `fe-be-mismatch.md`, `be-db-mismatch.md`, `dual-table-usage.md`, `dead-confirmed.md`, `risk-and-priority.md`
> 본 문서는 위 5개 산출물의 종합 + product 의사결정 리스트 + 모바일 리뉴얼 진행 순서.

---

## 1. 한눈에 보는 reconciliation 결과

### 매핑 정합성

- BE 컨트롤러 30개 / endpoint 86개 (V1+V2)
- DB 테이블 49개 (V1 30 + V2 19) / mapper 25개 / statement 145개
- FE thunk 약 50개 / 활성 라우트 9개 (모바일 단일 레이아웃)

| 매핑 상태 | 개수 | 비고 |
|---|---:|---|
| 🟢 FE↔BE 정상 매칭 | 약 22개 (public + admin notice/playerCard 일부) | |
| 🟡 라우트 주석 / admin 주석 매칭 | 약 6개 | Owner 정책: 보존 |
| 🔴 FE_ONLY (path/method 미스매치) | 약 14개 (admin community / admin quiz / quiz public) | spot-check 결과 spec 그대로 — 실제 미스매치 확정 |
| 🔴 BE_ONLY (FE 미연결) | 35+개 (community 도메인 풀세트, V2 player_card 일부) | 모바일 community BE 연결이 다음 마일스톤 |
| ⚫ DEAD_BOTH | 2개 (V2 fun_player_card 빈 컨트롤러, kbo matches detail) | |

### dual table 사용 분포 (16 pair)

- 🟢 신규 만 사용 (정상 완료): 7-8 pair
- 🟡 legacy 만 사용: 5 pair (player_legend 묶음 + teams)
- 🟠 양쪽 살아있음, single source 미정: 3 pair (player_card 묶음)
- 🔴 dual-write 갭 (정책↔코드 불일치): 1 pair (★ **coupons**)
- ⚫ 어디서도 안 씀: 2 pair

### dead 확정

- 즉시 정리 가능 (영향 0): FE 8개 (`domains/mobile/`, `wrapper/parts/Header,Footer`, `domains/admin/store/*`, `data/{Cafe,Fun,History}Notice.js`, `core/filters/CoreVisible/Status*.jsx`) + BE 일부 (`AdminPlayerCardController` 주석 핸들러 6개, `.http` stale)
- 보존 (Owner 정책): legacy PC 도메인 (dictionary, simulate, kbo, community user feature/components)
- runtime 검증 후 결정: V1 legacy 운영 데이터 (users, events 등 8개), `skill_pitcher_grade_stat`, `legend_pitcher_pitch_slot`

---

## 2. ★ Product 의사결정 리스트 (runtime-analyzer 진입 전 해소 필수)

> 본 reconciliation 단계에서는 단정 불가, Owner 결정 필요한 항목만 정리.

### 🔥 결정 1: coupon dual-write 정책

- **현황**: Owner 진술 ("의도된 dual-write") ↔ 실 코드 (V2-only write + V1 단건 read fallback) 불일치
- **결정 옵션**:
  - (A) dual-write 굳히기 — service 레이어에 `coupons` INSERT/UPDATE 추가
  - (B) 단방향 정리 — `selectCouponById` 도 site_coupons 로 변경 + V1 `coupons` 테이블 폐기
- **차단성**: ★ admin coupon 화면 신규 작업 차단. public coupons 화면은 영향 없음
- **선결**: runtime-analyzer 가 운영 환경 `coupons` row 수 + `site_coupons` row 수 비교 필수 (0/N 패턴 따라 결정 방향 다름)

### 🔥 결정 2: `contact` ↔ `discipline` 컬럼 의미

- **현황**: V1 `player_card_hitter_attributes.contact` ↔ V2 `fun_player_card_hitter_stats.discipline`. 코멘트 양쪽 "선구" 동일하지만 영문 의미 명백히 다름 (contact = 콘택트, discipline = 선구안)
- **결정 옵션**:
  - (A) 단순 영문 표기 정정 — 의미 동일 ("선구"). V1 데이터 그대로 V2 마이그
  - (B) 능력치 재정의 — contact 폐기, discipline 신설. V1 데이터 폐기 또는 별도 능력치로 보존
- **차단성**: ★ 모바일 player_card 화면 신규 작업 시 차단

### 🔥 결정 3: `MobileHomePage` / `domains/mobile/` 폐기

- **현황**: `domains/mobile/` 전체 import 0건. `MobileHomePage.jsx` 는 placeholder ("어????????????"). 활성 진입은 `domains/home/components/HomeScreen`
- **결정 옵션**:
  - (A) 즉시 폐기 (권장)
  - (B) 공용 컴포넌트로 일부 승격 (구체적 후보 컴포넌트 검토 필요)
  - (C) `domains/home/` 으로 흡수 (역할 중복분만)
- **차단성**: ◐ 모바일 리뉴얼 직접 차단 아니지만, 도메인 정리 안 하면 신규 작업 시 어디에 둘지 헷갈림

### 🚨 결정 4: legacy PC 도메인 (dictionary / simulate / kbo) 운명

- **현황**: 라우트 주석 처리. Owner 정책상 코드 보존 (기능 참고용). 단 store 등록 (`store.js`) 에 `dictionaryReducer / simulateReducer / kboReducer` 가 상시 로딩 → 번들 사이즈 영향
- **결정 옵션**:
  - (A) 유지 (Owner 현행 정책)
  - (B) 동적 import (lazy) 로 번들 최적화
  - (C) 폐기 (모바일 재작성 안 함)
- **차단성**: ◐ 모바일 진행 차단 아님. 정리 라운드에서 결정

### ⚠ 결정 5: V2 통폐합 작업 진입 시점 (LEGEND 흡수 + fun_player_card 활성화)

- **현황**: V2 fun_player_card 모듈 작동 불능 상태 (DTO + namespace + fun_teams 시드 + service 통합 4건 미완)
- **결정 옵션**:
  - (A) 모바일 리뉴얼 마무리 후 V2 통폐합 라운드 (Owner 현행 의도)
  - (B) 모바일 player_card 화면이 figma 에 등장하면 즉시 V2 fix 진입
- **차단성**: figma 에 player_card 화면 있는지 여부에 따라 결정. 도착 시 즉시 결정 필요

---

## 3. 모바일 리뉴얼 권장 진행 순서 (의존성 그래프)

```
[Phase 0 — 즉시 차단 fix (figma-spec-validator 진입 전 필수)]
  ├─ R3 auth slice shape 정리 (state.auth.authority + useRole 오타)
  │   └─ blast radius: 모든 인증 분기. AuthGuard / TopBar / UserProfile 회귀 테스트
  ├─ R9-부분 quiz public path 수정 + HomeScreen quiz dispatch 추가
  │   └─ HomeScreen 빈 퀴즈 카드 해소
  └─ Dead 코드 즉시 정리 (영향 0): domains/mobile, wrapper/parts/Header/Footer, domains/admin/store/*, data/Cafe/Fun/History.js, core/filters/CoreVisible/Status

[Phase 1 — 보안 별개 fix (모바일 차단 무관, 우선순위 별개)]
  ├─ R4 /api/upload/events 가드 추가
  ├─ R5 /api/dev/test-token 가드 또는 비활성화
  └─ R6 @PreAuthorize / @EnableMethodSecurity 정리

[Phase 2 — figma-spec-validator 진입 (화면 단위 정합성 검증)]
  ├─ HomeScreen — Phase 0 후 즉시 가능
  ├─ CommunityScreen / CategoryScreen — mock shape ↔ BE shape 검증 (R10)
  ├─ HistoryModeScreen — 안정 (mock 운영 OK)
  └─ 모바일 player_card 화면 (figma 도착 시) — ★ Phase 3 차단

[Phase 3 — 차단 해소 후 진입 가능한 작업]
  ├─ 모바일 community BE 연결 (R7 본인 검증 + 35+ BE_ONLY 연결)
  ├─ 모바일 player_card 화면 (R2 V2 모듈 fix 4건 + R8 contact/discipline 결정 후)
  ├─ admin community / admin quiz path 정렬 (R9 나머지 — admin 작업 시)
  └─ V2 통폐합 라운드 (LEGEND ↔ fun_player_card 통합 + coupon dual-write 결정)

[Phase 4 — 정리 라운드 (모바일 리뉴얼 후)]
  ├─ legacy PC 도메인 (dictionary, simulate, kbo) 운명 결정
  ├─ V1 legacy 운영 데이터 처리 (users, events 등 8개)
  └─ store 동적 import 최적화
```

### 의존성 상세

- **R3 (auth shape)** → 모든 phase 의 prerequisite. 인증 동작 깨지면 figma-spec-validator 가 화면 마운트 자체 못 함
- **R10 (mock-only 정합성)** → community / historyMode 화면 figma 검증 진입 전 mock shape vs BE response shape 검증 필수
- **R2 (V2 player_card)** + **R8 (contact/discipline)** → 한 묶음. 모바일 player_card 화면 figma 도착 시 동시 해소 필요
- **R1 (coupon dual-write)** → admin coupon 화면 작업 분리 가능. 모바일 메인 진행에 영향 없음 (public 화면은 read 만)
- **R7 (community 본인 검증)** → 모바일 community BE 연결 작업과 같은 라운드에서 처리

---

## 4. runtime-analyzer 단계 진입 전 체크리스트

| 항목 | 책임 | 상태 |
|---|---|---|
| 결정 1 (coupon dual-write) | Owner | ☐ runtime row 수 결과 후 결정 |
| 결정 2 (contact↔discipline) | Owner | ☐ 도메인 의도 명확화 |
| 결정 3 (MobileHomePage 폐기) | Owner | ☐ 단순 결정 |
| 결정 4 (legacy PC 도메인) | Owner | ☐ 정리 라운드까지 보류 OK |
| 결정 5 (V2 통폐합 진입) | Owner | ☐ figma 결과 따라 |
| R3 auth shape 정리 | 개발 | ☐ 즉시 진행 권장 |
| R4, R5 보안 fix | 개발 | ☐ 보안 라운드 별개 |
| R9 quiz path + dispatch | 개발 | ☐ HomeScreen 작업 시 |
| Dead 코드 정리 | 개발 | ☐ 즉시 가능 |

---

## 5. runtime-analyzer 가 우선 검증해야 할 항목 (runtime-only 신호)

reconciliation 단에서 spec 만으로는 결정 불가, runtime 데이터 필요 항목:

1. **coupons vs site_coupons row 수 비교** (★ critical) — 결정 1 의 prerequisite
2. **fun_teams row 수** — 0 추정. 0이면 V2 player_card INSERT 시 FK 위반
3. **player_card vs fun_player_card row 수** — single source of truth 결정 prerequisite
4. **coach 계열 3 테이블 row 수** — Owner 진술 ("BE 미연결") 검증 (BE wired 인 건 확정. 운영 데이터 0이면 진술과 일부 일치)
5. **skill_pitcher_grade_stat row 수** — orphan 가능성 검증
6. **legend_pitcher_pitch_slot row 수** — read-only 마스터 데이터 가능성 검증
7. **V1 legacy 운영 데이터** (users, events, boards, posts 등 8개) row 수 — 마이그 완료성 검증
8. **kbo_* 5개 (games 외) row 수** — 0 추정 검증
9. **fun/playerCard mapper namespace mismatch 가 실제 호출 시 BindingException 발생하는지** — 호출 경로 없으니 정적 검증만 가능, runtime 시작 시 MyBatis 부팅 로그 확인

---

## 6. 산출물 cross-reference

| 파일 | 핵심 내용 |
|---|---|
| `fe-be-mismatch.md` | FE 호출 ↔ BE endpoint 59 row 비교표. path/method 미스매치 14건 정리 |
| `be-db-mismatch.md` | BE service ↔ DB mapper/table 매핑 + coupon dual-write 갭 + V2 fun_player_card 작동 불능 |
| `dual-table-usage.md` | 16 pair 사용 분포. 5 pair 결정 필요 항목 식별 |
| `dead-confirmed.md` | FE/BE/DB 3쪽 dead 후보 cross-check. 즉시 정리 가능 9건 + 보존 정책 5건 |
| `risk-and-priority.md` | TOP 10 위험 + 차단성 + figma-spec-validator 화면 단위 신호 |
| `_overview.md` | 종합 + product 결정 리스트 + 진행 순서 |
