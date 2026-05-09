# community 도메인 (모바일)

> 본 문서는 **`mobile/` 모바일 리뉴얼 부분만** 다룬다. (PC/admin 코드는 `feature/` · `page/`에 별도 존재)
> 추가 작업 시 이 문서의 패턴을 우선 따르고, 신규 컴포넌트/스타일은 **재사용 가능한 형태**로 만들어 일관성을 유지한다.

---

## 1. 폴더 구조

```
community/
├── README.md                              ← 이 문서
├── feature/, page/, store/                ← PC/admin 기존 코드 (BE 의존, 이번 작업 대상 아님)
└── mobile/
    ├── CommunityScreen.{jsx,module.scss}  ← 메인 화면 ("전체" 카테고리)
    ├── CategoryScreen.{jsx,module.scss}   ← 카테고리 단일 화면 (공용)
    ├── community.tokens.scss              ← 도메인 로컬 :root 토큰 (FAB / 신규 badge)
    ├── utils.js                           ← formatCount / getEffectiveBadge
    ├── hooks/
    │   ├── useCommunity.js                ← 메인 전용 (notices/hot/posts 페이지 + 무한 스크롤)
    │   └── useCategoryFeed.js             ← 카테고리 단일 (source/title/page)
    └── components/
        ├── section/Section.{jsx,module.scss}             ← 메인·카테고리 공용 섹션
        ├── categoryChip/CategoryChip.{jsx,module.scss}   ← 상단 카테고리 chip
        ├── postRow/PostRow.{jsx,module.scss}             ← 모든 게시글 row 공용 (notice/hot/post 모두)
        ├── hotPostCard/HotPostCard.{jsx,module.scss}     ← 메인 인기 급상승 가로 카드 전용
        ├── communityBadge/CommunityBadge.{jsx,module.scss} ← 공지/신규/인기 3종 post 상태 badge
        └── boardTagBadge/BoardTagBadge.{jsx,module.scss} ← 자유게시판 등 게시판 카테고리 tag 라벨
```

`@/data/community/`
- `categories.js` `notices.js` `hotPosts.js` `posts.js` — mock 데이터. BE 연동 시 fetcher로 교체 (현재 `useCategoryFeed.js` 안 `SOURCE_MAP`이 단일 분기 지점)

---

## 2. 라우팅 / 진입

- `routePath.js`: `community: "/community"` / `routeMeta.js`: `COMMUNITY`
- `app/page/CommunityPage.jsx` (2026-05-09 폐기 — community 정리 보류 中. IA 재개 시 도메인 mobile/feature 직접 lazy 흡수)
- 자체 헤더 없음 — 글로벌 `MobileLayout` TopBar(home variant: 햄버거 + 로고 + 로그인) 그대로 사용

---

## 3. 화면 구성

### 메인 (`selectedCategory === "all"`)
1. 카테고리 chip 행 (가로 스크롤)
2. **공지사항** — 최신 3개 고정, "전체 보기 →" 클릭 시 `notice` 카테고리로 점프
3. **인기 급상승** — 가로 스크롤 `HotPostCard`, 5개씩 페이지(rootMargin으로 끝 도달 감지)
4. **최신 게시글** — `PostRow` 세로 무한 스크롤, 10개씩 페이지

### 카테고리 단일 (`selectedCategory !== "all"`)
- `<CategoryScreen key={selectedCategory} category={selectedCategory} />` 단일 마운트
- 모든 카테고리에서 **`PostRow` 재사용** (인기급상승 포함, 가로 스크롤 아님)
- 우측 라벨은 "전체 보기 →"가 아닌 **"총 N개"** (`Section.rightText`)
- `key` prop으로 카테고리 변경 시 hook 자동 재초기화 → page state 자동 reset

### 공통
- 우측 하단 **fixed FAB** (`✏️ 글쓰기`) — 액션 미연결 (`TODO` 주석)

---

## 4. 컴포넌트 재사용 원칙

