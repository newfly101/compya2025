# BE services

> 도메인 service 패턴. baseline = `domain/**/service/`.
> 핵심 규칙: 트랜잭션 / 캐시 evict / `BaseException` throw / `DataIntegrityViolation` & `DuplicateKeyException` 캐치 패턴.

---

## 1. Service 표준 어노테이션 패턴

```java
@Service
@RequiredArgsConstructor
@Transactional                    // 또는 (readOnly = true) — read-heavy 도메인
public class XxxAdminServiceImpl implements XxxAdminService {

    private final XxxAdminRepository repository;
    private final XxxMapStruct mapStruct;
}
```

| 어노테이션 | 용도 | 비고 |
|---|---|---|
| `@Service` | Spring bean 등록 | 인터페이스 + Impl 분리 표준 |
| `@RequiredArgsConstructor` | final 필드 생성자 주입 | Lombok |
| `@Transactional` | 클래스 또는 메서드 단위 | write 도메인 |
| `@Transactional(readOnly = true)` | read 메서드 / read-only 서비스 | 메서드 단위 override 흔함 |
| `@Cacheable(value, key)` | 캐시 read | scope 키는 `'public'`, `'admin'`, `#id + '_public'` 등 |
| `@CacheEvict` / `@Caching(evict={...})` | Spring 표준 evict | event/notice/quiz/community-related |
| `@CacheEvictAfterCommit(cacheName, keys)` | 커스텀 — 트랜잭션 commit 후 evict | coupon 도메인. `common/support/cache/` |

---

## 2. 트랜잭션 패턴

### 2.1 클래스 = `@Transactional`, 메서드 read 만 override

```java
@Service @Transactional
public class CouponAdminServiceImpl implements CouponAdminService {

    @Transactional(readOnly = true)
    @Cacheable(value = "coupons", key = "'admin'")
    public List<CouponResponse> getCouponLists() { ... }

    @Transactional
    @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
    public CouponResponse createCoupon(CouponRequest request) { ... }
}
```

### 2.2 클래스 = `@Transactional(readOnly = true)`, write 메서드만 override

```java
@Service @Transactional(readOnly = true)
public class AdminNoticeServiceImpl implements AdminNoticeService {

    @Cacheable(value = "notice", key = "'admin'")
    public List<NoticeResponse> getAdminNoticeList() { ... }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "notice", key = "'admin'"),
        @CacheEvict(value = "notice", key = "'public'")
    })
    public NoticeResponse createNotice(NoticeRequest request) { ... }
}
```

### 2.3 클래스 어노테이션 없음 (예외 사례)

- `PlayerCardServiceImpl` (legacy 조회 전용) — 트랜잭션 어노테이션 자체 없음 + `@Cacheable` 만.
- `CoachSkillServiceImpl`, `SkillScoreConfigServiceImpl` — 동일.
- 표준 신규 도메인은 클래스 단위 `@Transactional` 명시 권장.

---

## 3. 예외 throw 표준

도메인 전용 `XxxException` 클래스는 **만들지 않는다**. `BaseException` 직접 사용.

```java
EventEntity event = repository.findById(id)
    .orElseThrow(() -> new BaseException(EventMessages.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND));

if (!repository.saveEvent(event)) {
    throw new BaseException(EventMessages.EVENT_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
}
```

`GlobalExceptionHandler` 가 `BaseException` 을 잡아 `ResponseEntity.status(status).body(GlobalResponse.fail(code))` 로 변환. `BaseException.getDomain()` 이 `Messages` 접미사 잘라낸 도메인 이름을 로그에 prefix.

### 3.1 HTTP status 매핑 컨벤션

| 상황 | status | code 예 |
|---|---|---|
| 자원 없음 | `404 NOT_FOUND` | `XXX_NOT_FOUND` |
| 인증 누락/실패 | `401 UNAUTHORIZED` | `AUTH_UNAUTHORIZED`, `AUTH_REFRESH_TOKEN_EXPIRED` |
| 차단된 사용자 | `403 FORBIDDEN` | `AUTH_USER_BLOCKED` |
| UNIQUE 위반 | `409 CONFLICT` | `COUPON_CODE_DUPLICATED`, `QUIZ_ROUND_DUPLICATED` |
| 외부 OAuth 실패 | `502 BAD_GATEWAY` | `AUTH_NAVER_TOKEN_FAILED` |
| 본문/페이로드 오류 | `400 BAD_REQUEST` | `NOTICE_INVALID_SOURCE_PAYLOAD` |
| insert/update DB 실패 | `500 INTERNAL_SERVER_ERROR` | `XXX_CREATED_FAILED`, `XXX_UPDATED_FAILED` |

---

## 4. UNIQUE 충돌 캐치 패턴

DB UNIQUE 제약을 도메인 코드로 변환:

