---
paths:
  - "web/src/**/*.scss"
---
# 디자인 검사 — grep · 작업 순서 · 함정 · 예외

> 값은 `fe-design.md` § 1 (원천은 `web/src/global/styles/**`). 여기는 **어떻게 어기지 않는가**. `community` 는 동결이라 제외.

## 1. 값이 들어오는 경로 — 하나만 훑으면 반드시 놓친다

`font-size` 는 **네 경로**로 들어간다 (px 만 훑어 `font-size-rem()` 6건을 놓친 적 있다).

| 경로 | 예 |
|---|---|
| px 직접 | `font-size: 12px` |
| rem 직접 | `font-size: 0.75rem` |
| 함수·믹스인 | `rem(12)`, `@include font-size-rem(12)` |
| 토큰 | `$font-size-12` |

### 그대로 실행할 grep

`community` 는 동결 도메인이라 애초에 검사 대상이 아니다 — **모든 grep 에 `| grep -v "/community/"` 를 기본으로 붙인다.** community 안의 값은 위반이든 아니든 볼 필요가 없다. 옆의 **기대값은 2026-09-28 실측** — 코드가 바뀌면 값도 바뀌니, 실행할 때마다 이 숫자와 비교하고 늘었으면 그때만 원인을 판정한다.

```bash
# 1) font-size — 네 경로 전부
grep -rn "font-size:\s*[0-9]" web/src --include=*.scss | grep -v "/community/"
# 기대값 8건 (2026-09-28) — 전부 위반 아님, 자리별 근거:
#   MileageScreen.module.scss:339  44px           → § 6 예외(마일리지 히어로 글리프)
#   ResponseModal.module.scss:21,28  2.625rem×2   → § 6 예외(42px, 응답 모달 ✓/! 기호)
#   _base.scss:21  16px                            → § 6 예외(html 루트, rem 환산 기준)
#   _prose.scss:76  0.9em                          → § 6 예외(부모 대비 비율, 긴 글 렌더러)
#   _rem.scss:10 / _typography.scss:100,101        → 주석 3건(문서화 목적, 실선언 아님)

grep -rn "font-size:\s*[0-9.]*rem" web/src --include=*.scss | grep -v "/community/"        # 기대값 6건
grep -rn "font-size-rem(\|rem(" web/src --include=*.scss | grep -v "/community/"           # 기대값 39건
grep -rn "font-size:\s*\$font-size-" web/src --include=*.scss | grep -v "/community/"      # 기대값 182건

# 2) 굵기 — 800/900 및 리터럴 숫자
grep -rnE "font-weight:\s*[0-9]" web/src --include=*.scss | grep -v "/community/"
# 기대값 0건 — community 밖에는 리터럴 굵기가 하나도 없다(전부 토큰 경유).
#   **이게 가장 쓸모 있는 신호다: 1건이라도 나오면 새로 생긴 위반이다.**
grep -rnE "font-weight:\s*(800|900)" web/src --include=*.scss | grep -v "/community/"       # 기대값 0건

# 3) 홀수 간격 — margin/padding/gap 만. width·height·top·left·right·bottom 은
#    요소 치수·위치라 이 규칙 대상이 아니다 (border-top/border-left 같은 테두리 축약형까지
#    "top"/"left" 로 오탐하니 절대 넣지 않는다). 범위도 31px 이상까지 커버하도록 넓혔다.
grep -rnE "(margin|padding|gap):\s*([0-9]*[13579])px" web/src --include=*.scss | grep -v "/community/"
# 기대값 0건. (community 포함 시 1건 — PostRow.module.scss:102 `gap: 1px`, 동결 도메인이라 제외)
# ⚠️ 옛 버전(width|height|top|left|right|bottom 포함, community 미제외)은 22건을 잡았으나
#    전부 width 10 / height 8 / bottom 1 / left 1 / border-top·border-left 오탐 2 —
#    간격 규칙 위반이 아니다. 폭·높이·위치를 "고쳐서" 레이아웃을 깨지 마라.

# 4) 리터럴 색 — hex, rgb/rgba 직접 기입 (변수 파일 자체는 제외하고 컴포넌트만)
grep -rn "#[0-9a-fA-F]\{3,6\}" web/src --include=*.module.scss | grep -v "/community/"   # 기대값 40건
grep -rn "rgba\?(" web/src --include=*.module.scss | grep -v "/community/"               # 기대값 18건
# ⚠️ 이 두 값은 "위반 0건" 이 아니라 실측 총량이다 — § 5 예외 목록(브랜드 고정색·
#    선수 사진·인게임 색·배지 채움)과 개별 대조해야 위반 여부가 나온다. 전수 판정 미완료.
#    단 2026-09-28 시점에 36곳은 이미 전수 판정해 위반 0건이었고, 그 근거는 각 자리 코드
#    주석에 남아 있다 — 그 36곳은 다시 보지 말고, **새로 늘어난 나머지만** 판정하면 된다.

# 5) box-shadow — 전수 확인, 주석 줄 제외
grep -rn "box-shadow" web/src --include=*.scss | grep -vE "^[^:]*:[0-9]+:\s*//" | grep -v "/community/"
# 기대값 5건, 전부 모달 — SupportSection(홈 지원 모달) · AdminModal · LoginRequiredModal ·
# RenewalNoticeModal · ResponseModal. 6번째가 생기면 그게 모달인지부터 확인한다.

# 6) raw z-index — 토큰 안 거친 숫자
grep -rnE "z-index:\s*[0-9]" web/src --include=*.scss | grep -v "\$z-" | grep -v "/community/"
# 기대값 0건. (community 포함 시 5건 — 4건 주석 + 1건 실선언(TagModal.module.scss:6),
# 전부 동결 도메인이라 이번 정리 대상 아님(§ 적용 범위)) 그 외 도메인에서 나오면 위반.
# 7) 파생 문서 드리프트 — design.json / DESIGN.md 의 canonical 이 토큰과 같은가
grep -o '"canonical": "#[0-9a-f]*"' .impeccable/design.json | sort -u   # 각 값이 semantic/_color.scss 에 있는지 대조
```