| 컴포넌트 | 책임 | 재사용 위치 |
| --- | --- | --- |
| `Section` | 좌측 보라 strip + 타이틀 + 우측 슬롯(`onShowAll` 또는 `rightText`) | 메인 3섹션 + CategoryScreen |
| `CategoryChip` | 단일 chip (선택 시 brand) | 카테고리 행 |
| `PostRow` | 게시글 1행 — badge + title + 메타 + (옵션)썸네일 + 댓글 박스 | 메인 공지/최신 + CategoryScreen 모든 카테고리 |
| `HotPostCard` | 가로 스크롤 카드 (썸네일 위, 타이틀/메타 아래) | 메인 인기 급상승 **전용** |
| `CommunityBadge` | 공지/신규/인기 3종 post 상태 badge | `PostRow` 안 (`badgeSlot`) |
| `BoardTagBadge` | 게시판 카테고리 tag 라벨 (예: "투수 공략") | `PostRow.tagBadge` prop, HomeScreen 자유게시판 등 |

### 분리 원칙 (memory `feedback_component_decomposition.md` 따름)
- **반복 렌더 + 도메인 의미가 명확한 것만** 별도 컴포넌트로 분리
- 1회 사용하는 작은 markup은 부모 화면 안에 인라인 (이번 작업의 inline `Section`이 2번째 사용처가 생겨서 별도 파일로 승격된 케이스 참조)

### 신규 컴포넌트 추가 가이드
1. 같은 컴포넌트로 표현 가능한 디자인이 이미 있는지 먼저 확인 (특히 `PostRow`, `Section`, `CommunityBadge`, `CategoryChip`)
2. props 추가/옵션화로 해결 가능하면 새 컴포넌트 만들지 말고 기존 확장
3. 컴포넌트가 새로 필요해도 **반복/변형/외부재사용** 셋 중 하나는 충족할 것
4. 폴더 위치: `mobile/components/{name}/{Name}.{jsx,module.scss}` (camelCase 폴더, PascalCase 파일)

---

## 5. 데이터 / 비즈니스 로직

- **Redux 미사용** — 정적 mock 기반이라 hook 안에서 `useState`/`useMemo`로 충분
- **카테고리별 source 분기**: `useCategoryFeed.js`의 `SOURCE_MAP`이 유일한 분기 지점. 추후 BE 연동 시 여기를 endpoint/fetcher 매핑으로 교체
- **신규 badge TTL**: `utils.js`의 `getEffectiveBadge(post, now=Date.now())` — `post.badge === "new"`이고 `createdAt` 기준 3시간 초과면 `null` 반환 (자동 숨김). 시간 비교는 호출자가 `now` 주입 가능 (테스트/시간 고정)
- **카운트 포맷**: `formatCount(n)` — 1000 미만은 그대로, 이상은 "1.2K"

### Mock 데이터 추가 시
- `posts.js`의 `createdAt`은 `Date.now() - idx*25분` 패턴 — 신규 TTL 검증용. 신규 룰 시각 확인이 필요한 케이스는 이 분포 내에서 위치 조정
- `hotPosts.js`도 `PostRow`에 들어가도록 `author/timeText/thumbnail` 필드 보유
- BE 연동 시 mock data 모듈은 동일 shape 유지하면서 fetcher 결과로 대체

---

## 6. 스타일 / 토큰 일관성

### 글로벌 토큰 (글로벌 `_colors.scss` 우선 사용)
- 배경: `var(--color-bg-deepest)` `--color-bg-overlay` `--color-bg-card`
- 브랜드: `var(--color-brand)` `--color-brand-dark` `--color-brand-tint` + `--color-brand-alpha-15`, `--color-brand-dark-alpha-15`
- 텍스트: `var(--color-text-primary/secondary/muted/code)`
- 보더: `var(--color-border)` `--color-border-strong`
- Sass: `$space-1 ~ $space-12`, `$radius-sm/md/lg/full`, `$font-size-9/10/11/12/13/15/17/22`, `$layout-h-pad`, `$layout-topbar-height`
- 믹스인: `@include flex-col($gap)`, `@include flex-center`, `@include scroll-row($gap, $pad)`, `@include text-body/body-bold/caption/micro/badge/section-title/ellipsis`, `@include page-layout`

