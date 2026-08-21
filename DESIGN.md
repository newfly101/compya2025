---
name: 컴프야펀 (COMPYAFUN)
description: 컴투스프로야구 팬을 위한 게임 데이터 플랫폼 — 어두운 바탕 위, 필요한 곳에만 켜지는 보라 신호
colors:
  night-field: "#0f0a14"
  deep-slate: "#140f1f"
  overlay-slate: "#18141f"
  card-slate: "#1f1a29"
  lifted-slate: "#332947"
  modal-charcoal: "#1e1e1e"
  terminal-violet: "#a86af0"
  violet-pale: "#ede0ff"
  violet-light: "#c9a5f8"
  signal-deep: "#6d4ad3"
  action-indigo: "#6c5ce7"
  dugout-plum: "#3c1e50"
  surface-community: "#19284b"
  text-primary: "rgba(255, 255, 255, 0.92)"
  text-secondary: "rgba(255, 255, 255, 0.60)"
  text-muted: "rgba(255, 255, 255, 0.38)"
  text-code: "#d9d3e0"
  text-placeholder: "#7c6f8f"
  border-hairline: "rgba(255, 255, 255, 0.06)"
  border-strong: "rgba(255, 255, 255, 0.12)"
  naver-green: "#03c75a"
  alert-red: "#e84141"
  caution-amber: "#e8d541"
  overlay-scrim: "rgba(0, 0, 0, 0.55)"
typography:
  hero:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  page-title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  topbar:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.2
  section-title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.5
  body-bold:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.5
  micro:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.5
  badge:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.5625rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.04em"
rounded:
  none: "0"
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "10px"
  2xl: "12px"
  full: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
components:
  badge-status:
    backgroundColor: "{colors.terminal-violet}"
    textColor: "#ffffff"
    typography: "{typography.badge}"
    rounded: "{rounded.sm}"
    height: "20px"
    padding: "0 8px"
  card-content:
    backgroundColor: "{colors.card-slate}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "20px 16px"
  chip-filter:
    backgroundColor: "{colors.lifted-slate}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    height: "36px"
    padding: "0 12px"
  chip-filter-selected:
    backgroundColor: "{colors.signal-deep}"
    textColor: "#ffffff"
  input-search:
    backgroundColor: "{colors.overlay-slate}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 12px"
  sheet-bottom:
    backgroundColor: "{colors.modal-charcoal}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.2xl}"
    padding: "20px 16px"
  tap-target:
    height: "44px"
---

# Design System: 컴프야펀 (COMPYAFUN)

## Overview

**Creative North Star: "덕아웃 단말기"**

선수 대기석에 놓인 데이터 단말이다. 경기를 보러 온 사람이 아니라 경기를 읽으러 온 사람을 위한 화면이다. 그래서 이 시스템의 첫 번째 의무는 아름다움이 아니라 **읽히는 것**이다. 목록은 빽빽하고, 장식은 없고, 상태는 색 하나로 전달된다.

바탕은 어둡다. 밝기 다섯 단계가 화면의 깊이를 만들고, 그 위에서 보라가 **조명처럼** 쓰인다. 조명은 켜진 곳이 적을수록 밝다. 보라를 넓게 칠하는 순간 이 체계는 무너진다. 색은 강조가 아니라 신호다 — 지금 눌러야 하는 것, 지금 끝나가는 것, 지금 켜져 있는 것.

이용자 다수가 게임을 켜 둔 채 한 손으로 들어온다. 그래서 부품은 단단하고 명확해야 한다. 누를 수 있는 것은 누르게 생겨야 하고, 영역은 테두리로 분명히 갈려야 한다. 여백을 넉넉히 두어 우아해 보이려는 시도보다, 한 화면에 필요한 정보를 담고 빠르게 훑게 하는 쪽이 항상 옳다.

**Key Characteristics:**
- 어두운 바탕 다섯 단계로 깊이를 만든다. 그림자를 쓰지 않는다
- 보라는 조명이다 — 적게 쓸수록 강하다
- 정보 밀도 우선. 여백보다 읽히는 양이 먼저다
- 테두리로 영역을 가른다. 경계가 흐릿한 화면을 만들지 않는다
- 글자 크기는 아홉 단계로 고정돼 있다. 새로 만들지 않는다

## Colors

어두운 자주빛 무채색 위에 보라 한 계열만 올린 단색 강조 체계다. 색이 많아서 정보가 구분되는 게 아니라, 색이 적어서 켜진 것이 눈에 띈다.

### Primary

