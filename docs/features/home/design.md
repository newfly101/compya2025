---
spec_version: 1.1.0
created: 2026-04-14
updated: 2026-10-02
---

# home — 설계

## 1. 화면 구조

| 화면 ID | 화면 | 영역 배치 |
|---|---|---|
| SC-07-01 | 홈 | `<MobileLayout>` 본문 세로 스택 — 히어로 → 바로가기(퀵메뉴) → 공지사항 → 오늘 히스토리 모드(로그인 + 선호 레전드 있을 때만) → 이번 주기 일정(같은 조건, 실패 시 숨김 — 일정은 홈에서만, 보유 현황에는 없음) → 내 컬렉션(비로그인은 로그인 유도 카드) → 후원 → 퀴즈 → 최신 쿠폰(+광고) → 진행 중인 이벤트 |
| 미부여 | 바로가기 편집 | 로그인 사용자 전용 — 서랍 메뉴 전체 중 최대 8개 선택, 행 왼쪽 ⋮⋮ 끌기로 순서 변경(↑↓ 버튼 없음), `기본값으로` · `저장` |

커뮤니티 인기글·자유게시판 섹션은 `community` 도메인 동결로 주석 처리돼 있다(코드에 남아 있으나 렌더 안 됨).

## 2. 상태

| 상태 | 조건 | 화면에 보이는 것 |
|---|---|---|
| 최초 로딩 | `loading && !loaded` | 섹션별 `Skeleton`(쿠폰·이벤트는 1개, 높이 96) |
| 재방문 | `loaded === true` | 스켈레톤 없이 곧바로 최신 값(성공 시) 또는 이전 값(실패 시 §오류와 동시) |
| 오류 | 각 섹션 요청 실패 | 쿠폰·이벤트: `StateBox status="error" compact` + 재시도 / 퀴즈: 값이 남아 있어도 오류 표시 |
| 빈 상태 | 쿠폰/이벤트 0건 | `StateBox status="empty" compact`("진행 중인 쿠폰/이벤트가 없습니다") + 「더보기」 링크 비활성 |
| 정상 | 데이터 1건 이상 | `CouponListHorizontal`/`EventListHorizontal`/`NoticeSection`/`QuizSection` |

## 3. 흐름

```mermaid
sequenceDiagram
    participant U as 이용자
    participant FE as 홈(FE)
    participant BE as 서버

    U->>FE: / 진입
    FE->>BE: GET /api/home
    BE->>BE: 쿠폰·이벤트·공지·퀴즈 각 서비스 조합
    BE->>FE: 200 HomeResponse(섹션별 값 + failedSections)
    alt 특정 섹션이 failedSections에 있음
        FE->>FE: 그 섹션만 StateBox status="error"
    else 정상
        FE->>FE: 섹션별 데이터 렌더, loaded=true
    end
    U->>FE: 「더보기」 클릭(데이터 1건 이상일 때만 활성)
    FE->>U: 해당 목록 화면(/coupons, /events, /notices)으로 이동
```

## 4. 디자인 값

바로가기는 기본 7개, 로그인 사용자는 앞에 "내 재료 보유 현황"·"내 레전드 스킬 기록"이 붙어 최대 8개다. 선택은 브라우저(`localStorage` `home.shortcuts.v1`)에 저장한다(REQ-HM-14).

섹션 간 간격은 `$space-6`(섹션 간 gap) 토큰을 따른다(`fe-design.md` § 1). 광고 슬롯은 쿠폰 섹션과 공지 섹션 사이 1곳, 배치 규칙은 `fe-ads.md` § 2·§ 3(`HOME` 슬롯) 그대로다. 빈 상태·오류 색은 상태 축(§ 4)만 쓴다.

## 5. 서버와 주고받는 것

| 요청 | 응답 | 실패하면 |
|---|---|---|
| `GET /api/home` | `{coupons, events, notices, quiz, failedSections}` | 응답 자체는 200 유지, 실패 섹션만 `failedSections`에 이름이 들어가고 그 섹션만 오류 표시 |
| `POST /statistics/support-click` | 204(봉투 없음) | 로그인 사용자만 호출, 실패해도 화면 동작에 영향 없음(fire-and-forget) |

## 6. Figma

| 화면 | node-id |
|---|---|
| `10 홈 (로그인)` | 537:1986 |
| `11 홈 (비로그인)` | 537:2170 |
| `12 홈 바로가기 편집` | 538:2059 |
| `13 서랍 메뉴` | 538:2141 |
| `14 사용자 흐름도` | 540:2143 |
| (옛 시안) 홈 (비로그인) | 508:1247 |
| (옛 시안) 홈 (로그인) | 508:1308 |
| (옛 시안) 서랍 메뉴 펼침 · 접힘 | 507:1172 · 507:1297 |
| (옛 시안) 바로가기 편집 · 드래그 중 | 511:1363 · 516:1356 |
| (옛 시안) 사용자 흐름도 | 514:1350 |
| 신규 부품 `C/LCF/DrawerRow` · `DrawerSubRow` · `QuickTile` | 506:1106 · 506:1113 · 506:1120 |

옛 시안은 `legendContentFlow / ` 접두(페이지 `0:1`). 홈 전체 정본 파일은 여전히 없다(`screen-id.md` § 4).