**왜:** 경로 하나만 훑으면 "0건" 이라 보고하고 실제로는 남는다 — 이 프로젝트에서 두 번 벌어졌다. `community` 를 안 걷어내면 동결 잔존물을 새 위반으로 오판한다. 기대값에 날짜가 없으면 옛 숫자를 정답으로 믿는다.

## 2. 작업 순서

1. **실측이 먼저다.** 감사 문서·todo 의 숫자를 믿지 마라. 이 프로젝트 실제 오차: `12.5px` 7곳→실제 17곳, 글자 위반 151건→실제 58건, 미사용 토큰 32개→실제 15개. **문서 숫자는 시작점이지 결론이 아니다.**
2. 매핑 규칙(어떤 값 → 어떤 토큰)을 **먼저 정해 브리프에 표로 박는다.** 자리마다 눈대중으로 고르면 스케일이 다시 흐트러진다.
3. 고친 뒤 **§1 grep 6종으로 잔여 0건 확인**.
4. 빌드 검증:
   ```bash
   cd web && npx vite build --outDir ../.tmp-build-X --emptyOutDir
   ```
   SCSS 변수는 참조가 남아 있으면 빌드가 깨진다 — **빌드 통과가 곧 증거**.
5. 값이 바뀌었으면 **화면으로 본다.** 계산으로 안 잡히는 게 있다 — 이번에 밝은톤 행 hover·로그아웃 버튼·히트맵 빗금 3건이 화면에서만 잡혔다.

## 3. 삭제 전 필수 절차

⚠️ **"참조 0건" 기록이 틀린 사례가 이미 있다.** `AdminCheckbox`·`SectionHeader` 를 감사 문서만 믿고 지웠으면 관리자 테이블과 홈 섹션이 깨졌다.

