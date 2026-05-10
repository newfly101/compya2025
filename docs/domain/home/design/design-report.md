# home 도메인 디자인 작업 보고서 (Step 4)

> **워크플로우**: `/code-to-design home` Step 4 — figma-plugin/domains/home.ts 작성 + entry dispatch + 빌드 검증
> **선행 산출물**: `docs/domain/home/design/design-analysis.md` (Step 2)
> **HITL 결정**: default 14건 (P-01~P-04 / D-01~D-10) 전부 채택
> **작성일**: 2026-05-11

---

## 1. 작업 모드

- [x] 신규 figma frame 생성 (home 도메인, F1~F7)
- [ ] 기존 디자인 수정

분석 산출 (Step 2) → 정의된 default 채택 → home.ts 빌더 작성 → tsc 빌드 PASS → 사용자 `Ctrl+Alt+P` 1회 대기.

---

## 2. 입력

| 종류 | 경로 |
|---|---|
| 분석 산출 | `docs/domain/home/design/design-analysis.md` |
| planner 산출 | `docs/domain/home/prd/**` |
| home 코드 baseline | `web/src/domains/home/components/HomeScreen.jsx` + 4 section + .module.scss |
| SectionBlock | `web/src/global/ui/mobile/section/SectionBlock.jsx` + SectionHeader.jsx + Section.module.scss |
| 글로벌 mixin | `web/src/global/styles/mixins/_typography.scss` |
| 글로벌 변수 | `web/src/global/styles/variables/_font.scss` |
| applayout 공유 | `figma-plugin/domains/applayout.ts` (`buildTopBarHome` D-08) |

---

## 3. 기존 디자인 시스템 분석 (요약)

| 분류 | 재사용 |
|---|---|
| Tokens (color/space/radius) | `figma-plugin/shared/tokens.ts` — 신규 정의 0건. `FS.fs11` / `FS.fs28` 매핑만 추가 (variables/_font.scss 의 기존 토큰) |
| Helpers (makeFrame/Text/Sizing) | `figma-plugin/shared/helpers.ts` — 변경 없이 그대로 사용 |
| applayout 공유 | `ApplayoutDomain.buildTopBarHome(false)` 재사용 (D-08, namespace export) |
| 신규 helper (home namespace 내부) | `buildSectionHeader(title, to?)` / `buildSectionBlock(name, header, body)` / `buildExternalSection(...)` |

---

## 4. 적용한 변경 사항 (HITL default 14건 채택)

| ID | 항목 | 결정 | 적용 위치 | 마커 |
|---|---|---|---|---|
| P-01 | 비로그인 접근 정책 | TopBar variant=home guest 1종만 | `buildF1Wrapper()` L: `ApplayoutDomain.buildTopBarHome(false)` | 🟨 |
| P-02 | NoticeSection 빈 배열 UX | 별도 empty frame X, mock 3건만 | `buildF6Notice()` mockNotices 3건 | 🟨 |
| P-03 | heroBadge `#fff` 토큰화 | `COLOR.white` raw 그대로 (이미 tokens.ts 에 정의) | `buildF2Hero()` badgeText color | 🟨 |
| P-04 | Quiz broken / thunk 실패 fallback | empty placeholder 1종만 | `buildF4Quiz()` emptyIcon + emptyText | 🟨 |
| D-01 | Hero 이미지 처리 | bgCard placeholder + `.heroPlaceholderHint` 텍스트 | `buildF2Hero()` fills + placeholderHint | 🟨 |
| D-02 | Quick 4-col grid | HORIZONTAL + layoutWrap='WRAP' + itemSpacing 8 | `buildF3Quick()` `quickMenu.layoutWrap = 'WRAP'` | 🟨 |
| D-03 | Quick 4번째 cell | 공백 cell 유지 (invisible frame 1) | `buildF3Quick()` emptyCell | 🟨 |
| D-04 | quizCard aspect 16:9 height | 224 (16:9 근사 + 4 배수) | `buildF4Quiz()` quizCard height: 224 | 🟨 |
| D-05 | Hero overlay 표현 | fills 다중 paint (bgCard solid + GRADIENT_LINEAR) | `buildF2Hero()` `hero.fills = [solid(bgCard), overlay]` | 🟨 |
| D-06 | SectionHeader `|` accent | text node ("\|" 문자) | `buildSectionHeader()` accent text | 🟨 |
| D-07 | F5/F7 외부 도메인 placeholder | H 120 + dashed border + 안내 텍스트 | `buildExternalSection()` `dashPattern: [4, 4]` | 🟨 |
| D-08 | applayout buildTopBarHome 공유 | namespace export → home 호출 | `applayout.ts` `export function buildTopBarHome(...)` | 🟨 |
| D-09 | page 배치 | applayout 옆 row 4~6 col 0~2 | `HomeDomain.run()` `startRow = 4` | 🟨 |
| D-10 | quickIcon emoji 크기 | text-page-title 22pt 확정 (mixin read 결과) | `buildF3Quick()` emoji size: FS.fs22 | ✅ 확정 |

