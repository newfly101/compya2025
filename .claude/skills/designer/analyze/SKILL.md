---
name: designer-analyze
description: Figma + 코드 + 기획자 산출물 분석 → 디자인 시스템 추출 + mismatch 식별. 산출물 docs/domain/{name}/design/design-analysis.md. 다음 skill (designer-plugin-code) 의 입력.
---

# Skill: designer-analyze

10년차 디자이너 시점에서 **현재 디자인 시스템 + 코드 + 기획자 산출물** 을 분석한다. 결과는 `design-analysis.md` 단일 파일로 정리해서 다음 skill (`designer-plugin-code`) 의 입력으로 사용.

## 1. 목적

- Figma 디자인 시스템 (토큰 / 컴포넌트 / 레이아웃 컨벤션) 을 추출한다
- 코드의 실제 토큰/컴포넌트 사용 현황을 파악한다 (있다면)
- 기획자 산출물 (`docs/domain/{name}/prd/`) 과의 정합 여부를 본다
- ★ 재사용 가능 자산 vs 신규 정의 필요 항목을 분리한다 (다음 skill 의 결정 기준)
- ★ Figma ↔ 코드 mismatch 를 명시한다 (있다면)

**산출물**: `docs/domain/{feature-or-domain-name}/design/design-analysis.md`

## 2. 입력 (input)

### 필수
- 기존 Figma URL (file-key + 분석 대상 node-id)
- 작업 단위 이름 (`{feature-or-domain-name}`)

### 선택 (있으면 더 깊은 분석)
- 기획자 산출물 디렉토리 (`docs/domain/{name}/prd/feature-spec.md`, `edge-cases.md` 등)
- 기존 코드 디렉토리 (`web/src/domains/{domain}/`, `web/src/global/styles/variables/`)
- 사용자 요구 자유 서술 (한 단락)

### 호출 args 예시
```
name: coupons-admin, figma-url: https://www.figma.com/design/.../?node-id=212-3, plan-dir: docs/domain/coupons-admin/prd/, code-dir: web/src/domains/coupons/
```

## 3. 절차 (steps)

### Step 1 — 입력 확인
- `name`, `figma-url` 필수. 누락 시 사용자에게 즉시 질문 후 중단
- 다른 args 는 있는 만큼만 사용

### Step 2 — Figma read

1. URL 파싱 — `file-key` + `node-id` 추출 (URL `212-3` → API `212:3`)
2. `mcp__figma-dev-mode__get_design_context` — 디자인 토큰 / 노드 구조
3. `mcp__figma-dev-mode__get_metadata` — frame 메타 (이름 / 사이즈 / variants)
4. `mcp__figma-dev-mode__get_screenshot` — 시각 캡처 (분석 보고서 임베드용)

추출 항목:
- **Color Tokens** — 사용된 hex 값 + 빈도
- **Typography** — fontFamily / weight / size / lineHeight 별
- **Spacing / Padding / Radius** — auto-layout gap / padding / cornerRadius
- **Components** — INSTANCE / COMPONENT 이름 + variants + 사용 빈도
- **Layout 컨벤션** — frame 사이즈 (375 / 390 / 414) / 글로벌 TopBar / BottomNav

### Step 3 — 코드 read (있다면)

1. `Glob` / `Read` 로 `web/src/global/styles/variables/` SCSS 변수 추출
2. `Grep` 으로 사용처 빈도 (e.g. `\$color-accent` 사용처)
3. 글로벌 컴포넌트 식별 (`web/src/global/ui/`, `web/src/app/wrapper/`)
4. 도메인 컴포넌트 (`web/src/domains/{domain}/`) 의 토큰 사용 패턴

### Step 4 — 기획자 산출물 read (있다면)

`docs/domain/{name}/prd/` 의 다음 파일 우선순위:
- `feature-spec.md` ⭐ — 화면 분기 / 인터랙션
- `edge-cases.md` — 예외 화면 (empty / error / overflow)
- `requirements.md` — 화면 요소 / NFR
- `policy-draft.md` — 정책 (loading / empty 결정)

추출 항목:
- 필요한 화면 목록 + 진입 경로
- 각 화면의 상태 분기 (Given/When/Then)
- 예외 케이스

### Step 5 — 분석 합성

추출 결과를 산출물 템플릿에 채움. 다음 항목 명시:

