# BE dead-suspects

> 코드 grep 0 / 0 호출 추정 항목 + 정의되어 있으나 컨트롤러에서 호출되지 않는 service 메서드.
> 검증 필수 — runtime profile / FE 호출 흔적 없으면 제거 후보.

---

## 1. 컨트롤러 진입점 비어 있는 클래스

### 1.1 `FunPlayerCardController` (`/api/player-cards`)
- 클래스 body 비어 있음 (`src/main/java/com/dawne/com2usbaseball/domain/fun/playerCard/controller/FunPlayerCardController.java`)
- bean 이름 `PlayerCardControllerV2` (다른 controller 와 충돌 회피)
- 위험: 빈 controller 가 path mapping `/api/player-cards` 를 점유 → 추후 다른 controller 가 같은 prefix 사용 시 충돌
- 권고: 미구현 상태면 클래스 자체 삭제 또는 TODO 주석 명시

---

## 2. service 정의 + 컨트롤러 노출 없음

### 2.1 `PostServiceImpl` 카운터 메서드들
파일: `src/main/java/com/dawne/com2usbaseball/domain/community/service/posts/PostServiceImpl.java`

| 메서드 | 노출? | 비고 |
|---|---|---|
| `increasePostCommentCount(Long id)` | ❌ | CommentService 에서 호출되어야 정합성 유지 — 코드 grep 결과 호출처 미확인 |
| `decreasePostCommentCount(Long id)` | ❌ | 동일 |
| `increasePostLikeCount(Long id)` | ❌ | PostReactionService 에서 호출되어야 함. 검증 필요 |
| `decreasePostLikeCount(Long id)` | ❌ | 동일 |
| `increasePostDislikeCount(Long id)` | ❌ | 동일 |
| `decreasePostDislikeCount(Long id)` | ❌ | 동일 |
| `increasePostReportCount(Long id)` | ❌ | ReportService 에서 호출되어야 함. 검증 필요 |

> CommentController 에는 increase/decrease like/dislike/report endpoint 가 있음. PostController 에는 없음 — 비대칭. PostReactionService 가 대신 카운터 갱신할 가능성 ❓.

### 2.2 `AdminPlayerCardServiceImpl` 미구현 메서드
파일: `src/main/java/com/dawne/com2usbaseball/domain/player/service/AdminPlayerCardServiceImpl.java`

```java
public ListResponse<PlayerCardResponse> getPlayerInfo() { return null; }
public OperationResponse<PlayerMessages> updatePlayerCard()  { return null; }
```

- `getPlayerInfo()` interface 메서드 존재. 컨트롤러에 호출 코드 없음 (주석 처리됨)
- `updatePlayerCard()` 동일
- 권고: interface 에서 제거 또는 NotImplementedException throw. 현재 NPE 위험 (호출자 `null` 반환 → 이후 처리 NPE)

### 2.3 `FunPlayerCardServiceImpl` 메서드
파일: `src/main/java/com/dawne/com2usbaseball/domain/fun/playerCard/service/FunPlayerCardServiceImpl.java`

| 메서드 | 컨트롤러 노출? | 비고 |
|---|---|---|
| `delete(Long id)` | ❌ | `FunAdminPlayerCardController` 에 매핑 없음 |
| `getByCardCode(String cardCode)` | ❌ | 어떤 controller / service 도 미호출 |
| `getAll()` | ❌ | 동일 |

---

## 3. RefreshToken cleanup batch 미구현

`RefreshTokenRepository.deleteExpired()` / `RefreshTokenMapper.deleteExpired()` 정의됨 — 호출하는 scheduler / job 없음.
- `site_refresh_tokens` 의 `expires_at < NOW()` row 가 누적됨
- 운영상 영향: 테이블 비대 + 인덱스 비효율
- 권고: ops 트랙에서 `@Scheduled` cron job 추가

---

## 4. Service / Repository 호출 패턴 mismatch

### 4.1 `NoticeRepository.getNoticeDetail` 의 throw
- repository 에서 `BaseException` throw — service 책임 침범
- service 에서 동일 검증 다시 하지 않으면 OK 이지만, repository 의 데이터 액세스 책임 위반
- 권고: throw 제거 + service 단으로 이동 (`NoticeServiceImpl.getNoticeDetail` 가 null 검증)

### 4.2 `AdminNoticeRepository.getAdminNoticeDetail` 동일

---

## 5. 주석 처리된 코드

### 5.1 `AdminPlayerCardController` (`src/main/java/com/dawne/com2usbaseball/domain/player/controller/AdminPlayerCardController.java`)

