# quiz Figma 갱신 명세서

> figma 작업자 actionable 명세 — 본 문서만 보고 figma 수정 가능하도록 정리.
> 입력: `docs/prd/design-sync/quiz.md` (갱신 요청 6건 + spot-check 3건)
> 작성: 2026-05-09
> 작성 주체: manual (사용자 요청)

---

## 0. 메타

| 항목 | 값 |
|---|---|
| **도메인** | quiz |
| **figma file** | `VCVQzOpSIpwpZw11gxG7N1` (컴프야몬) |
| **figma node** | `2-34` (Quiz Section frame, 375x251px) |
| **figma URL** | https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=2-34 |
| **source-of-truth** | **코드** (사용자 명시 — "개발 방향이 맞는 것"). figma 가 코드 기준으로 갱신됨 |
| **코드 진입점** | `web/src/domains/home/components/section/quiz/QuizSection.jsx` (L1-24) |
| **코드 스타일** | `web/src/domains/home/components/section/quiz/QuizSection.module.scss` |
| **연관 PRD scope** | `docs/prd/domains/quiz.md` Part B v2 (B.1 / B.2) — HomeScreen QuizSection 1개, 이미지 + 동적 title 만 노출, 인터랙션 / 발급 / 사용 / 모달 모두 없음 |
| **작성일** | 2026-05-09 |

### scope 기준 (본 명세서가 따르는 v2 IA)

- **포함**: 섹션 헤더 (accent bar + title), 카드 컨테이너, 카드 이미지(loaded), 빈 카드 (empty/loading/error 공통), 안내문
- **v2 scope 외 (figma 에서 정리 대상)**: 정답 제출 모달 / 보상 우편함 모달 / 모든 사용자 인터랙션 UI (B.1 cite: "별도 인터랙션 없음")

---

## 1. 우선순위 분류

| 우선순위 | 의미 | 본 명세 항목 |
|---|---|---|
| **P0 (블로킹)** | v2 scope 외 frame 이 figma 에 잔존하면 figma 가 잘못된 방향으로 의사소통됨 — 즉시 정리 필수 | U7 (정답/보상 모달 제거), U1 (구조 정렬: SectionBlock 외부화) |
| **P1 (정합)** | 디자인 토큰 / 구조 정합성 — 코드 표준과 어긋나 다른 도메인 카드와 시각 불일치 | U2 (카드 비율 7px), U3 (카드 border 토큰), U4 (안내문 color 토큰), U5 (제목 font-size), U8 (안내문 텍스트) |
| **P2 (일반)** | state variant 보강 — 디자인 검토 가능하게 figma 에 반영 필요 | U6 (empty state visible 처리) |

> P0 2건, P1 5건, P2 1건 = 총 8건 (design-sync 갱신 요청 6건 F1~F6 + spot-check 3건 S1/S2/S4 중 S3 가 F6 와 통합됨 → 8건)

---

## 2. 수정 명세 (figma 작업자 actionable list)

### U1. 섹션 헤더 (accent bar + 제목) Quiz Section frame 외부 분리

| 항목 | 값 |
|---|---|
| 우선순위 | **P0 (블로킹 — 구조)** |
| design-sync 출처 | F1 (G1) |
| 대상 figma node | `2:35` (accent bar Rectangle), `2:36` (제목 Text) |
| 위치 (Before) | Quiz Section frame `2:34` 내부 — accent bar `(x=16, y=18, 3x13px)`, 제목 `(x=25, y=16, 13px)` |
| 변경 (After) | 두 노드를 **Quiz Section frame 밖으로** 분리. 글로벌 `SectionBlock > SectionHeader` 컴포넌트 패턴으로 재구성 (다른 도메인 SectionBlock 과 동일 구조) |
| 사유 | 코드는 `SectionBlock`(글로벌 표준) 이 제목을 렌더하고 `QuizSection` 은 카드 + 안내문만 렌더. 즉 figma 처럼 frame 내부에 제목이 있으면 안 됨. CouponSection / EventSection 등 모든 다른 섹션과 같은 구조 (`web/src/global/ui/mobile/section/SectionBlock.jsx`, `SectionHeader.jsx`) |
| 검증 | figma 수정 후 Quiz Section frame `2:34` 자식 노드 목록에서 `2:35`, `2:36` 가 제거되어 있는지 확인 |

