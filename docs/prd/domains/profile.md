# 도메인: profile

## A.1 현재 상태

- **분류**: **live** (auth state 만 사용, 별도 fetch 없음)
- **모바일 전환 진척도**: **단일 화면, 분량 작음** (`page/` 만 존재, mobile/ 폴더 없음)
- 폴더 구조 (변종 — 표준과 다름):
  ```
  domains/profile/
  └── page/
      └── UserProfile.jsx (+ scss 1개)
  ```

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| UserProfile | `/mypage` | `web/src/domains/profile/page/UserProfile.jsx` | 단일 (분류 불가) | AuthGuard: USER+ |

## A.3 API 엔드포인트

### BE 노출

자체 없음. authentication 도메인의 `/api/users/me` 응답을 redux state 로 사용.

### FE 호출

- `state.auth.authority` 참조 (`UserProfile.jsx:7`) — ★ shape 불일치 의심

### 매칭 결과

- 호출 없음 (auth state 의존). authentication 도메인의 `/api/users/me` healthCheck 응답을 사용

## A.4 DB 테이블 + Mapper

자체 테이블 없음. authentication 도메인의 `site_users` 사용.

## A.5 권한 / 가드

- AuthGuard USER+ (`UserRoutes.jsx`)
- `/mypage` 라우트 진입 시 인증 필수

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| 🔥 **R3: `state.auth.authority` shape 불일치** (`UserProfile.jsx:7` 참조하는데 slice 에 정의 안 됨) | `fe/state-and-data.md:30,126`, `risk-and-priority.md #3` | ★ Phase 0 차단 fix 대상 — **authentication** 도메인에서 fix 후 본 도메인 영향 |
| 분량 작음, 모바일 리뉴얼 미진행 추정 (`fe-map.md` 행 50) | — | 단일 화면 패턴 결정만 하면 됨 |

## A.7 dead 항목 (이 도메인 안)

- 없음

## A.8 ★ Owner 결정 필요 (도메인 한정)

- 모바일 리뉴얼 시 `mobile/` 폴더로 표준 구조 정렬 여부 (현재 `page/` 단일)

---

## B.1 기능 요구사항 (미작성 — Owner 채움)

> 이 섹션은 도메인별 상세 기획 시 채울 영역. A 섹션을 사실 baseline 으로 사용.

- [ ] 기능 1: ...
  - 사용자 시나리오:
  - acceptance criteria:
  - 의존 API/테이블:
- [ ] 기능 2: ...

## B.2 신규 기능 (미작성)

- [ ] ...

## B.3 우선순위 (미작성)

- P0 / P1 / P2

## B.4 KPI / 성공지표 (미작성)

## B.5 디자인 / Figma 참조 (미작성)

- figma-spec-validator 단계에서 채워질 영역