> 강제 HITL 4 분야 (토큰 파괴적 변경 / 컴포넌트 라이브러리 구조 변경 / 레이아웃 컨벤션 변경 / 외부 자산 도입) 위반 0건.

---

## 5. 신규 정의 항목

- **신규 토큰**: 없음 (variables/_font.scss 에 정의된 `$font-size-11`, `$font-size-28` 의 namespace 매핑만 `tokens.ts` 에 추가)
- **신규 컴포넌트**: 없음 (`SectionBlock` / `SectionHeader` 는 코드 baseline 의 figma 매핑 layer 일뿐 컴포넌트 라이브러리 변경 X)
- **신규 variant**: 없음

---

## 6. 반응형 처리

- 기본 frame: `LAYOUT.mobileLg = 428px` (모바일-lg)
- tablet/PC: home wrapper 자체 폭 428 고정 — 외부에서 `MobileLayout` 의 max-width 480 wrapper 가 좌우 여백 처리 (applayout F1 동일 패턴 / 사용자 메모 `feedback_no_domain_header` 준수)
- auto-layout 규칙: F1 wrapper VERTICAL gap 0 + 자식 sections 모두 STRETCH / F2 Hero VERTICAL flex-end / F3 Quick HORIZONTAL layoutWrap=WRAP / F4~F7 SectionBlock VERTICAL gap 12 padding 16

---

## 7. Figma Plugin 실행 결과

### 7.1 빌드 결과

```
> compyafun-designer-bridge@0.1.0 build
> tsc -p tsconfig.json
(stdout 0 — strict PASS)
```

| 항목 | 값 |
|---|---|
| code.js 라인 수 | **1634 lines** |
| namespace 순서 | Tokens (L7) → Helpers (L89) → ApplayoutDomain (L219) → HomeDomain (L1038) → IIFE entry |

### 7.2 사용자 액션

```
Figma desktop → Ctrl+Alt+P (Run Last Plugin)
```

→ applayout 10 frame + home 7 frame **총 17 frame** 한 번에 생성.

home frame 배치 (D-09):
- row 4 col 0: F1 Home mobile wrapper (전체 합성)
- row 4 col 1~2: F2 Hero / F3 Quick (개별 검토용)
- row 5 col 0~2: F4 Quiz / F5 Coupon / F6 Notice
- row 6 col 0: F7 Event

---

## 8. § 9 4px Grid 사후검증 (실제 적용 후)

분석 § 6 의 예상 표 그대로 적용 — 신규 위반 0건.

| frame | 사이즈 | padding | gap | radius | 비-4배수 항목 | 처리 |
|---|---|---|---|---|---|---|
| F1 wrapper | 428 × Hug | 0 | 0 | 0 | 428=4×107 OK | OK |
| F2 hero | 428 × 160 | 20/20/16/16 | 4 (badge↔title↔sub) | badge 4 | (없음) | OK |
| F2 heroBadge | Hug × 20 | 0/8/0/8 | 0 | 4 | (없음) | OK |
| F3 quickMenu | 428 × Hug | 16/16/16/16 | 8 / counter 8 | 0 | (없음) | OK |
| F3 quickIcon | 52 × 52 | 0 | 0 | **10** (radius-xl) | radius 10 | **토큰 예외 — 유지** |
| F4 quizCard | 396 × **224** | 0 | 8 | **10** | radius 10 / **224** (16:9 보정 D-04) | 토큰 예외 + 반올림 |
| F5/F7 placeholder | 396 × 120 | 0 | 0 | **10** | radius 10 | **토큰 예외 — 유지** |
| F6 .item | 396 × Hug | 8/12/8/12 | 12 / content gap **2** | **10** | content gap **2** raw / radius 10 | 코드 baseline pin |
| F6 .dot | **6 × 6** | — | — | full | **6×6 raw** | 코드 baseline pin (4px → 너무 작음 / 8px → 비례 깨짐) |
| SectionBlock | 428 × Hug | 16/16/16/16 | 12 | 0 | (없음) | OK |

**위반 합계** (모두 figma-plugin-rules.md § 1 "예외 허용" 또는 § 9.6 "코드 baseline 우선" 으로 해결):
- raw 6 (F6 dot) × 1
- raw 2 (F6 .content gap) × 1
- radius-xl 10 × 4 (quickIcon / quizCard / placeholder / notice item)
- quizCard height 221.625 → 224 반올림 1건 (D-04)

→ 신규 위반 0건, 분석 예고 그대로 적용.

---

## 9. 사용자 확인 필요 항목

### 디자인 결정 OK 여부 (default 14건 채택 — 변경 요청 시 추가 작업)

- 🟨 P-01~04 / D-01~10 — 분석 § 5 표의 default 그대로 채택. 시각 검토 후 변경 의사 있으면 알려주세요.