- 삭제 전 `grep -rn` 으로 **직접 재확인**. 주석 밖 참조가 1건이라도 있으면 남기고 보고
- CSS Modules 는 `styles[변수]` · 템플릿 문자열 · `classNames()` 로 **동적 접근** 가능 — 정적 grep 만으론 부족. 아래는 지울 대상 이름을 넣어 쓰는 grep 이라 "0건 기대" 대신 **전체 발생 건수(2026-09-28 실측)를 참고선으로** 적는다 — 삭제할 변수가 이 안에 하나라도 걸리면 남기고 보고:
  ```bash
  grep -rn "styles\[" web/src --include=*.jsx      # 전체 12건 — 동적 접근 자체는 정상 패턴, 지울 변수명이 여기 없는지 확인
  grep -rn "classNames(" web/src --include=*.jsx   # 전체 0건 — 이 프로젝트는 미사용, 나오면 새 패턴이니 별도 확인
  ```
- 라우트 · `lazy()` 문자열 경유 참조도 확인:
  ```bash
  grep -rn "lazy(" web/src --include=*.jsx         # 전체 23건 — 지울 컴포넌트명이 여기 없는지 확인
  ```
- 빌드 통과가 마지막 증거 (§2-4 명령)

## 4. 리터럴이 정답인 자리

토큰이 기본이지만, **테마에 따라 바뀌지 않는 면 위의 값은 리터럴이 맞다.** 36곳 전수 확인 결과 위반 0건:

- 브랜드 고정색 위 흰 글자 (네이버 초록, 카카오 옐로우, 브랜드 보라 채움)
- 선수 사진과 그 위 그라데이션
- 인게임 색(스킬 티어 판) 위 글자
- 불투명 배지 채움 위 글자

⚠️ **실제 사고**: 선수 카드 링을 전역 테두리 토큰으로 바꿨다가 다크에서 검은 링이 흰 테두리로 **극성이 뒤집혀** 되돌렸다. **리터럴 → 토큰 전환 전, 그 토큰의 다크 값이 원래 리터럴과 같은지 반드시 확인.** 다르면 바꾸지 말고 보고.

## 5. 예외 목록 (단일 원천) (위반 아님 — 내리지 마라)

| 자리 | 값 | 근거 |
|---|---|---|
| 마일리지 히어로 글리프 (`MileageScreen.module.scss .hero .glyph`) | `44px` | 화면에 하나뿐인 큰 기호 |
| 응답 모달 `✓`/`!` (`ResponseModal.module.scss .iconSuccess/.iconFail`) | `42px` | 동상 |
| `html` 루트 | `16px` | 글자 크기가 아니라 rem 환산 기준 |
| `border`·`outline` | `1px` | 규칙이 선 두께로는 허용 |
| `.sr-only` | `1px` | 접근성 클립 기법 |
| 탭 선택 표시 | `margin-bottom: -1px` | 1px 테두리 보정 |
| 긴 글 렌더러 | `0.9em` | 부모 대비 비율 |
| CSS 로 도형 그리는 아이콘 내부 (`GuideView.module.scss .viewIconGrid/.viewIconList`) | 소수점 px 포함 | 격자는 레이아웃용. 14×14 안에서 4px 로 올리면 그림이 뭉갠다. **예외는 도형 내부 값 한정** — 이웃과의 간격은 격자를 따른다 |

**예외를 늘릴 때는 코드에 근거 주석을 남긴다.** 안 남기면 다음 사람이 위반으로 알고 고친다 — 이번에 실제로 그럴 뻔했다.

## 6. 빠지기 쉬운 함정

- 다크 값을 바꾸는 것은 안전선을 넘는 일이다. **접근성 결함 수정처럼 명시적 목적이 있을 때만**, 바뀌는 범위를 보고

## 7. 자가 점검

- [ ] font-size 네 경로(px·rem·함수·토큰) 전부 grep 했다
- [ ] 감사 문서 숫자를 실측 grep 결과로 재확인했다 (그대로 인용 금지)
- [ ] 삭제 전 동적 접근(`styles[]`, `classNames()`, `lazy()`) 까지 확인했다
- [ ] `vite build` 로 참조 무결성 확인했다
- [ ] 값이 바뀐 화면은 실제로 봤다 (계산만으로 끝내지 않았다)
- [ ] 리터럴→토큰 전환 시 다크 값이 원래 리터럴과 일치하는지 확인했다
- [ ] 새 예외는 코드에 근거 주석을 남겼고 § 5 표에도 추가했다
- [ ] 값이 바뀌었으면 `fe-design.md` § 1 · `DESIGN.md` · `design.json` 을 같이 고쳤다
