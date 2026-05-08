# Dead Suspects (BE 단독 추정)

> 본 프로젝트에는 의미 있는 단위/통합 테스트가 사실상 없음 (`src/test/java/com/dawne/com2usbaseball/Com2usbaseballApplicationTests.java` — `@SpringBootTest` 컨테이너 부팅 1 건만).
> 실제 사용 여부는 BE 코드만으로 확정 불가. 아래는 **BE 단독 신호**로 추정한 후보. FE 호출처 매핑 후 reconciler 가 최종 판정.

---

## ★ A. 빈 컨트롤러 — 명백히 미구현

| 컨트롤러 | path prefix | 파일:라인 | 신호 |
|---|---|---|---|
| `FunPlayerCardController` | `/api/player-cards` | src/main/java/com/dawne/com2usbaseball/domain/fun/playerCard/controller/FunPlayerCardController.java:9 | 클래스 본문 비어있음. mapping 0 개. Bean 만 등록 (`@RestController("PlayerCardControllerV2")`) |

---

## ★ B. DTO 가 빈 record — 호출되어도 실제 동작 안 함 추정

| 엔드포인트 | 컨트롤러:메서드 (file:line) | 신호 |
|---|---|---|
| `POST /api/admin/player-cards` | FunAdminPlayerCardController#create (src/main/java/com/dawne/com2usbaseball/domain/fun/playerCard/controller/FunAdminPlayerCardController.java:16) | 요청 DTO `FunPlayerCardCreateRequest` 가 필드 0 개. `mapper.toEntity` 호출 시 빈 entity → fun_player_card 의 NOT NULL 컬럼 위반 추정 |
| `PUT /api/admin/player-cards/{id}` | FunAdminPlayerCardController#update (.../FunAdminPlayerCardController.java:21) | 요청 DTO `FunPlayerCardUpdateRequest` 가 필드 0 개. `mapper.updateFromRequest` 가 사실상 no-op |
| `GET /api/admin/player-cards/{id}` | FunAdminPlayerCardController#get (.../FunAdminPlayerCardController.java:27) | 응답 DTO `FunPlayerCardResponse` 가 필드 0 개. 항상 `{}` 반환 |

> 위 3 개는 V2 마이그레이션 진행 중 스켈레톤. FE 호출 흔적은 별도 확인 필요지만 동작상 의미 없음.

---

## ★ C. 컨트롤러 내 주석 처리된 미구현 핸들러

`AdminPlayerCardController` (src/main/java/com/dawne/com2usbaseball/domain/player/controller/AdminPlayerCardController.java:21-58) 에 다음 핸들러가 **주석으로만** 존재:

| 의도된 path | 의도된 method | 신호 |
|---|---|---|
| `GET /api/admin/player` | `getAllPlayerCardList` | 주석 (file:21-23) |
| `GET /api/admin/player/grade/{grade}` | `getPlayerCardListByGrade` | 주석 (file:26-29) |
| `PATCH /api/admin/player/{id}` | `updatePlayerCard` | 주석 (file:41-44) |
| `PATCH /api/admin/player/{id}/attribute` | `updatePlayerCardAttribute` | 주석 (file:46-49) |
| `POST /api/admin/player/list` | `createPlayerCardList` | 주석 (file:51-54) |
| `POST /api/admin/player/list/attribute` | `createPlayerCardAttributeList` | 주석 (file:56-59) |

> Service `AdminPlayerCardServiceImpl#getPlayerInfo`, `#updatePlayerCard` 는 `return null` 스텁 (file:30-32, 79-81). 미구현.

---

## ★ D. Service 메서드 존재 — 컨트롤러 미노출 (호출 흔적 추정 어려움)