- **터미널 바이올렛 Terminal Violet** (`#a86af0`): 이 체계의 유일한 주 강조색. 활성 상태, 선택된 항목, 주요 행동 버튼, 링크에 쓴다. 넓은 면을 칠하는 용도가 아니다.
- **시그널 딥 Signal Deep** (`#6d4ad3`): 눌린 상태와 선택된 칩의 채움. 주 강조색보다 한 단계 가라앉아 "이미 결정된 것"을 나타낸다.
- **액션 인디고 Action Indigo** (`#6c5ce7`): 제출·저장처럼 되돌리기 어려운 행동 버튼. 파랑 쪽으로 기울어 있어 강조와 구분된다.

### Secondary

- **바이올렛 라이트 Violet Light** (`#c9a5f8`): 강조 위에 얹는 글자, 레전드 등급 표시.
- **바이올렛 페일 Violet Pale** (`#ede0ff`): 보라 바탕 위의 본문. 흰색보다 부드럽게 얹힌다.
- **덕아웃 플럼 Dugout Plum** (`#3c1e50`): 이벤트 영역의 특수 바탕. 강조가 아니라 **자리 표시**다.

### Neutral

- **나이트 필드 Night Field** (`#0f0a14`): 가장 깊은 바탕. 페이지 전체.
- **딥 슬레이트 Deep Slate** (`#140f1f`): 한 겹 올라온 구역 바탕.
- **오버레이 슬레이트 Overlay Slate** (`#18141f`): 입력창처럼 바탕보다 눌린 면.
- **카드 슬레이트 Card Slate** (`#1f1a29`): 카드 바탕. 목록의 기본 단위.
- **리프티드 슬레이트 Lifted Slate** (`#332947`): 떠 있는 요소 — 칩, 태그, 강조 블록.
- **모달 차콜 Modal Charcoal** (`#1e1e1e`): 모달과 바텀시트 전용. 자주빛이 빠진 중립 회색이라 그 위가 화면에서 분리돼 보인다.
- 글자는 흰색 투명도 세 단계다 — 본문 92%, 보조 60%, 흐림 38%. 테두리도 같은 방식으로 6%와 12% 두 단계다.

### Status

- **네이버 그린 Naver Green** (`#03c75a`): 성공, 그리고 네이버 로그인. **이 색은 의미가 고정돼 있다** — 장식으로 쓰지 않는다.
- **얼럿 레드 Alert Red** (`#e84141`): 삭제, 오류, 마감 임박.
- **코션 앰버 Caution Amber** (`#e8d541`): 주의, 확인 필요.

### Named Rules

**조명 규칙 (The Floodlight Rule).** 보라는 한 화면에서 **10%를 넘지 않는다.** 켜진 곳이 적어야 신호가 된다. 보라 바탕을 넓게 깔고 싶어지면, 그건 배경 명도 단계로 해결할 문제다.

**의미 고정 규칙 (The Fixed Meaning Rule).** 초록은 성공과 네이버, 빨강은 위험과 마감, 노랑은 주의다. 세 색을 다른 뜻으로 재활용하지 않는다. 팔레트가 좁을수록 색 하나의 뜻이 강해진다.

**의미 이름 규칙 (The Named Value Rule).** 화면에서 원시 색값을 직접 쓰지 않는다. 반드시 의미 이름(CSS 변수)을 거친다. 이건 코드에 이미 강제돼 있는 규칙이다.

## Typography

**본문 글꼴:** Inter (fallback: -apple-system, BlinkMacSystemFont, sans-serif)
**별도 표시용·고정폭 글꼴:** 없음. 한 글꼴로 아홉 단계를 운용한다.

**성격:** 글꼴을 늘리는 대신 크기와 굵기로 위계를 만든다. 중립적이고 화면에서 잘 읽히는 한 벌만 쓰기 때문에, 어떤 화면에 가도 글자의 인상이 같다.

### Hierarchy

- **Hero** (700, 28px, 1.2, 자간 -0.02em): 홈 첫 화면의 사이트 제목. 한 화면에 하나뿐이다.
- **Page Title** (700, 22px, 1.2, 자간 -0.02em): 화면 안 제목.
- **TopBar** (600, 17px, 1.2): 상단 바의 화면 이름과 로고.
- **Section Title** (600, 15px, 1.5): 구역 제목. 목록 위 머리말.
- **Body Bold** (600, 13px, 1.5): 카드 제목, 공지 제목. **목록에서 눈이 처음 닿는 줄**이다.
- **Body** (400, 12px, 1.5): 본문 기본.
- **Caption** (400, 11px, 1.5): 날짜, 보조 설명.
- **Micro** (400, 10px, 1.5): 최소 크기 보조 문구, 링크.
- **Badge** (600, 9px, 1, 자간 0.04em): 배지 안 글자 전용. 자간을 벌려 작아도 읽히게 한다.

### Named Rules

**아홉 단계 규칙 (The Nine Steps Rule).** 글자 크기는 9·10·11·12·13·15·17·22·28px 아홉 개뿐이다. 그 사이 값을 새로 만들지 않는다. 크기가 애매하면 위계가 애매한 것이니, 단계를 늘리지 말고 위계를 다시 정한다.

