# home — 사용자 figma 진리 모드 sync 차이 분석

> **모드**: figma 진리 모드 — 사용자가 직접 만든 figma (node 2:2) 를 진리로 삼아 home.ts 재작성.
> **이전 agent figma**: node 217:1537 (이전 agent home.ts 출력 결과)
> **작성일**: 2026-05-11
> **사유**: 사용자 — "agent 그린거가 자기 디자인이랑 다르게 생겼다"

---

## 1. 입력 (figma 두 노드)

| 역할 | node-id | width | layout 방식 | 비고 |
|---|---|---|---|---|
| **진리** (사용자) | `2:2` | 375 | absolute positioning + 픽셀 좌표 | "Mobile Home — 컴프야펀" |
| **이전 agent** | `217:1537` | 428 | auto-layout flex 기반 | "F1 Home mobile wrapper" |

file-key: `VCVQzOpSIpwpZw11gxG7N1`

---

## 2. 차이 핵심 5 항목

| 차이 | 진리 (사용자) | 이전 agent |
|---|---|---|
| **wrapper width** | 375 | 428 |
| **F2 Hero height** | 104 (compact) | 160 (큰 padding) |
| **F3 QuickNav** | 4-cell (스킬/추천/히스토리/KBO) 79.75 wide, item card 자체에 bgCard+border+radius | 3-cell+empty, item card X (그냥 icon+label) |
| **F5 Coupon** | 가로 스크롤 row (200×104 카드 × 3, code chip + bgGo + 1px divider + title + expiry) | dashed placeholder rect 1개 |
| **F6 Notice item** | 343×64, 좌상단 title + 우상단 date / 좌하단 dot + sub | 343 dynamic, dot 좌측 + 우측 date / sub 그대로 |
| **F7 Event** | 2-col 167.5×124, 상단 72h 컬러 thumb + 진행중 badge | dashed placeholder rect 1개 |
| **F8 Community** (신규) | 343×52 × 3, HOT/NEW badge 좌측 + chevron 우측 | 없음 |
| **F9 Tips** (신규) | 343×72 × 3, left 3px brand border + 카테고리 라벨 + 본문 + 메타 | 없음 |

---

## 3. 진리 frame 트리 (페이지 전체)

```
Mobile Home — 컴프야펀 (375 × 1639)
├── Topbar (375×52, bg #18141f, border-b white-06)
│   ├── BURGER (16,17 — 20×16, 3 lines 2px)
│   ├── ⚾ 컴프야펀 (46,16 — 17/600/white-92)
│   └── LoginBtn (256,10 — 103×32, bg #03c75a, radius 6, "N 네이버 로그인" 11/500)
├── Hero Banner (375×104, bg #18141f, border-b white-06)
│   ├── 프로야구2026 이미지 (배경 placeholder)
│   ├── badge (14,14 — 108×20, "컴투스프로야구 2026" 10/500)
│   ├── heroTitle "컴프야펀" (16,38 — 22/700/white-92)
│   └── heroSub (16,67 — 12/400/df-82)
├── QuickNav Section (375×120)
│   └── QN_0..3 (16/103.75/191.5/279.25 — 79.75×88, bgCard+border+radius 10)
│       ├── IconBg 32×32 rgba(168,106,240,0.15) radius 8
│       └── label 71.75×28 10/400/white-60 center 1.4 lh
├── Quiz Section (375×251)
│   ├── header bar 3×13 brand + "컴프야 퀴즈 888회 정답" (25,16 — 13/600)
│   ├── QuizCard (16,42 — 343×186, bgCard, border white-12, radius 10, 안에 퀴즈 이미지)
│   └── notice (16,232 — 10/400/white-60)
├── Coupon Section (375×170)
│   ├── header + "전체 보기 →"
│   └── CouponScrollGrid (16,42 — 347×112, clip 가로 스크롤)
│       └── CouponScrollRow (-16,0 — 640×104)
│           └── CouponCard_0/1/2 (200×104 each, gap 24)
├── Notice Section (375×256)
│   ├── header + "전체 보기 →"
│   └── NoticeItem_0/1/2 (343×64, bg #18141f, border, radius 8)
│       ├── title (25,11 — 13/500/white-92)
│       ├── dot (11,28 — 6×6 brand or muted)
│       ├── sub (25,31 — 11/400/white-38)
│       └── date (310,25 — 10/400/white-38)
├── Event Section (375×182)
│   ├── header + "전체 보기 →"
│   └── EvtCard_0/1 (167.5×124 each, gap 8)
│       ├── Thumb (167.5×72, bg #3c1e50 or #19284b, 이미지 placeholder + 진행중 badge 41×20 brandViolet)
│       ├── title (7,77 — 12/500/white-92)
│       └── expiry (7,95 — 10/400/white-38)
├── Community Section (375×222)
│   ├── header + "전체 보기 →"
│   └── CommItem_0/1/2 (343×52, bg #18141f, border, radius 8)
│       ├── HOT/NEW badge (10/9 좌측 — 28×19, HOT bg rgba(232,65,65,0.18) text #e84141 / NEW bg rgba(232,213,65,0.33) text #ffd9d9)
│       ├── title (51,9 — 13/400/white-92)
│       ├── meta "추천 24 · 댓글 12" (51,30 — 11/400/white-38)
│       └── › chevron (324/325,17 — 14/400/white-38)
└── Tips Section (375×282)
    ├── header + "전체 보기 →"
    └── TipCard_0/1/2 (343×72, bgCard, left 3px + 1px border rgba(168,106,240,0.5), radius 8)
        ├── category "투수 공략" (11,7 — 9/600/#a86af0)
        ├── title (11,26 — 12/400/white-92, lh 1.55)
        └── meta (11,52~53 — 10/400/white-38)
```