```java
@Override
@CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
public CouponResponse createCoupon(CouponRequest request) {
    CouponEntity coupon = couponMapStruct.toEntity(request);
    try {
        if (!repository.insertCoupon(coupon)) {
            throw new BaseException(CouponMessages.COUPON_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        ...
    } catch (DataIntegrityViolationException e) {
        throw new BaseException(CouponMessages.COUPON_CODE_DUPLICATED, HttpStatus.CONFLICT);
    }
}
```

| 도메인 | UNIQUE 컬럼 | 캐치 클래스 | 변환 코드 |
|---|---|---|---|
| coupon | `coupon_code` | `DataIntegrityViolationException` | `COUPON_CODE_DUPLICATED` 409 |
| quiz | `round` | `DuplicateKeyException` | `QUIZ_ROUND_DUPLICATED` 409 |
| oauth | `(provider, provider_id)` | (캐치 없음 — `findOrCreateNaverUser` 가 select 후 insert) | — |

---

## 5. 캐시 evict 두 가지 패턴

### 5.1 Spring 표준 `@Caching(evict = {...})`

- 메서드 시작 시점에 evict 실행 → 메서드 throw 해도 cache 는 비워진 상태.
- 사용 도메인: event, notice, quiz, community-tag 등.

```java
@Caching(evict = {
    @CacheEvict(value = "events", key = "'external::admin'"),
    @CacheEvict(value = "events", key = "'external::public'")
})
public EventResponse createEvent(EventRequest request) { ... }
```

### 5.2 커스텀 `@CacheEvictAfterCommit`

- AOP `@AfterReturning` + TransactionSynchronization → **commit 성공 후** evict. 메서드 throw / 트랜잭션 rollback 시 evict 안 함.
- 트랜잭션 미적용 메서드에서는 즉시 evict (fallback).
- 사용 도메인: coupon (현재 유일).

```java
@CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
public CouponResponse createCoupon(CouponRequest request) { ... }
```

> 신규 도메인은 둘 중 **commit 후 evict 정합성이 더 안전** — 단, 도메인 일관성 위해 기존 패턴(`@Caching` evict)도 허용. 혼용은 같은 cacheName 안에서 금지.

---

## 6. 도메인별 service 인스턴스 매트릭스

| 도메인 | User Service | Admin Service | 추가 / support |
|---|---|---|---|
| coupon | `CouponUserServiceImpl` | `CouponAdminServiceImpl` | — |
| event | `EventUserServiceImpl` | `EventAdminServiceImpl` | — |
| notice | `NoticeServiceImpl` (user) | `AdminNoticeServiceImpl` | — |
| quiz | `QuizUserServiceImpl` | `QuizAdminServiceImpl` | — |
| oauth | `UserServiceImpl` (사용자 정보) | — | `AuthServiceImpl` (인증 흐름), `support/NaverOAuthService` |
| community | `BoardServiceImpl`, `PostServiceImpl`, `CommentServiceImpl`, `PostReactionServiceImpl`, `CommentReactionServiceImpl`, `PostTagServiceImpl`, `TagServiceImpl`, `ReportServiceImpl` | `AdminCommentServiceImpl`, `AdminTagServiceImpl`, `AdminReportServiceImpl` | sub-domain 단위 분리 (`service/board`, `service/posts`, `service/comment`, `service/reaction`, `service/report`, `service/tag`) |
| fun/playerCard | — (User 비어 있음) | `FunPlayerCardServiceImpl` (User+Admin 공용) | — |
| player | `PlayerCardServiceImpl` (legacy) | `AdminPlayerCardServiceImpl` (일부 미구현) | `service/support/{CardInfoMaker, CardNameGrouper}` |
| skill | `PlayerSkillsServiceImpl`, `CoachSkillServiceImpl`, `SkillScoreConfigServiceImpl` | — | `service/support/{SkillItemConvertor, SkillGradeGrouper}` |
| admin | — | — | `UploadServiceImpl` (S3) |

---

## 7. 인증 (oauth) service 흐름

`AuthServiceImpl` 이 단일 트랜잭션으로 여러 책임 조합:

```
loginWithNaver(code, state)
  └─ naverOAuthService.findOrCreateUser(code, state)         // 외부 RestTemplate + UserService
  └─ validateUserStatus(user)                                // ACTIVE 외 → 403
  └─ issueTokens(user)
        ├─ jwtProvider.createAccessToken(userId, role)       // JWT (HS256)
        ├─ jwtProvider.createRefreshToken()                  // opaque random 48 bytes
        └─ refreshTokenRepository.save(RefreshTokenEntity{userId, hash, expiresAt})

refresh(rawRefreshToken)
  └─ rawRefreshToken null/blank → AUTH_REFRESH_TOKEN_INVALID 401
  └─ findActiveByHash(hash) — 없으면 AUTH_REFRESH_TOKEN_EXPIRED 401
  └─ deleteByHash(hash)                                      // rotation: 기존 즉시 무효
  └─ userService.findActiveUserById(row.userId) + validateUserStatus
  └─ issueTokens(user)

logout(rawRefreshToken)
  └─ raw blank → no-op
  └─ deleteByHash(hash)                                      // 양쪽 cookie 만료는 controller 책임
```