**작을수록 굵게 규칙 (The Small-Gets-Bold Rule).** 13px 이하에서 강조는 색이 아니라 굵기(600)로 준다. 작은 글자에 색을 얹으면 읽히지 않는다.

## Layout

화면 폭은 **480px 상한**이며 가운데 정렬된다. PC로 열어도 이 폭을 유지한다 — 모바일 전용 체계이고, 넓은 화면 지원은 아직 하지 않는다.

간격은 **8pt 격자**다. 4·8·12·16·20·24·32·40·48px 아홉 단계만 쓴다. 화면 좌우 여백은 16px이 기본이고, 320px 미만에서만 12px로 좁힌다. 카드 실폭은 448px(480 − 16×2)이다.

고정 요소 높이는 상단 바 52px, 하단 바 56px, 구역 구분선 8px이다.

누를 수 있는 요소 높이는 세 단계다 — 검색창·칩은 36px, **표준 터치 대상은 44px**, 서랍 메뉴 항목과 큰 아이콘은 52px. 44px가 기준선이며 이보다 작은 터치 대상을 새로 만들지 않는다.

겹침 순서는 아홉 단계로 미리 정해져 있다: 기본 0 → 위 1 → 드롭다운 100 → 고정 바 200 → 서랍 300 → 모달 배경 400 → 모달 410 → 바텀시트 420 → 알림 500.

화면 폭 기준값은 320·375·428·768·1024px 다섯 단계가 정의돼 있으나 **실제로 쓰는 곳은 거의 없다** — 서랍 메뉴 한 곳과 작은 화면에서 글자를 줄이는 세 곳뿐이다. 이 체계는 사실상 단일 폭으로 동작한다.

### Named Rules

**단일 폭 규칙 (The Single Width Rule).** 화면은 480px 하나로 동작한다. 폭에 따라 배치가 달라지는 화면을 새로 만들지 않는다. 넓은 화면 대응이 필요해지면 그때 폭 값을 나눈다.

**격자 이탈 금지 규칙 (The Off-Grid Ban).** 간격에 7px, 13px 같은 값을 쓰지 않는다. 격자에 없는 값이 필요하면 배치가 잘못된 것이다.

## Elevation & Depth

**이 체계는 그림자를 쓰지 않는다.** 저장소 전체에서 그림자 선언이 두 건뿐이며, 둘 다 서랍과 모달이 화면에서 떨어져 나오는 경우다. 깊이는 **바탕 밝기 다섯 단계**로 만든다.

깊은 쪽에서 뜨는 쪽으로: 페이지 바탕(`#0f0a14`) → 구역 바탕(`#140f1f`) → 눌린 면(`#18141f`) → 카드(`#1f1a29`) → 떠 있는 요소(`#332947`). 모달과 바텀시트만 자주빛이 빠진 중립 회색(`#1e1e1e`)을 써서, 그 위가 다른 층임을 색상 자체로 알린다.

겹쳐 뜨는 요소 뒤에는 검은 막(`rgba(0,0,0,0.55)`)을 깐다.

### Shadow Vocabulary

- **떠 있는 판** (`box-shadow: 0 1.25rem 3.125rem rgba(0, 0, 0, 0.4)`): 서랍 메뉴와 모달처럼 화면에서 완전히 분리돼 나오는 판에만 쓴다.

### Named Rules

**그림자 금지 규칙 (The No-Shadow Rule).** 카드, 버튼, 입력창, 칩에 그림자를 넣지 않는다. 떠 보이게 하고 싶으면 한 단계 밝은 바탕으로 올린다. 그림자를 쓸 수 있는 것은 화면 전체를 덮는 판뿐이다.

## Shapes

모서리는 여덟 단계다. 값이 커질수록 요소가 크고 화면에서 멀리 떠 있다.

- **2px** — 아주 작은 표시(작은 칩, 강조 띠)
- **4px** — 배지, 칩, 태그
- **6px** — 입력창, 작은 카드
- **8px** — 모달, 검색창
- **10px** — 콘텐츠 카드 (쿠폰·이벤트·공지 카드의 기본값)
- **12px** — 바텀시트
- **9999px** — 알약 버튼, 프로필 이미지

테두리는 흰색 투명도 두 단계(6%, 12%)로만 그린다. 색 있는 테두리를 쓰지 않는다 — 경계는 색이 아니라 밝기 차이로 만든다.

### Named Rules

**모서리 위계 규칙 (The Corner Hierarchy Rule).** 모서리 값은 요소 크기와 함께 커진다. 배지 4 → 입력 6 → 모달 8 → 카드 10 → 시트 12. 작은 요소에 큰 모서리를 주면 체계가 흐트러진다.