1. **재사용 가능** — 기존 토큰 / 컴포넌트로 충당 가능한 항목
2. **신규 정의 필요** — 기존 자산으로 충당 불가능 (이유 + 마커)
3. **Figma ↔ 코드 mismatch** — 어느 쪽이 source of truth 인지 미정 (있다면 🔴)
4. **HITL 4 분야 영향** — 토큰 파괴적 변경 / 컴포넌트 라이브러리 구조 변경 등 사전 식별

### Step 6 — 산출물 Write

- `docs/domain/{name}/design/design-analysis.md` 에 Write
- 부모 디렉토리 없으면 자동 생성

### Step 7 — 다음 skill 안내

보고:
- 산출물 경로
- 재사용 / 신규 항목 수
- 마커 분포 (🔴 / 🟨 / ❓)
- 다음 skill: `designer-plugin-code` — 분석 결과 토대로 figma-plugin/code.ts 작성 + 빌드

## 4. 템플릿 (산출물)

```markdown
# Design Analysis — {도메인/기능명}

> 작성일: YYYY-MM-DD
> Figma URL: ...
> 기획자 산출물: docs/domain/{name}/prd/...
> 코드 참조: web/src/...

## 1. Figma 디자인 시스템 (현행)

### 1.1 Color Tokens (top N)
| hex | 빈도 | 추정 역할 | SCSS 변수명 (있다면) |
|---|---|---|---|
| `#a78bfa` | 24 | accent | `$color-accent` |
| ... | ... | ... | ... |

### 1.2 Typography
| family | style | size | lineHeight | 빈도 |
|---|---|---|---|---|
| Inter | Regular | 14 | 20px | 18 |
| ... | ... | ... | ... | ... |

### 1.3 Spacing / Padding / Radius
- spacing(gap): 4 / 8 / 12 / 16 / 24
- padding:     16 / 24
- radius:      6 / 8 / 12

### 1.4 Components (top N)
| 이름 | 타입 | variants | 빈도 |
|---|---|---|---|
| Button | COMPONENT_SET | primary/secondary/danger × sm/md/lg | 12 |

### 1.5 Layout 컨벤션
- 기본 frame 사이즈: 375 (medium mobile)
- 글로벌 TopBar: 있음 (높이 56px)
- 글로벌 BottomNav: 없음
- 외곽 padding: 16 / 24

## 2. 코드 현황 (있다면)

### 2.1 SCSS 변수 매핑
| Figma 토큰 | SCSS 변수 | 정합 |
|---|---|---|
| `#a78bfa` | `$color-accent` | ✅ |
| `#3B82F6` | (없음) | ❌ 신규 정의 필요 |

### 2.2 글로벌 컴포넌트
- `<MobileLayout>` — 외곽 wrapper + TopBar
- `<Button>` — variants: primary / secondary
- ...

### 2.3 도메인 컴포넌트
- `<CouponCard>` — coupon 도메인 (`web/src/domains/coupons/`)

## 3. 기획자 산출물 매핑 (있다면)

### 3.1 화면 목록
| 화면 | URL | 진입 | feature-spec.md 시나리오 |
|---|---|---|---|
| AdminCouponList | /admin/coupons | 어드민 홈 → 쿠폰 관리 | FN-ADM-1 |
| ... | ... | ... | ... |

### 3.2 상태 분기 (edge-cases.md 매핑)
- empty / loading / error / normal / overflow / 권한 없음 / ...

## 4. 재사용 vs 신규

