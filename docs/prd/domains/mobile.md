# 도메인: mobile (공용 더미)

> ★ **폐기 권고** (Owner 결정 #3). Part A 만 작성. Part B 생략.

## A.1 현재 상태

- **분류**: **폐기 권고** — 도메인이 아닌 모바일 공용 컴포넌트 묶음 추정. import 0건 + placeholder
- **모바일 전환 진척도**: n/a (도메인이 아님)
- 폴더 구조:
  ```
  domains/mobile/
  ├── home/pages/MobileHomePage.jsx     # placeholder ("어????????????")
  └── components/                        # tipCard, sectionHeader, quickNav, eventCard,
                                         #  pageLayout, communityItem, noticeItem, fulleventcard
                                         # 모두 import 0건
  ```

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 | 상태 |
|---|---|---|---|
| MobileHomePage | (라우트 등록 안 됨) | `web/src/domains/mobile/home/pages/MobileHomePage.jsx` | placeholder, import 0건 — dead |

활성 진입은 `domains/home/components/HomeScreen.jsx` (home 도메인 PRD 참조).

## A.3 API 엔드포인트

해당 없음 (도메인 아님).

## A.4 DB 테이블 + Mapper

해당 없음.

## A.5 권한 / 가드

해당 없음.

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| Owner 결정 #3 — `domains/mobile/` 폴더 + MobileHomePage 처리 결정 필요 | `_overview.md §2 결정 3`, `fe-map.md ★ Owner 확정 #6`, `dead-confirmed.md 1-A` | ◐ 모바일 리뉴얼 직접 차단 아님 |
| 결정 옵션: (A) 즉시 폐기 (권장) / (B) 공용 승격 / (C) `domains/home/` 흡수 | 동상 | |

## A.7 dead 항목 (이 도메인 안)

- **폴더 통째 dead** (`fe/dead-suspects.md A`):
  - `web/src/domains/mobile/home/pages/MobileHomePage.jsx`
  - `web/src/domains/mobile/components/{tipCard, sectionHeader, quickNav, eventCard, pageLayout, communityItem, noticeItem, fulleventcard}/**`
- 즉시 정리 가능 후보 (`dead-confirmed.md 1-A`)

## A.8 ★ Owner 결정 필요 (도메인 한정)

- **결정 #3 (◐)**: 즉시 폐기 / 공용 승격 / home 흡수 — (A) 권장
- 권장 액션: 폴더 통째 삭제. 진입점 영향 0 (HomeScreen 이 활성 진입)

> **Part B 생략** — 도메인 아님. 폐기 권고.
