# BE unused-apis

> 컨트롤러에 정의되어 있으나 FE / 다른 backend / docs 에서 호출되지 않는 의심 endpoint.
> baseline = 컨트롤러 코드만. FE 호출 여부는 별도 grep (web/) 필요 — 본 문서는 BE 단 의심만.

---

## 1. 빈 컨트롤러

### 1.1 `FunPlayerCardController` `/api/player-cards`
- 메서드 0 개. path prefix 만 점유
- 권고: 클래스 삭제 또는 TODO 주석

---

## 2. 주석 처리된 컨트롤러 메서드 (`AdminPlayerCardController`)

`/api/admin/player/...` 6 개 endpoint 가 코드 주석 상태. 호출 안 됨.

| METHOD | PATH | 메서드 |
|---|---|---|
| GET | `/api/admin/player` | `getAllPlayerCardList()` |
| GET | `/api/admin/player/grade/{grade}` | `getPlayerCardListByGrade(@PathVariable Grade)` |
| PATCH | `/api/admin/player/{id}` | `updatePlayerCard(@PathVariable Long, @RequestBody)` |
| PATCH | `/api/admin/player/{id}/attribute` | `updatePlayerCardAttribute(...)` |
| POST | `/api/admin/player/list` | `createPlayerCardList(...)` |
| POST | `/api/admin/player/list/attribute` | `createPlayerCardAttributeList(...)` |

활성: `GET /api/admin/player/teams`, `POST /api/admin/player`.

---

## 3. dev-only / 운영 미사용

### 3.1 `SwaggerController` (`/api/dev/*`)
- `@Profile("local")` — 로컬 외에서는 자체 비활성
- `GET /api/dev/test-token`, `GET /api/dev/logout`
- prod 영향 없음. 운영 환경에서는 dead

---

## 4. 호출 불명확 / 검증 필요 (FE grep 필요)

| Endpoint | 위치 | 비고 |
|---|---|---|
| `GET /api/comments/{id}` | CommentController | 단건 조회 — FE 가 list 만 사용하면 dead 가능 |
| `GET /api/comments/{parentCommentId}/replies` | CommentController | replies 별도 조회 — FE 가 list 에 nested 로 받으면 미사용 가능 |
| `GET /api/post-tags/posts/{postId}` | PostTagController | post detail 에 tag 가 nested 로 포함되면 미사용 |
| `GET /api/post-tags/tags/{tagId}` | PostTagController | tag detail 화면 미구현 시 dead |
| `GET /api/post-reactions` (query: postId, userId) | PostReactionController | 단건 조회 — list 로 충분하면 dead |
| `GET /api/comment-reactions` (query) | CommentReactionController | 동일 |
| `GET /api/post-reactions/users/{userId}` | PostReactionController | 마이페이지 미구현 시 dead |
| `GET /api/comment-reactions/users/{userId}` | 동일 | |
| `POST /api/comments/{id}/report` | CommentController | `/api/reports` POST 와 중복 의심. report 카운터만 증가 vs 신고 row 생성 — 의도 분리됐는지 검증 |
| `GET /api/admin/reports/target` | AdminReportController | dashboard 단일 진입 시 미사용 가능 |
| `GET /api/post-reactions/posts/{postId}` | PostReactionController | post detail 응답에 reaction summary 포함되면 미사용 |
| `GET /api/comment-reactions/comments/{commentId}` | 동일 | |

---

## 5. 백엔드 자체에서 부르지 않는 service 메서드 (dead-suspects.md 와 일부 중복)

- `PostService.increase/decrease PostLike/Dislike/Comment/Report Count` 7 개
- `FunPlayerCardService.delete(id)`, `getByCardCode`, `getAll`
- `AdminPlayerCardService.getPlayerInfo()`, `updatePlayerCard()` (return null)

---

## 6. mapper interface 정의 + service 미사용 의심

### 6.1 `RefreshTokenMapper.deleteExpired` / `RefreshTokenRepository.deleteExpired`
- 정의됨, 호출처 0
- 스케줄러 미구현

### 6.2 `RefreshTokenMapper.deleteByUserId`
- `RefreshTokenRepository.deleteByUserId` 정의 — 호출처 grep 0
- "전체 디바이스 로그아웃" 기능 미구현

---

## 7. 후보 / 정리 가이드

| 카테고리 | 정리 방법 |
|---|---|
| 빈 controller | 삭제 |
| 주석 처리된 메서드 | 제거 + Issue 로 이동 |
| FE 미호출 의심 endpoint | FE grep 후 정말 dead 면 controller 메서드 삭제 |
| 카운터 갱신 메서드 (PostService) | 호출처 명시 (PostReactionService 가 부르도록 service 단 통합) 또는 삭제 |
| dev-only endpoint | `@Profile("local")` 명시 + 문서화 (현재 SwaggerController 만 적용됨) |
| schedule 누락 (cleanup batch) | ops 트랙으로 이관 |

---

## 8. ⚠ 유지해야 하는 endpoint

다음은 미사용 의심처럼 보이지만 운영에 필요:
- `POST /api/auth/refresh`, `POST /api/auth/logout` — JwtAuthFilter `shouldNotFilter` 대상. 인증 흐름 핵심
- `GET /api/users/me` — FE 인증 상태 검증
- `GET /api/skills/score-config` — admin 점수표 미러
- `GET /api/admin/{coupons,events,notices,quiz}` — 관리자 list 화면 진입점

검증 시 위 항목은 dead 처리 금지.