| Service 메서드 | 파일:라인 | 컨트롤러 노출 | 신호 |
|---|---|---|---|
| `PostService#getPostDetail(id)` (view 증가 없음) | src/main/java/com/dawne/com2usbaseball/domain/community/service/posts/PostServiceImpl.java:43 | AdminPostController 만 사용 (`GET /api/admin/posts/{id}`). 일반 사용자용 PostController 는 increase 버전만 노출 | 정상 (의도된 분리) |
| `PostService#increasePostLikeCount/Dislike/Comment/Report` 등 | .../PostServiceImpl.java:122-167 | 컨트롤러 직접 노출 없음. PostReactionService 등 다른 서비스 내부 호출 추정 | 호출 그래프 추적 필요 |
| `FunPlayerCardService#delete`, `#getByCardCode`, `#getAll` | src/main/java/com/dawne/com2usbaseball/domain/fun/playerCard/service/FunPlayerCardServiceImpl.java:43-71 | FunAdminPlayerCardController 미노출 | V2 미완 작업의 일부 |

---

## ★ E. 운영에서 의심스러운 dev/swagger 엔드포인트

| 엔드포인트 | 컨트롤러:메서드 | 신호 | 위험 |
|---|---|---|---|
| `GET /api/dev/test-token` | SwaggerController#getTestToken (src/main/java/com/dawne/com2usbaseball/domain/admin/controller/SwaggerController.java:18) | `@Tag(name="0. Swagger 인증")` — Swagger 환경 전용 도구. 운영(`application-prod.properties`)은 `springdoc.swagger-ui.enabled=false` 지만 컨트롤러 자체는 매핑 살아있음. SecurityConfig `/api/**` permitAll 영향 받음 | ★ 누구나 ADMIN JWT 발급 가능 — auth-and-flags.md 참조 |

---

## ★ F. .http 파일과 실제 라우트 불일치 (stale 흔적)

| 파일 | 호출 path | 현재 BE path | 신호 |
|---|---|---|---|
| `src/main/resources/test/event/getEventList.http:1` | `GET /api/events/list/external` | `GET /api/events/external` | path 변경 후 .http 미갱신 — 옛 버전 잔존 |
| `src/main/resources/test/event/getEventList.http:6` | `POST /api/events` (eventSource) | 실제 admin 라우트는 `POST /api/admin/events`, body 키도 `eventType` (eventSource 아님) | 옛 스키마. dead 호출 |

> 본 .http 파일들 자체는 BE 사용여부 신호 약함 (dev fixture).

---

## ★ G. 도메인 운영 보류 (db-map Owner 확정 기준)

| 도메인 | 컨트롤러 | 상태 | 비고 |
|---|---|---|---|
| `kbo` | KboGameController (`/api/kbo/matches/today`, `/{matchId}`) | 도메인 자체 보류 (kbocrol 미가동 → 운영 데이터 거의 0) | 라이브 트래픽 추정 미미. FE 가 호출은 함 (`KboGameController.java:18` Redux 연결 주석) |
| `player` (LEGACY) | PlayerCardController, AdminPlayerCardController | 운영 중이나 **fun_player_card 통폐합 후 폐기 예정** | 현재 배포가 legacy 기반이라 살아있음 |
| `fun_player_card` (V2) | FunPlayerCardController, FunAdminPlayerCardController | 스켈레톤. 위 A, B 항목 합 | 배포가 V2 로 전환되기 전까진 운영 미사용 |

---

## ★ H. owner 기억과 어긋난 항목 (검증 결과)

| 항목 | owner 기억 | 실제 BE 코드 | 결론 |
|---|---|---|---|
| coach 도메인 | "BE 코드 미작성" (db-map.md ★ Owner 확정 #4) | **wired**: `CoachSkillServiceImpl` (file:.../coach/CoachSkillServiceImpl.java:16) → `CoachRepository` → `CoachMapper.xml` → `coach`, `coach_skill_buff`, `coach_skill_condition` SELECT. `GET /api/skills/coach` 로 노출 + `@Cacheable("coachSkills")` | **연결됨**. owner 기억 갱신 필요 |

---

## 요약

- **확실 dead**: A (1 건), B (3 건), C (주석 6 건), 위 D 의 미노출 V2 메서드
- **운영 위험 dead 위장**: E (`/api/dev/test-token`) — 살아있지만 운영 노출 시 인증 우회 가능
- **owner 보류 도메인**: G (kbo, player legacy, fun_player_card V2)
- **owner 기억 ↔ 실제 어긋남**: H (coach BE 작성됨)