---

### U2. QuizCard 높이 186px → 193px (16:9 비율 보정)

| 항목 | 값 |
|---|---|
| 우선순위 | **P1 (정합)** |
| design-sync 출처 | F2 (G2) + spot-check S2 |
| 대상 figma node | `2:38` (QuizCard frame) |
| 위치 (Before) | 343 x **186** px (실제 비율 ≒ 1.844:1, 16:9 아님) |
| 변경 (After) | 343 x **193** px (`343 / 16 * 9 ≒ 192.93` → 193 px 반올림). aspect-ratio 16:9 (1.778:1) |
| 사유 | 코드 `QuizSection.module.scss:5` 가 `aspect-ratio: 16/9` 로 표준 카드 비율 사용. figma 의 186px 은 7px 차이로 작업 오차로 판단 (사용자 결정: spot-check S2 → "코드가 source-of-truth"). 다른 카드 (CouponCard, EventCard) 도 16:9 표준 |
| 검증 | figma `2:38` height = 193px, width = 343px → MCP `get_metadata` 로 확인. aspect 343/193 ≒ 1.777:1 |

---

### U3. QuizCard border 토큰: border-strong → border (0.12 → 0.06)

| 항목 | 값 |
|---|---|
| 우선순위 | **P1 (정합)** |
| design-sync 출처 | F3 (G3) |
| 대상 figma node | `2:38` (QuizCard frame) |
| 위치 (Before) | border color `rgba(255, 255, 255, 0.12)` (= `--color-border-strong`) |
| 변경 (After) | border color `rgba(255, 255, 255, 0.06)` (= `--color-border`) |
| 사유 | 코드 `QuizSection.module.scss:4` 가 `border: 1px solid var(--color-border)` 사용. 다른 카드 (CouponCard, EventCard) 모두 `--color-border` 사용 — 통일성. figma 만 strong 사용 중 |
| 검증 | figma `2:38` 의 stroke 가 `#FFFFFF 6%` (`rgba(255,255,255,0.06)`) 인지 확인 |

---

### U4. 안내문 color 토큰: text-secondary → text-muted (0.60 → 0.38)

| 항목 | 값 |
|---|---|
| 우선순위 | **P1 (정합)** |
| design-sync 출처 | F4 (G6) |
| 대상 figma node | `8:4` (안내문 Text) |
| 위치 (Before) | text color `rgba(255, 255, 255, 0.6)` (= `--color-text-secondary`) |
| 변경 (After) | text color `rgba(255, 255, 255, 0.38)` (= `--color-text-muted`) |
| 사유 | 코드 `QuizSection.module.scss:36` 가 `color: var(--color-text-muted)` 사용. 다른 도메인 안내문 (보조 설명류) 모두 muted(0.38) 처리가 시각 계층 표준 |
| 검증 | figma `8:4` 의 fill 이 `#FFFFFF 38%` 인지 확인 |

---

### U5. 섹션 제목 font-size: 13px → 15px

| 항목 | 값 |
|---|---|
| 우선순위 | **P1 (정합)** |
| design-sync 출처 | F5 (G7) |
| 대상 figma node | `2:36` (섹션 제목 Text) |
| 위치 (Before) | font-size **13px**, weight semibold |
| 변경 (After) | font-size **15px**, weight semibold (유지) |
| 사유 | 코드 `SectionHeader` (`Section.module.scss:16`) 가 `@include text-section-title` = 15px 사용. 모든 SectionBlock 제목의 표준 (`mixins/_typography.scss: @mixin text-section-title`). figma 만 13px |
| 검증 | figma `2:36` font-size = 15px, weight = SemiBold(600) 확인. U1 작업으로 노드가 frame 외부로 옮겨진 후에도 동일 적용 |

---

### U6. empty state visible 처리 + variant frame 추가