**글로벌 `_colors.scss` 신규 색상 추가 금지** (memory `feedback_no_domain_header.md` 외 다른 메모리에도 명시)

### 도메인 로컬 토큰 (`community.tokens.scss`)
글로벌에 없는 색만 `:root`에 선언, `CommunityScreen.jsx`에서 side-effect import:
- `--color-community-fab-bg` (#4a2c93) — 글쓰기 FAB 배경 (brand-dark/brand-tint 사이 중간톤)
- `--color-community-new-bg` `--color-community-new-border` `--color-community-new-text` (#4ade80 계열) — 신규 badge (글로벌 emerald보다 밝은 연두~초록)

### Badge 시스템
- **`PinnedBadge`(글로벌) 사용**: 공지(`important`/노랑) / 인기(`mustread`/빨강)
- **`CommunityBadge`가 신규만 자체 styled span 처리** — 색을 도메인 로컬 토큰으로 override
- `PostRow`에서 status badge(공지/신규/인기)는 `width: 40px` 고정 wrapper(`.badgeSlot`)에 감싸서 모든 행이 같은 위치로 정렬되도록 함 — 라벨 길이 차이로 leading text가 어긋나지 않음
- **`BoardTagBadge`** — 게시판 카테고리 tag 라벨용 (자유게시판 등). status badge와 의미가 달라 별도 컴포넌트. `PostRow`의 `tagBadge` prop으로 주입되며 `.badgeSlot`이 아닌 title 안 inline으로 렌더(가변 폭)

### 폼 패턴
- 행 카드: `padding: $space-2 $space-3` + `border-radius: $radius-sm` + `background: var(--color-bg-overlay)` + `border: 1px solid var(--color-border)`
- 작은 라벨/카운트 박스: `width:40 height:40 border-radius:$radius-sm`, `background: var(--color-bg-card)`
- 좌측 보라 accent strip: `width:3 height:13 border-radius:2 bg:var(--color-brand)` (Section 컴포넌트에 캡슐화 — 새 섹션 만들 때 이 패턴 재정의 X)

---

## 7. UX 결정 기록

- **자체 헤더 금지** (memory `feedback_no_domain_header.md`) — 글로벌 TopBar에 위임. 사용자는 햄버거 메뉴/로고로 home 이탈
- **PostRow의 thumb 유무는 우측 폭만 변경**, CommentBox 위치는 항상 row 우측 끝 + 세로 가운데
- **badge ↔ title은 위쪽 라인 정렬** (`align-items: flex-start`) — 1줄/2줄 모두 일관
- **카테고리 변경 시** 하단 콘텐츠는 unmount/remount(`key={selectedCategory}`) → page state 자동 리셋
- **FAB은 항상 fixed, z-index 50** — 액션은 후순위, TODO 주석으로 표시

---

## 8. 후순위 (미구현)

- 글쓰기 / 좋아요 / 싫어요 / 댓글 입력
- 게시글 상세 라우트 (`/community/post/:id`)
- guest/user/admin 권한 분기 prompt
- "MY구독" 카테고리 (현재 `categories.js` 주석 처리)
- 카테고리 접이식 토글 (UI 일부 가림)
- burger를 community 카테고리로 분기 (글로벌 burger 변형)
- BE 연동 — `useCategoryFeed.js`의 `SOURCE_MAP`을 fetcher로 교체

---

## 9. 추가 작업 체크리스트

새 화면/기능 추가 전:
- [ ] 자체 헤더 만들지 않았는가? (글로벌 TopBar 사용)
- [ ] 새 색상이 정말 필요한가? (글로벌 토큰 우선, 부족 시 `community.tokens.scss`에만 추가)
- [ ] 새 컴포넌트 분리가 정당한가? (반복/변형/외부재사용 중 하나 충족)
- [ ] `PostRow` / `CommunityBadge` / `Section` / `CategoryChip` 로 표현 가능한가? props 확장으로 해결되는가?
- [ ] mock data shape이 BE 연동 시점에도 호환되는가?
- [ ] FAB / 글로벌 TopBar 기능과 충돌하지 않는가?
- [ ] guest 사용자가 진입 가능한 화면인가? 로그인 분기가 필요한가?