### 4.1 재사용 가능 (기존 자산으로 충당)
- ✅ `<MobileLayout>` (글로벌 TopBar 포함)
- ✅ Button primary/secondary variants
- ✅ Color: `$color-accent` (#a78bfa) — admin 헤더에 사용
- ✅ Typography: Inter Bold 18px (제목)

### 4.2 신규 정의 필요
| 항목 | 사유 | 마커 |
|---|---|---|
| `<AdminCard>` | 어드민 리스트용 카드 (좌측 status border + period 메타) | 🟨 가정 |
| `<FAB>` 컴포넌트 | 우하단 floating button — 글로벌 컴포넌트 후보 | 🟨 가정 |
| `<FilterChipRow>` | 가로 스크롤 필터 칩 — 글로벌 컴포넌트 후보 | 🟨 가정 |

## 5. Figma ↔ 코드 mismatch (있다면)

| 항목 | Figma | 코드 | source of truth | 마커 |
|---|---|---|---|---|
| accent color | `#a78bfa` | `#a78bfa` (`$color-accent`) | 정합 ✅ | — |
| ... | ... | ... | ... | ... |

## 6. HITL 4 분야 사전 식별

- 토큰 파괴적 변경: (없음 / 있다면 🔴 명시)
- 컴포넌트 라이브러리 구조 변경: (없음 / 있다면 🔴)
- 레이아웃 컨벤션 변경: (없음 / 있다면 🔴)
- 외부 자산 도입: (없음 / 있다면 🔴)

## 7. 사용자 확인 필요 항목

- [ ] 🔴 위험 마커 — 사용자 답변 필수
- [ ] 🟨 가정 마커 — default 검토 + 수정 권고 (있다면)
- [ ] ❓ 미정 마커 — TBD 항목

## 8. 다음 단계

- [ ] `designer-plugin-code` skill — 본 분석 토대로 figma-plugin/code.ts 작성 + 빌드

## 9. 변경 이력

| 날짜 | 변경 | 변경자 |
|---|---|---|
| YYYY-MM-DD | 초안 작성 | designer-analyze |
```

## 5. 검증 (산출물 완료 기준)

- [ ] Figma 디자인 시스템 추출 (Color / Typography / Spacing / Components / Layout)
- [ ] 코드 현황 작성 (있다면 SCSS 매핑 + 글로벌 컴포넌트 list)
- [ ] 기획자 산출물 매핑 (있다면 화면 목록 + 상태 분기)
- [ ] 재사용 / 신규 분리 (각 ≥ 0 항목, 빈 경우 명시)
- [ ] Figma ↔ 코드 mismatch (있다면 source of truth 미정 시 🔴)
- [ ] HITL 4 분야 사전 식별

## 6. HITL (Human-in-the-Loop) 지점

### 강제 HITL (자동 진행 금지)

본 skill 의 분석 결과 중 다음 분야는 사용자 답변 전 다음 skill 진행 금지 (마커 표시까지만):
- 토큰 파괴적 변경 필요 (예: 기존 `#a78bfa` 를 다른 hex 로 변경)
- 컴포넌트 라이브러리 구조 변경 필요 (예: 기존 Button variant 제거)
- 레이아웃 컨벤션 변경 필요 (예: BottomNav 도입)
- 외부 자산 도입 필요 (예: 라이선스 불명확 아이콘)

→ 위 항목은 🔴 마커 명시. 다음 skill (`designer-plugin-code`) 진행 전 사용자 확정.

### 완화 HITL (가정/미정 표시 후 진행)

- 신규 토큰 추가 (기존 값과 충돌 X)
- 기존 컴포넌트 variant 추가
- placeholder 콘텐츠
- icon / illustration 의 일반적인 메타포 선택

### 마커

- 🟨 가정: default. 사용자 수정 가능
- ❓ 미정: 결정 필요. 사용자 답변 후 확정
- 🔴 위험: 강제 HITL — 사용자 답변 전 다음 skill 진행 X

## 7. 다음 skill 추천

- **표준**: `designer-plugin-code` — design-analysis.md 토대로 figma-plugin/code.ts 작성 + 빌드 + 사용자 액션 안내

## 8. 예시

### 예시 (신규 어드민 화면)
```
입력: name: coupons-admin, figma-url: https://www.figma.com/design/.../?node-id=212-3, plan-dir: docs/domain/coupons-admin/prd/

→ Figma read (mcp__figma-dev-mode__*)
→ 디자인 시스템 추출: 보라 #a78bfa, Inter, padding 16/24, radius 8
→ 코드 read: web/src/global/styles/variables/_color.scss → $color-accent 매핑 확인
→ feature-spec.md → AdminCouponList / Form 화면 명세 확인
→ 재사용: MobileLayout, Button, $color-accent
→ 신규: AdminCard, FAB, FilterChipRow (글로벌 후보, 🟨 가정)
→ 산출물: docs/domain/coupons-admin/design/design-analysis.md
→ 다음: designer-plugin-code
```

## 9. 작성 원칙

- **사실 baseline 우선** — 코드/Figma 와 모순되는 추측 금지
- **재사용 > 신규 정의** — 항상 기존 자산 우선 검토
- **표 우선, 산문 최소** — 가독성
- **마커 일관 적용** — 🟨/❓/🔴
- **mismatch 정직 명시** — Figma ↔ 코드 차이 숨기지 말 것