---

## 4. 사용자가 변경한 핵심 영역

1. **폭 428 → 375** (실 모바일 사이즈로 다운)
2. **QuickNav 카드화** — 4셀 그리드, 각 셀이 카드 (bgCard + border + radius)
3. **Coupon 가로 스크롤** — placeholder 가 아닌 실제 카드 3개 (code+btn+divider+title+expiry)
4. **Event 2-col + thumb** — 단순 placeholder → 실제 thumb 컬러 + 진행중 badge
5. **Notice 레이아웃** — dot 위치를 sub 좌측으로 (title 옆이 아닌)
6. **신규 섹션 2개** — Community / Tips 추가 (이전 agent figma 에 없던 영역)

---

## 5. 토큰 / 자산 영향

| 항목 | 영향 |
|---|---|
| Tokens.COLOR / SPACE / RADIUS | **변경 없음** (raw 값 그대로 매칭) |
| 신규 raw 색 (inline) | `#d9d3e0` (badge/code text), `#7c6f8f` ("전체 보기 →"), `rgba(232,65,65,0.18)` (HOT bg), `#e84141` (HOT text), `rgba(232,213,65,0.33)` (NEW bg), `#ffd9d9` (NEW text), `#3c1e50` (event thumb purple), `#19284b` (event thumb navy), `rgba(168,106,240,0.15)` (QN icon bg), `rgba(168,106,240,0.5)` (Tip border), `rgba(168,106,240,0.3)` (BtnGo inactive border) |
| 외부 자산 (이미지) | 히어로 / 퀴즈 / 이벤트 썸네일 — 코드에서는 색 placeholder rect 로 표현. 미정 마커 ❓ |
| 외부 아이콘 | BURGER 3-line / chevron `›` / 시계 `⏱` 등 — 텍스트/rect 그대로 표현 |
| 라이브러리 변경 | **없음** |

---

## 6. HITL 보고

| 항목 | 분류 | 처리 |
|---|---|---|
| Tokens 정의 값 변경 | 없음 | — |
| 컴포넌트 라이브러리 구조 변경 | 없음 | — |
| 레이아웃 컨벤션 (428→375) | 🟨 — 사용자 figma 가 진리. wrapper 폭만 변경 (모바일 우선 그대로) | 적용 |
| 외부 자산 도입 | 🟨 — 이미지 placeholder rect 로 처리, 실 이미지 미도입 | 적용 |
| 신규 raw 색 (#e84141 등) | 🟨 — inline 사용 (Tokens 추가 없이). 다음 라운드에 토큰화 검토 | 적용 |

→ 강제 HITL 4 분야 위반 없음. 진행.

---

## 7. 적용 결과

| 항목 | 값 |
|---|---|
| 재작성 대상 | `figma-plugin/domains/home.ts` |
| 신규 함수 | `buildF2Hero / buildF3QuickNav / buildF4Quiz / buildCouponCard / buildF5Coupon / buildNoticeItem / buildF6Notice / buildEventCard / buildF7Event / buildCommItem / buildF8Community / buildTipCard / buildF9Tips / buildF1Wrapper` |
| 헬퍼 보강 | `Helpers.TextOpts.layoutGrow` 추가 (text node flex:1 효과) — `figma-plugin/shared/helpers.ts` |
| code.ts | `ApplayoutDomain.run()` 일시 비활성화 (home 단독 sync 모드) |
| build | tsc PASS — `code.js` 2069 lines |