5 개 메서드 코드 주석:
- `getAllPlayerCardList()` `GET /api/admin/player`
- `getPlayerCardListByGrade(@PathVariable Grade)` `GET /api/admin/player/grade/{grade}`
- `updatePlayerCard(@PathVariable Long id)` `PATCH /api/admin/player/{id}`
- `updatePlayerCardAttribute` `PATCH /api/admin/player/{id}/attribute`
- `createPlayerCardList` `POST /api/admin/player/list`
- `createPlayerCardAttributeList` `POST /api/admin/player/list/attribute`

권고: 미구현이면 주석 제거 + GitHub issue 로 이동. legacy 표시 + TODO 만 남기는 게 깨끗.

### 5.2 `UploadController` (`src/main/java/com/dawne/com2usbaseball/domain/admin/controller/UploadController.java`)
- `uploadImage` 메서드 끝에 응답 형식 변경 TODO 주석 (`{ "url": ..., "fileName": ... }` 으로 변경 필요)

---

## 6. CommentMapper / Mapper interface 정의 + 미사용 method ❓

전수 검사는 별도. 검증 후보:
- `community/repository/mapper/CommentMapper` — `getReplyListByParentCommentId` 등 일부 메서드가 service에서 호출되는지 확인 필요
- `community/repository/mapper/ReportMapper` — admin endpoint 다수가 정의됨. service / repository 가 호출 여부 검증

---

## 7. config / common 미사용 의심

### 7.1 `CommonMessages` 사용 범위
파일: `common/enums/CommonMessages.java`
- `SUCCESS` — `GlobalResponse.success(data)` 기본 코드
- `INTERNAL_SERVER_ERROR` — `GlobalExceptionHandler.handleException` 의 fallback

활성. 미사용 아님.

### 7.2 `JsonUtils.toList` / `toObject`
파일: `common/util/JsonUtils.java`
- 코드 grep 호출처 0 의심 ❓ — JSON 컬럼 (`positions`, `traits`, `attributes`) 처리에 쓰일 수 있으나 mapper XML 단에서 직접 읽으므로 service 호출 없음
- 권고: legacy player 도메인이 JSON 컬럼 매핑 추가하면 사용 — 현재는 미호출. 검증 필요

### 7.3 `ClientInfoExtractor.getCountry` / `safe`
- `AccessLogFilter` 가 사용. 활성

---

## 8. mapping 위치 / namespace mismatch

### 8.1 ⚠ `PlayerCardMapper.xml` (fun/playerCard)
- XML namespace: `com.dawne.com2usbaseball.domain.fun.playerCard.mapper.PlayerCardMapper`
- Java interface: `com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper.FunPlayerCardMapper`
- **동일 statement id (`insert/update/findById/...`) 가 양쪽에 존재** — XML statement 가 어떤 interface 와도 바인딩 안 됨
- 결과: FunPlayerCardRepository 가 XML 의 SQL 을 사용하지 않음. **운영 시 DB 호출 실패 의심** ❓
- 권고: XML namespace 를 `repository.mapper.FunPlayerCardMapper` 로 수정 (또는 그 반대)

---

## 9. 도메인 관련

### 9.1 `BaseException.getDomain()`
- `GlobalExceptionHandler` 의 `log.warn("[{}] {} ...", e.getDomain(), e.getCode(), ...)` 에서만 사용
- 로그 prefix 자동화. 활성

### 9.2 `BaseException` 도메인 전용 서브클래스
- 코드 grep: `extends BaseException` 0 건
- 모든 throw 는 `new BaseException(...)` 직접
- 표준 — 미사용 패턴은 의도된 것

---

## 10. 실행 계획 (cleanup 우선순위)

| 우선 | 항목 | 효과 |
|---|---|---|
| 高 | `PlayerCardMapper.xml` namespace 수정 (fun/playerCard) | 운영 DB 호출 실패 차단 |
| 高 | `AdminPlayerCardServiceImpl` `return null` 메서드 NotImplementedException 변환 | NPE 차단 |
| 中 | `FunPlayerCardController` 빈 클래스 삭제 또는 TODO | path 충돌 차단 |
| 中 | `AdminPlayerCardController` 주석 코드 제거 | 가독성 |
| 中 | `RefreshTokenRepository.deleteExpired` 스케줄러 추가 | 테이블 정합 |
| 低 | `JsonUtils` 사용 검토 | 모듈 크기 |
| 低 | `Notice*Repository.getXxxDetail` throw 이동 | 책임 정합 |