### 강제 HITL 4 분야 (현재 결정 미발생 — 추후 작업 시 발생할 가능성)

- 🔴 (없음) — 본 Step 4 작업에서 발생하지 않음.

### 알려진 외부 의존 (home.ts 범위 외)

- 🟨 F5 / F7 의 실제 CouponCard / EventCard 디자인은 coupons / events 도메인 figma 작업 시 별도 처리. home 은 placeholder 만 책임.
- 🟨 F2 Hero 의 실제 `compyafun2026.jpg` 이미지 fill — 외부 자산 도입 룰 (외부 라이브러리 도입 X) 에 따라 figma 에서 수동 적용 필요.

---

## 10. 다음 단계 권고

1. **사용자 검증** — `Ctrl+Alt+P` 1회 후 figma 에서 17 frame 확인 (applayout 10 + home 7).
2. **F2 Hero 이미지** — figma 에서 `compyafun2026.jpg` 수동 paste fill (placeholder rect 자리에).
3. **추후 도메인 작업** — coupons / events / notices 도메인 figma 작업 시 home F5 / F7 / F6 의 placeholder 자리 채우기 (별도 namespace).
4. **handoff 문서** — `implementation-handoff.md` 동시 산출 (FE 작업 reference).

---

## 11. 산출물 list

| 파일 | 작업 | 라인 |
|---|---|---|
| `figma-plugin/shared/tokens.ts` | Edit — `FS.fs11`, `FS.fs15` 주석 보강, `FS.fs28` 추가 | +3 |
| `figma-plugin/domains/applayout.ts` | Edit — `buildTopBarHome` 함수 export (D-08) | +1 |
| `figma-plugin/domains/home.ts` | Write (신규) — HomeDomain namespace 전체 | 408 |
| `figma-plugin/code.ts` | Edit — `<reference home.ts>` + `await HomeDomain.run()` | +2 |
| `figma-plugin/code.js` | tsc 산출 | 1634 |
| `docs/domain/home/design/design-report.md` | Write (본 문서) | — |
| `docs/domain/home/design/implementation-handoff.md` | Write (다음 산출) | — |

---

## 12. 사용자 figma 진리 모드 sync 라운드 (2026-05-11)

> **모드 전환**: figma 진리 모드 — 사용자가 직접 만든 figma (node 2:2) 를 진리로 삼아 home.ts 재작성.
> 트리거: 사용자 — "agent 그린거가 자기 디자인이랑 다르게 생겼다"
> 별도 분석: `docs/domain/home/design/sync-analysis.md` 참조.

### 변경 요약

| 영역 | 이전 (agent figma 217:1537) | 진리 (사용자 figma 2:2) |
|---|---|---|
| wrapper width | 428 | **375** |
| F2 Hero | 160h, badge bottom, 큰 padding | **104h, badge top-left 14,14, compact** |
| F3 QuickNav | 3-cell + empty, item card X | **4-cell 79.75×88, item 자체 카드 (bgCard+border+radius)** |
| F4 Quiz | empty placeholder | **343×186 image card + 안내 텍스트** |
| F5 Coupon | dashed placeholder rect | **가로 스크롤 row, 200×104 카드 × 3** |
| F6 Notice | dot 좌측 + title + sub + date | **title 좌+date 우 / dot+sub 하단** |
| F7 Event | dashed placeholder rect | **2-col 167.5×124, thumb 72h + 진행중 badge** |
| F8 Community | 없음 | **신규 — 343×52 × 3, HOT/NEW badge + chevron** |
| F9 Tips | 없음 | **신규 — 343×72 × 3, left 3px brand + 카테고리 라벨** |

### 토큰 / 라이브러리 영향

- Tokens namespace 값 정의 변경 **없음** (모든 색이 raw 매칭)
- 신규 inline raw 색 (Tokens 추가 보류): `#d9d3e0`, `#7c6f8f`, `#e84141`, `#ffd9d9`, `#3c1e50`, `#19284b` 등 — 다음 라운드에 토큰화 검토 🟨
- 외부 자산 (히어로/퀴즈/이벤트 썸네일) = color placeholder rect 로 처리 🟨
- 강제 HITL 4 분야 위반 **없음**

### code.ts entry 변경

`ApplayoutDomain.run()` 호출 일시 **비활성** — 사용자 짜증 ("주석처리 했는데 figma 에서 같이 나옴") 해결.
이제 `Ctrl+Alt+P` 실행 시 home 도메인 frame 만 생성됨 (applayout frame 동반 X).

### shared 보강

`Helpers.TextOpts` 에 `layoutGrow?: number` 필드 추가 — text node 에 flex:1 효과 적용 가능 (Notice/Community item 의 title 등에서 사용).

### 산출 검증

| 항목 | 값 |
|---|---|
| 빌드 | tsc PASS |
| code.js | **2069 lines** |
| home 단독 frame 수 | 9 (F1 wrapper + F2~F9 개별) |
| applayout frame 수 | 0 (run 비활성) |