| 항목 | 값 |
|---|---|
| 우선순위 | **P2 (일반 — state 보강)** |
| design-sync 출처 | F6 (G8) + spot-check S3 |
| 대상 figma node | `5:3` (빈 상태 아이콘), `5:4` (빈 상태 텍스트), 신규 variant frame |
| 위치 (Before) | `5:3`, `5:4` 모두 hidden=true → empty UI 디자인이 figma 에 미반영 (스크린샷에서 확인 불가) |
| 변경 (After) | (1) `5:3`, `5:4` 의 `visible=true` 별도 variant 또는 별도 frame 생성. (2) empty variant 의 시각: 카드 중앙에 아이콘(🖼️ 스타일 plain placeholder) + 그 아래 텍스트 `"이미지가 없습니다"` (코드 `QuizSection.jsx:11-14` 참조) |
| 사유 | 코드는 empty state 를 별도 마크업 (`<div className={styles.empty}>`) 으로 명시 구현 중. loading / empty / error 모두 동일 빈 카드로 노출 (B.3 자동화 3, 4번 cite). figma 에 반영되어야 디자인 검토 가능 |
| 검증 | figma 에서 QuizCard 의 empty variant 를 선택하면 아이콘 + "이미지가 없습니다" 텍스트가 카드 중앙에 보임. loading / error 도 같은 표현 — 별도 frame 분리 불필요 (단일 variant 로 통합 OK) |

---

### U7. v2 scope 외 모달 / 오버레이 frame 제거 (정답 제출 / 보상 우편함)

| 항목 | 값 |
|---|---|
| 우선순위 | **P0 (블로킹 — scope 정리)** |
| design-sync 출처 | spot-check S4 |
| 대상 figma node | figma 스크린샷에 보이는 `"정답입니다! 우편함에서 보상을 확인하세요!"` 모달 / 오버레이 frame (node id 미상 — figma 작업자가 직접 식별 필요) |
| 위치 (Before) | quiz 도메인 figma 영역에 정답 제출 / 스타 적립 / 보상 모달 frame 잔존 |
| 변경 (After) | 해당 frame **전부 제거** (또는 별도 archive 페이지로 이관) |
| 사유 | v2 IA 결정 (`docs/prd/domains/quiz.md` B.1): **"별도 인터랙션 (정답 제출 / 스타 적립 / 상세 페이지 진입) 없음"**. 모바일 quiz 는 read-only 카드 1개로 단일화. 코드에도 정답 제출 / 보상 UI 0건 — 해당 모달은 v2 scope 외 stale frame |
| 주의 | Phase 3 또는 후속 라운드에서 재추가 가능성 있음 → 완전 삭제 대신 archive 페이지 이관 권장. 단 quiz 도메인 main page 에서는 비노출 |
| 검증 | figma quiz 도메인 main page 스크린샷에 모달 / 오버레이 frame 없음 확인 |

---

### U8. 안내문 텍스트: figma → 코드 텍스트로 통일

| 항목 | 값 |
|---|---|
| 우선순위 | **P1 (정합)** |
| design-sync 출처 | spot-check S1 (G5) |
| 대상 figma node | `8:4` (안내문 Text) |
| 위치 (Before) | `"※ 매주 금요일에 신규 퀴즈가 등장합니다. 보상은 목요일까지 수령해주세요."` |
| 변경 (After) | `"※ 매주 금요일 12:00에 신규 퀴즈가 등장합니다. 정답 : 100스타(★)"` |
| 사유 | 코드 `QuizSection.jsx:18` 의 안내문이 source-of-truth (B.2 기능 2 ac: "안내문 (`L17-19`) 텍스트 변경하지 않음"). figma 의 "보상 목요일까지 수령" 텍스트는 stale (보상 수령 기능 자체가 v2 scope 외 — U7 과 같은 사유) |
| 검증 | figma `8:4` 의 text content = `"※ 매주 금요일 12:00에 신규 퀴즈가 등장합니다. 정답 : 100스타(★)"` |

---

## 3. 통일성 OK (수정 불필요 — 참조용)

design-sync 갭 분석에서 통일성 OK 로 판정된 항목 (figma 작업 불필요, 단순 참조용):