## Components

**중요:** 이 프로젝트에는 아직 **공용 버튼·입력창·범용 모달 부품이 없다.** 화면마다 각자 만들어 쓰고 있으며, 이는 문서화 대상이 아니라 해결 대상이다. 아래는 실제로 존재하고 재사용되는 것만 기록한다.

### Badges

상태 배지, 라벨 배지, 고정 배지 세 종류가 공용으로 존재한다.

- **모양:** 모서리 4px, 높이 20px, 좌우 여백 8px, 테두리 없이 색을 채운다
- **글자:** 9px / 600 / 자간 0.04em, 항상 흰색
- **상태 종류:** 신규(`#16a34a`) · 인기(`#ff3b3b`) · 종료(`#2a2e3a`) · 추천(`#2563eb`) · 한정(`#f59e0b`) · 이벤트(`#ec4899`) · 보상(`#14b8a6`)
- **주의:** 이 일곱 색은 주 팔레트 밖의 값이다. 배지 안에서만 쓰이며 다른 곳으로 나가지 않는다

### Cards

- **모서리:** 10px
- **바탕:** 카드 슬레이트(`#1f1a29`). 카드 안에서 한 단계 더 띄울 부분만 리프티드 슬레이트(`#332947`)
- **그림자:** 없음
- **안쪽 여백:** 상하 20px / 좌우 16px, 요소 사이 간격 8px
- **종료된 항목:** 별도의 흐린 바탕으로 바꾸고 글자를 보조 색으로 낮춘다

### Chips

- **모양:** 모서리 4px, 높이 36px, 좌우 여백 12px
- **기본:** 리프티드 슬레이트 바탕 + 보조 글자색
- **선택됨:** 시그널 딥(`#6d4ad3`) 바탕 + 흰 글자
- **배치:** 좁은 화면에서 가로로 스크롤된다. 줄바꿈하지 않는다

### Inputs

- **모양:** 모서리 8px, 높이 36px, 좌우 여백 12px
- **바탕:** 오버레이 슬레이트(`#18141f`) — 주변보다 눌려 보이게 한다
- **안내 문구:** 플레이스홀더 색(`#7c6f8f`)
- **초점:** 테두리를 강한 단계(12%)로 올린다. 빛번짐 효과를 쓰지 않는다

### Bottom Sheet

- **모양:** 위쪽 모서리만 12px, 아래에서 올라온다
- **바탕:** 모달 차콜(`#1e1e1e`)
- **뒤 배경:** 검은 막 55%
- **용도:** 등록·수정 입력을 담는 기본 그릇

### Section Block

제목 + 본문을 묶는 구역 부품. 목록 화면의 기본 골격이며 구역 사이는 8px 구분선으로 나뉜다.

### 상태 전환

전환은 짧다 — 배경과 색은 0.12~0.15초, 움직임은 0.2~0.25초. 가속 곡선은 `ease` 하나만 쓴다. 화면이 빠르게 느껴지는 것이 목적이므로 0.3초를 넘기지 않는다.

## Do's and Don'ts

### Do:

- **Do** 색을 쓸 때 의미 이름(CSS 변수)을 거친다. `#a86af0`을 화면에 직접 적지 않는다.
- **Do** 깊이가 필요하면 바탕을 한 단계 밝게 올린다 (카드 `#1f1a29` → 떠 있는 요소 `#332947`).
- **Do** 간격을 8pt 격자 아홉 단계 안에서 고른다.
- **Do** 누를 수 있는 요소를 최소 44px 높이로 만든다. 게임 중 한 손 조작이 기본 전제다.
- **Do** 목록에서 눈이 처음 닿는 줄을 13px / 600으로 둔다.
- **Do** 종료·만료된 항목은 지우지 말고 흐리게 낮춰 남긴다.

### Don't:

- **Don't** 카드·버튼·입력창·칩에 그림자를 넣는다. 그림자는 화면을 덮는 판에만 허용된다.
- **Don't** 보라를 넓은 면에 칠한다. 한 화면에서 10%를 넘기지 않는다.
- **Don't** 글자 크기를 아홉 단계 밖에서 새로 만든다 (14px, 16px 같은 값 금지).
- **Don't** 초록을 성공·네이버 외의 뜻으로, 빨강을 위험·마감 외의 뜻으로 쓴다.
- **Don't** 색 있는 테두리를 그린다. 경계는 흰색 투명도 6% 또는 12%로만 만든다.
- **Don't** 폭 값 `480px`을 화면 파일에 숫자로 직접 적는다. 이름 붙인 값을 거친다.
- **Don't** 화면 파일 안에서 버튼·입력창을 새로 꾸민다. 공용 부품이 없다는 건 만들어야 한다는 뜻이지, 각자 만들라는 뜻이 아니다.