`UserServiceImpl.findOrCreateNaverUser` 는 `Optional.orElseGet` 으로 select-then-insert, 마지막에 `updateUserLastLogin` 실행. `findActiveUserById` 가 status 검증 (BLOCKED/SUSPENDED/WITHDRAWN → 403).

---

## 8. 컨벤션 — 특수 케이스

### 8.1 Notice content sanitize

`AdminNoticeServiceImpl` 이 create / update 양쪽에 `Jsoup.clean(html, Safelist.relaxed())` 적용. INTERNAL/EXTERNAL source payload validation (`validateSourcePayload`):

- `source == INTERNAL` → `content` 필수, `externalUrl` null
- `source == EXTERNAL` → `externalUrl` 필수, `content` null
- 위반 시 `NOTICE_INVALID_SOURCE_PAYLOAD` 400

DB CHECK 제약과 동일 검증을 application 단에서도 수행 (이중).

### 8.2 PostService 카운터 패턴

`PostServiceImpl` 이 like/dislike/comment/report 카운터 8 개 메서드를 가짐. 각 메서드는 `getPostDetail(id)` (없으면 404) 후 `postRepository.increase/decreasePostXCount(id)` 호출. ⚠ 컨트롤러 노출은 일부만 (CommentController 만 like/dislike/report 노출). `PostReactionService` 가 reaction 저장 시 카운터 갱신 책임 추정 ❓.

### 8.3 player 도메인 빈 메서드

`AdminPlayerCardServiceImpl`:
- `getPlayerInfo()` → `return null`
- `updatePlayerCard()` → `return null`

미구현. 컨트롤러에서 호출되면 NPE. 신규 코드는 호출 금지.

### 8.4 fun/playerCard 의 `IllegalArgumentException`

`FunPlayerCardServiceImpl` 가 `BaseException` 대신 `IllegalArgumentException("존재하지 않는 id")` throw. `GlobalExceptionHandler.handle(Exception)` 가 500 + `INTERNAL_SERVER_ERROR` 로 처리 — 의미 손실. 신규는 `BaseException(<Messages>, HttpStatus.NOT_FOUND)` 로 변환 권장.

---

## 9. 신규 service 작성 체크리스트

- [ ] 인터페이스 + Impl 분리. interface 는 controller 만 의존
- [ ] 클래스에 `@Transactional` 또는 `@Transactional(readOnly = true)` 명시
- [ ] read 메서드는 `@Transactional(readOnly = true)` 으로 override (필요 시)
- [ ] write 메서드 cache evict 누락 없음 (`@Caching evict` 또는 `@CacheEvictAfterCommit`)
- [ ] 자원 없음 → `BaseException(<DOMAIN>_NOT_FOUND, NOT_FOUND)` `Optional.orElseThrow` 패턴
- [ ] insert/update 실패 → `BaseException(<DOMAIN>_<ACTION>_FAILED, INTERNAL_SERVER_ERROR)` (`return false` 시)
- [ ] DB UNIQUE 제약 있는 경우 `DataIntegrityViolationException` / `DuplicateKeyException` 캐치 → `<DOMAIN>_<X>_DUPLICATED` 409
- [ ] 컨트롤러에서 try-catch 금지. service 가 throw → GlobalExceptionHandler 가 응답 변환
- [ ] 외부 API 호출 (RestTemplate 등) 실패 → `BaseException(<DOMAIN>_<X>_FAILED, BAD_GATEWAY 502)`

---

## 10. 일탈 / 안티패턴 (신규 따라하지 말 것)

| # | 도메인 | 안티패턴 |
|---|---|---|
| 1 | fun/playerCard | `IllegalArgumentException` 직접 throw → 500 익명화. `BaseException` 사용 권장 |
| 2 | player AdminPlayerCardServiceImpl | 메서드 body `return null` (미구현) |
| 3 | community PostServiceImpl | 카운터 메서드 8 개 중 일부만 컨트롤러 노출 — dead code 의심 (dead-suspects.md) |
| 4 | notice repository | `getNoticeDetail` 가 직접 throw — service 책임으로 이동 권장 |
| 5 | NaverOAuthService | `RestTemplate restTemplate = new RestTemplate()` field 직접 생성 → bean 주입 (testability) 권장 |
| 6 | LoggingAspect | `@Service` / `@Repository` / `@Mapper` / Controller 광범위 AOP — slow/error 외 매 호출 INFO 로그. PII 노출 위험 있는 메서드는 `SENSITIVE_METHOD_KEYWORDS` 로 마스킹 (login/oauth/auth/...) |

---

## 11. 자주 쓰는 import cheat-sheet

```java
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.common.support.cache.CacheEvictAfterCommit;
import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.common.support.ListAssembler;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
```