| # | 항목 | 판정 |
|---|---|---|
| G4 | 카드 좌우 여백 (16px) | figma `left=16px` ↔ 코드 `SectionBlock $layout-h-pad: 16px` — 결과 동일 |
| G9 | 이미지 overflow 처리 | figma 이미지 `400x185px` overflow clip ↔ 코드 `object-fit: cover; overflow: hidden;` — 시각 결과 동일 |
| G10 | round 정보 표시 위치 | 둘 다 섹션 제목에 `{round}회` 포함 — 구조 동일 (코드 R9 fix 후 `state.quiz.latest.round` 매핑) |

---

## 4. 동적 title 처리 안내 (figma 작업자 참고)

- figma 의 제목 (`2:36`) 은 현재 mock 값 `"컴프야 퀴즈 888회 정답"` 으로 표시됨
- **코드 source-of-truth**: `"🎉컴프야 퀴즈 {round}회 정답"` (server-side 동적 생성, `{round}` 는 BE 응답의 `fun_quiz.round`)
- figma 에서 mock 값으로 `888` 대신 **server-side 생성 placeholder 임을 주석 또는 description 으로 명시** 권장 (예: variable name `quizTitle` 으로 binding)
- U5 폰트 크기 변경과 별개. mock 값 자체는 figma 시각 검토용으로 유지 OK

---

## 5. 검증 방법 (figma 수정 후 design-sync 재실행)

figma 작업자가 위 8건 중 일부 또는 전부 적용 후 다음 절차로 검증:

### 5.1 figma MCP 로 자기 검증

```
mcp__figma-dev-mode__get_metadata     (node-id=2-34) → 자식 노드 구조 확인
mcp__figma-dev-mode__get_design_context (node-id=2-34) → 토큰 / font-size / color 확인
mcp__figma-dev-mode__get_screenshot   (node-id=2-34) → 시각 결과 확인 (모달 frame 잔존 여부 포함)
```

각 U항목의 **검증** 컬럼을 기준으로 metadata 결과 대조.

### 5.2 prd-design-sync 재실행

figma 갱신 완료 후:

```
어시스턴트에게 요청: "quiz 도메인 design-sync 재실행"
→ docs/prd/design-sync/quiz.md 가 갱신됨
→ "갭" 항목 줄어들어야 정상 (10건 → U항목 적용 수만큼 감소)
```

기대 결과:
- U1 적용 → G1 해소
- U2 적용 → G2 해소 + S2 해소
- U3 적용 → G3 해소
- U4 적용 → G6 해소
- U5 적용 → G7 해소
- U6 적용 → G8 해소 + S3 해소
- U7 적용 → S4 해소 (스크린샷에서 모달 사라짐)
- U8 적용 → G5 해소 + S1 해소

**완전 적용 시 design-sync 갭 = 통일성 OK 3건만 잔존 (G4, G9, G10)**.

### 5.3 figma 작업자 → 어시스턴트 반환 시

figma 수정 완료 보고 시 다음 형식으로 어시스턴트에 알림:

```
quiz figma 갱신 완료. 적용 항목: U1, U3, U5 ...
미적용 항목: U7 (사유: ...)
design-sync 재실행 요청.
```

---

## 6. 변경 이력

| 일자 | 작업 | 비고 |
|---|---|---|
| 2026-05-09 | 본 문서 신규 작성 | design-sync 갱신 요청 6건 + spot-check 3건 → actionable 8건 정리 |

---

## 7. 참조

- IA 결정 (Part B v2): `docs/prd/domains/quiz.md` § B.1 (모바일 scope), § B.2 (기능 1, 2)
- design-sync 원본: `docs/prd/design-sync/quiz.md` § 4 (figma 갱신 요청 6건), § 6 (spot-check 4건)
- wireframe: `docs/prd/wireframes/quiz.md` § 3.1 (HomeScreen QuizSection)
- 코드 진입점: `web/src/domains/home/components/section/quiz/QuizSection.jsx`
- 코드 스타일: `web/src/domains/home/components/section/quiz/QuizSection.module.scss`
- 글로벌 표준 컴포넌트: `web/src/global/ui/mobile/section/SectionBlock.jsx`, `SectionHeader.jsx`
