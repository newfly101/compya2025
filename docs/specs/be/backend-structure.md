# Backend 구조 가이드 (com2usbaseball)

> Spring Boot 3.3 + Java 21 + MyBatis(MariaDB) + Spring Security(JWT) 기반 백엔드.
> 본 문서는 신규 도메인을 추가할 때 따라야 할 **8 layer 표준** 과 도메인별 실제 구현 패턴을 정리한다. 모두 실제 소스 코드 (`src/main/java/com/dawne/com2usbaseball/`) 와 `src/main/resources/mapper/` 를 근거로 작성.

---

## 1. 프로젝트 최상위 구조

```
src/main/java/com/dawne/com2usbaseball/
├─ Com2usbaseballApplication.java   # @SpringBootApplication + @EnableCaching + @MapperScan(annotationClass=Mapper.class)
├─ common/                          # 전역 enum / util / 공통 응답·예외 (도메인 의존 없음)
│  ├─ enums/                        # CommonMessages, Grade, Target, fun/, user/
│  ├─ support/                      # 글로벌 응답, 글로벌 예외, ListAssembler
│  │  ├─ advice/                    # GlobalResponseAdvice, GlobalExceptionHandler
│  │  ├─ dto/                       # GlobalResponse / ListResponse / OperationResponse
│  │  └─ exception/                 # BaseException
│  └─ util/                         # ClientInfoExtractor, JsonUtils
├─ config/                          # 인프라/Bean 설정 (Cache, Cors, Logging, S3, Security, Swagger, Web)
│  ├─ filter/                       # AccessLogFilter
│  └─ properties/                   # @ConfigurationProperties (Jwt / NaverOauth / S3)
├─ security/                        # 인증/인가 인프라 (JWT)
│  ├─ cookie/                       # AuthCookieFactory
│  ├─ filter/                       # JwtAuthFilter
│  └─ provider/                     # JwtProvider, AuthRedirectProvider
└─ domain/                          # 비즈니스 도메인 (8 layer 표준 적용 대상)
   ├─ admin/        # (현 상태) 운영 보조 — Upload / Swagger token. 8 layer 미준수 (의도적)
   ├─ community/    # 리뉴얼 진행 중
   ├─ coupon/
   ├─ event/
   ├─ fun/playerCard/  # fun_ 테이블 prefix 도메인
   ├─ notice/
   ├─ oauth/        # 인증/사용자 (authentication 도메인)
   ├─ player/       # 레거시 / 일부 진행 중
   ├─ quiz/
   └─ skill/
```

추가 자원:

- `src/main/resources/application.properties` — DB, MyBatis, JWT, Naver OAuth, S3, Swagger 등 **모든 외부 의존 환경값**.
- `src/main/resources/mapper/` — MyBatis Mapper XML.
  - `mapper/site/<domain>/` — `site_*` 테이블 (사이트 운영 도메인: notice, coupon, event, community)
  - `mapper/fun/<domain>/` — `fun_*` 테이블 (게임 콘텐츠 도메인: quiz, playerCard)
  - `mapper/player/`, `mapper/*Mapper.xml` — 레거시/사용자 정보 mapper.

`build.gradle` 핵심 의존성:

| 영역 | 의존성 |
|---|---|
| Web | `spring-boot-starter-web` |
| Security | `spring-boot-starter-security` |
| DB | `spring-boot-starter-jdbc`, `mariadb-java-client`, `mybatis-spring-boot-starter:3.0.3` |
| AOP | `spring-boot-starter-aop` |
| JWT | `jjwt-api/impl/jackson:0.11.5` |
| Cache | `spring-boot-starter-cache`, `caffeine` |
| Object Mapping | `mapstruct:1.5.5.Final` (+ processor) |
| Lombok | `lombok` (compileOnly + annotationProcessor) |
| Storage | `software.amazon.awssdk:s3:2.25.59` |
| Sanitizing | `jsoup:1.17.2` |
| API Doc | `springdoc-openapi-starter-webmvc-ui:2.6.0` |

---

## 2. 도메인 8 layer 표준

도메인 패키지는 다음 8 개 sub-package 를 가진다.

| # | Layer | 패키지 | 책임 | 표준 어노테이션·기술 |
|---|---|---|---|---|
| 1 | controller | `controller/` (+ `controller/docs/`) | HTTP 진입점 / 인가 어노테이션 / Swagger 인터페이스 implements | `@RestController`, `@RequestMapping`, `@PreAuthorize`, `implements XxxSwaggerDocs` |
| 2 | service | `service/` | 비즈니스 로직 / 트랜잭션 / 캐시 정책 / 도메인 예외 throw | `@Service`, `@Transactional`, `@Cacheable`, `@CacheEvict` (+ `interface` + `Impl`) |
| 3 | repository | `repository/` | MyBatis Mapper interface 를 감싸는 **얇은 Repository 클래스** (Optional 변환, 결과 boolean 변환 등) | `@Repository` + `@RequiredArgsConstructor` |
| 4 | mapper (DB) | `repository/mapper/` | **MyBatis Mapper interface** (XML 과 1:1 namespace 매칭) | `@Mapper`, `@Param` |
| 4` | mapper (객체 변환) | `dto/mapstruct/` | request ↔ entity ↔ response 변환 | MapStruct `@Mapper(componentModel="spring")` |
| 5 | dto | `dto/request/`, `dto/response/` | request / response 분리 — **모두 Java `record`** | `record`, `@JsonFormat(pattern="yyyy-MM-dd HH:mm")` |
| 6 | enums | `enums/` | 도메인 코드 enum + `XxxMessages` enum (응답·에러 코드 통일) | 순수 `enum` |
| 7 | exception | `exception/` | 도메인 전용 예외 (BaseException 상속) | `extends BaseException`, 생성자 `(Enum<?> code, HttpStatus status)` |
| 8 | entity | `entity/` | DB row 매핑용 POJO. **JPA `@Entity` 아님** — Lombok 으로 만든 일반 클래스 | `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor` |

> 주의: 본 프로젝트는 **JPA 를 사용하지 않는다**. `spring-data-jpa` 의존성도 없으며 `@Entity` / `JpaRepository` 도 없다. `entity` 라는 이름은 "DB row POJO" 의미일 뿐, JPA 엔티티가 아니다.

---

## 3. 도메인별 layer 구현 매트릭스

✓ 표준 준수 / △ 부분 구현 / ✗ 없음 / — 해당 없음

| Layer | coupon | event | notice | quiz | oauth (authentication) | community | fun/playerCard | admin |
|---|---|---|---|---|---|---|---|---|
| controller | ✓ User+Admin 분리 | ✓ User+Admin 분리 | ✓ User+Admin 분리 | ✓ User+Admin 분리 | ✓ Auth + User | ✓ Public + Admin (다수) | ✓ User+Admin (Fun 접두) | △ Upload + Swagger 토큰만 |
| service | ✓ User/Admin Impl 분리 | ✓ | ✓ | ✓ | ✓ (`AuthService`, `UserService`, `support/NaverOAuthService`) | ✓ (board, comment, post, reaction, report, tag 별 분리) | ✓ | △ `UploadService` 만 |
| repository (래퍼) | ✓ `CouponRepository` | ✓ `EventRepository` | ✓ `NoticeRepository` + `AdminNoticeRepository` (분리) | ✓ `QuizRepository` | ✓ `UserRepository` | ✓ 각 단위별 (Post, Board, Tag …) | ✓ `FunPlayerCardRepository` | ✗ |
| mapper (DB, MyBatis) | ✓ `CouponMapper` (interface + XML) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| mapper (DTO, MapStruct) | ✓ `CouponMapStruct` | ✓ `EventMapStruct` | ✓ `NoticeMapStruct` | ✓ `QuizMapStruct` (round → title 동적 합성) | ✓ `UserMapStruct` | ✓ 단위별 다수 | ✓ `FunPlayerCardDtoMapper` | ✗ |
| dto | ✓ record (req/res 분리) | ✓ record | ✓ record (Detail/Summary 추가) | ✓ record | ✓ record (응답만, request 없음) | ✓ record | ✓ record | ✗ |
| enums | ✓ `CouponMessages` | ✓ `EventMessages`, `EventType` | ✓ `NoticeMessages`, `NoticeSource` | ✓ `QuizMessages` | ✓ `AuthMessages`, `OAuthProvider`, `UserRole`, `UserStatus` | ✓ `LinkType`, `ReactionType`, … + `messages/CommunityMessages` | △ enums 폴더 없음 (공통 `common/enums/fun/` 사용) | ✗ |
| exception | ✓ `CouponException` | ✓ `EventException` | ✓ `NoticeException` | ✓ `QuizException` | ✓ `AuthException` | ✓ `CommunityException` | ✗ (8 layer 미준수) | ✗ |
| entity | ✓ POJO (`@Builder/@Getter/...`) | ✓ POJO | ✓ POJO | ✓ POJO | ✓ POJO | ✓ POJO | ✓ POJO (5개: PlayerCard, HitterStats, PitcherStats, PitcherPitchGrades, Positions) | ✗ |

### 핵심 결론 (실제 코드 근거)

- **DTO 는 모든 도메인에서 Java `record`** — request/response 폴더 분리.
  - 예시: `CouponRequest`(record) → `CouponMapStruct.toEntity` → `CouponEntity`(class) → `CouponMapStruct.toResponse` → `CouponResponse`(record).
- **Repository = MyBatis Mapper interface 의 얇은 wrapper 클래스**. JPA 아님.
  - `int → boolean` 변환 (`> 0`), `XxxMapper.selectById → Optional<T>` 래핑이 주 역할.
- **mapper 는 두 의미를 동시에 사용** — 이름으로 구분된다:
  - `repository/mapper/XxxMapper.java` + `resources/mapper/.../XxxMapper.xml` ⇒ DB 매퍼 (MyBatis).
  - `dto/mapstruct/XxxMapStruct.java` ⇒ 객체 변환 매퍼 (MapStruct, `componentModel="spring"`).
- **공식 표준 컨벤션**: `*MapStruct` 클래스명 사용. (단 `fun/playerCard` 만 `FunPlayerCardDtoMapper` 라는 다른 이름 사용 — 일탈 항목 9 참조.)

---

## 4. 공통 / 전역 인프라

### 4.1 `common/`

```
common/
├─ enums/
│  ├─ CommonMessages.java        # SUCCESS, INTERNAL_SERVER_ERROR, INTERNAL_ERROR
│  ├─ Grade.java, Target.java
│  ├─ fun/        # CardGrade, PlayerRole — 게임 콘텐츠 공통
│  └─ user/       # UserGrant, UserStatus, UserType — 사용자 공통
├─ support/
│  ├─ advice/
│  │  ├─ GlobalResponseAdvice.java   # ResponseBodyAdvice — 컨트롤러 반환값을 GlobalResponse 로 자동 래핑
│  │  └─ GlobalExceptionHandler.java # @RestControllerAdvice — BaseException + 미처리 Exception
│  ├─ dto/
│  │  ├─ GlobalResponse<T>           # record { boolean success, Enum<?> code, T data }
│  │  ├─ ListResponse<T>             # record { List<T> items }, of(...) factory
│  │  └─ OperationResponse<M>        # record { boolean success, M message, Long id }
│  └─ exception/BaseException.java   # RuntimeException + Enum<?> code + HttpStatus
└─ util/
   ├─ ClientInfoExtractor.java       # X-Forwarded-For, CloudFront-Viewer-Country 등
   └─ JsonUtils.java
```

### 4.2 `config/`

| 파일 | 역할 |
|---|---|
| `SecurityConfig` | `SecurityFilterChain` 정의. CORS+CSRF disable, `/api/admin/**` → `hasRole("ADMIN")`, `/api/**` → `permitAll`. `AccessLogFilter` 와 `JwtAuthFilter` 를 `UsernamePasswordAuthenticationFilter` 앞쪽에 등록. 401 / 403 핸들러 (`AUTH_UNAUTHORIZED`, `AUTH_USER_BLOCKED`) 내장. |
| `CorsConfig` | `CorsConfigurationSource`. `localhost:3000`, `compyafun.com` 허용. credentials true, `Set-Cookie` 노출. |
| `LoggingAspect` | `@Service` / `@Repository` / `@(Rest)Controller` / `@Mapper` 메서드의 START/EXIT/ERROR 로그 + 소요 시간. |
| `S3Config` | `S3Client` Bean (S3Properties 사용). |
| `SwaggerConfig` | OpenAPI 그룹 (`public`, `admin`) + Bearer JWT 인증 스키마. |
| `WebConfig` | `/static/**` resource handler. |
| `CacheConfig` | **현재 전체 주석 처리**. 운영은 `spring.cache.type=simple` 로 ConcurrentMap 캐시 사용. |
| `filter/AccessLogFilter` | OncePerRequestFilter — 모든 요청 ip / country / method / UA / page-url 로깅. swagger 경로 skip. |
| `properties/JwtProperties` | `jwt.secret`, `jwt.access-token-expire-minutes`. |
| `properties/NaverOauthProperties` | `naver.client-id / client-secret / redirect-uri`. |
| `properties/S3Properties` | `cloud.aws.credentials/region/s3.*` (nested static class). |

### 4.3 글로벌 응답·예외 흐름

```
Controller가 GlobalResponse 를 직접 반환  →  그대로 직렬화
Controller가 도메인 객체를 반환            →  GlobalResponseAdvice 가 success 래핑
도메인 코드에서 throw new XxxException()  →  GlobalExceptionHandler 가 잡아 ResponseEntity(status, GlobalResponse.fail(code))
미처리 Exception                          →  500 + CommonMessages.INTERNAL_SERVER_ERROR
```

성공 응답 표준 형태:

```json
{ "success": true, "code": "COUPON_SUCCESS", "data": [...] }
```

실패 응답 표준 형태:

```json
{ "success": false, "code": "NOTICE_NOT_FOUND", "data": null }
```

---

## 5. 인증 (authentication) 작업 정리

backend 의 "authentication 도메인" 은 **`domain/oauth/`** 패키지가 담당한다 (auth 라는 별도 패키지는 없음).

### 5.1 인증 흐름

```
1. FE → /api/auth/naver/callback?code=...&state=...
2. AuthController.naverCallback
   → AuthServiceImpl.loginWithNaver
       → NaverOAuthService.findOrCreateUser   (RestTemplate 으로 네이버 토큰 + /v1/nid/me)
           → UserService.findOrCreateNaverUser   (Optional.orElseGet → save, lastLoginAt 갱신)
       → validateUserStatus (BLOCKED/SUSPENDED/WITHDRAWN → AUTH_USER_BLOCKED 403)
       → JwtProvider.createAccessToken(userId, role)
3. AuthCookieFactory.createAccessToken(jwt, request)
   → ResponseCookie ACCESS_TOKEN ; HttpOnly ; (운영) Secure+SameSite=None+Domain=.compyafun.com
4. response.sendRedirect(AuthRedirectProvider.setRedirectUrl(request))
```

이후 모든 요청은 `JwtAuthFilter` 가 처리:

- `Authorization: Bearer …` 헤더 → 없으면 `ACCESS_TOKEN` 쿠키 fallback.
- 토큰 검증 후 `UsernamePasswordAuthenticationToken(userId, null, ROLE_<role>)` 를 SecurityContext 에 세팅.
- `request.setAttribute("userId", userId)` 로 컨트롤러에서 직접 꺼낼 수 있음 (`UserController.getMe` 참조).
- 토큰이 있는데 검증 실패 → 즉시 401 + `AUTH_UNAUTHORIZED` 응답 (필터 체인 중단).
- swagger / `/api/auth/naver` 는 `shouldNotFilter` 로 스킵.

### 5.2 인증 구성 요소 위치

| 구성 | 경로 |
|---|---|
| Filter | `security/filter/JwtAuthFilter.java` |
| Provider | `security/provider/JwtProvider.java`, `security/provider/AuthRedirectProvider.java` |
| Cookie | `security/cookie/AuthCookieFactory.java` |
| SecurityChain | `config/SecurityConfig.java` (401/403 핸들러도 여기 inner class) |
| Properties | `config/properties/JwtProperties.java`, `config/properties/NaverOauthProperties.java` |
| OAuth 도메인 | `domain/oauth/` (controller/service/entity/enums/exception/repository/dto) |
| Swagger 토큰 발급기 | `domain/admin/controller/SwaggerController` (`GET /api/dev/test-token` — ADMIN 토큰을 dev 편의용) |

### 5.3 권한

- `UserRole = { ADMIN, USER }`. JWT claim `role` 에 `ADMIN` / `USER` 문자열 저장.
- `JwtAuthFilter` 가 `ROLE_ADMIN` / `ROLE_USER` GrantedAuthority 부여.
- 컨트롤러 가드: `@PreAuthorize("hasRole('ADMIN')")` (예: `AdminEventController`) + `SecurityFilterChain` 에서 `/api/admin/**` 경로 자체를 hasRole(ADMIN) 으로 차단 (이중 안전망).

---

## 6. DB / Table prefix 컨벤션

`mybatis.mapper-locations=classpath:mapper/**/*.xml`, `map-underscore-to-camel-case=true`.

| Prefix | 의미 | XML 위치 | 도메인 예 |
|---|---|---|---|
| `site_` | 사이트 운영 (공지·이벤트·쿠폰·커뮤니티) | `resources/mapper/site/<domain>/` | `site_coupons`, `site_notices`, `site_events`, community 다수 |
| `fun_` | 게임 콘텐츠 (퀴즈, 플레이어 카드) | `resources/mapper/fun/<domain>/` | `fun_quiz`, fun playerCard 5개 테이블 |
| (prefix 없음 / 기타) | 레거시 player·skill·user | `resources/mapper/` 직하 또는 `mapper/player/` | `users`, `teams`, `legend_*`, `player_skills` 등 |

신규 도메인은 **content 의 종류** 로 prefix 결정:
- 운영 콘텐츠(노출/숨김/관리 대상) → `site_`
- 게임 데이터(밸런싱/메타) → `fun_`

XML namespace 는 mapper interface FQCN 과 1:1 일치해야 한다 (현재 모든 도메인 일관 적용).

---

## 7. API 응답 / 에러 처리 표준

### 7.1 컨트롤러가 `GlobalResponse` 를 직접 반환

```java
@RestController
@RequestMapping("/api/coupons")
public class CouponController implements CouponSwaggerDocs {
    private final CouponUserService couponUserService;

    @Override
    @GetMapping
    public GlobalResponse<List<CouponResponse>> getCouponLists() {
        List<CouponResponse> list = couponUserService.getCouponLists();
        return GlobalResponse.success(CouponMessages.COUPON_SUCCESS, list);
    }
}
```

### 7.2 도메인 예외 throw

```java
EventEntity event = repository.findById(id)
        .orElseThrow(() -> new EventException(
                EventMessages.EVENT_NOT_FOUND,
                HttpStatus.NOT_FOUND));
```

→ `GlobalExceptionHandler.handle(BaseException)` 가 `ResponseEntity.status(...).body(GlobalResponse.fail(code))` 로 변환.

### 7.3 메시지 enum 컨벤션

각 도메인은 `<DOMAIN>Messages` enum 하나에 응답 코드와 에러 코드를 모두 정의한다.

```java
public enum CouponMessages {
    COUPON_SUCCESS,
    COUPON_NOT_FOUND,
    COUPON_CREATED, COUPON_CREATED_FAILED,
    COUPON_UPDATED, COUPON_UPDATED_FAILED,
    COUPON_VISIBLE_UPDATED,
    COUPON_DELETED
}
```

명명 규칙: `<DOMAIN>_<ACTION>(_FAILED)?` / `<DOMAIN>_NOT_FOUND` / `<DOMAIN>_SUCCESS`.

### 7.4 인증 실패 응답 (Spring Security 단)

`SecurityConfig` 의 `CustomAuthenticationEntryPoint` (401), `CustomAccessDeniedHandler` (403) 가 `GlobalExceptionHandler` 와 **동일한 JSON 모양** 을 직접 작성해 응답한다 (code = `AUTH_UNAUTHORIZED` / `AUTH_USER_BLOCKED`).

---

## 8. 신규 도메인 추가 — 8 layer 스캐폴드 가이드

도메인 이름을 `xxx` 라 하자 (예: `notification`).

### 8.1 패키지 구조 생성

```
domain/xxx/
├─ controller/
│  ├─ XxxController.java
│  ├─ AdminXxxController.java          # 관리자 API 가 있을 때
│  └─ docs/
│     ├─ XxxSwaggerDocs.java
│     └─ AdminXxxSwaggerDocs.java
├─ service/
│  ├─ XxxUserService.java + XxxUserServiceImpl.java
│  └─ XxxAdminService.java + XxxAdminServiceImpl.java
├─ repository/
│  ├─ XxxRepository.java               # @Repository wrapper
│  └─ mapper/
│     └─ XxxMapper.java                # @Mapper MyBatis interface
├─ dto/
│  ├─ request/XxxRequest.java          # record
│  ├─ response/XxxResponse.java        # record
│  └─ mapstruct/XxxMapStruct.java      # @Mapper(componentModel="spring")
├─ entity/
│  └─ XxxEntity.java                   # POJO (Lombok)
├─ enums/
│  ├─ XxxMessages.java                 # 응답·에러 코드
│  └─ ... (도메인 enum)
└─ exception/
   └─ XxxException.java                # extends BaseException
```

### 8.2 각 layer 스캐폴드 코드

**Entity** (POJO, JPA 아님)

```java
@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class XxxEntity {
    private Long id;
    private String title;
    private Boolean isVisible;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**Mapper interface** (DB)

```java
@Mapper
public interface XxxMapper {
    List<XxxEntity> selectXxxList();
    XxxEntity selectXxxById(@Param("id") Long id);
    int insertXxx(XxxEntity entity);
    int updateXxx(XxxEntity entity);
}
```

**Mapper XML** (`resources/mapper/site/xxx/XxxMapper.xml` 또는 `mapper/fun/xxx/...`) — namespace 는 mapper interface FQCN 과 동일.

**Repository wrapper**

```java
@Repository
@RequiredArgsConstructor
public class XxxRepository {
    private final XxxMapper mapper;

    public List<XxxEntity> findAll() { return mapper.selectXxxList(); }
    public Optional<XxxEntity> findById(Long id) {
        return Optional.ofNullable(mapper.selectXxxById(id));
    }
    public boolean save(XxxEntity e) { return mapper.insertXxx(e) > 0; }
}
```

**DTO (record)**

```java
public record XxxRequest(String title, Boolean isVisible) {}
public record XxxResponse(
        Long id, String title, Boolean isVisible,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime updatedAt
) {}
```

**MapStruct 변환기**

```java
@Mapper(componentModel = "spring")
public interface XxxMapStruct {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    XxxEntity toEntity(XxxRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(XxxRequest request, @MappingTarget XxxEntity entity);

    XxxResponse toResponse(XxxEntity entity);
    List<XxxResponse> toResponseList(List<XxxEntity> entities);
}
```

**Messages enum**

```java
public enum XxxMessages {
    XXX_SUCCESS, XXX_NOT_FOUND,
    XXX_CREATED, XXX_CREATED_FAILED,
    XXX_UPDATED, XXX_UPDATED_FAILED,
    XXX_DELETED
}
```

**Exception**

```java
public class XxxException extends BaseException {
    public XxxException(Enum<?> code, HttpStatus status) {
        super(code, status);
    }
}
```

**Service interface + Impl**

```java
public interface XxxUserService {
    List<XxxResponse> getList();
}

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class XxxUserServiceImpl implements XxxUserService {
    private final XxxRepository repository;
    private final XxxMapStruct mapStruct;

    @Override
    @Cacheable(value = "xxx", key = "'public'")  // 필요 시
    public List<XxxResponse> getList() {
        return mapStruct.toResponseList(repository.findAll());
    }
}
```

**Controller**

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/xxx")
public class XxxController implements XxxSwaggerDocs {
    private final XxxUserService service;

    @Override
    @GetMapping
    public GlobalResponse<List<XxxResponse>> getList() {
        return GlobalResponse.success(XxxMessages.XXX_SUCCESS, service.getList());
    }
}
```

관리자용은 `@RequestMapping("/api/admin/xxx")` + `@PreAuthorize("hasRole('ADMIN')")`.

### 8.3 캐시 컨벤션

`@Cacheable(value = "<domain>", key = "'<scope>'")` — scope 는 `'public'` / `'admin'` / `'external::admin'` / `'<id>_public'` 등 도메인 코드에서 자주 등장하는 패턴.
write 메서드에는 `@Caching(evict = {...})` 로 해당 캐시들 invalidate.

---

## 9. 현재 구조의 일관성 일탈 항목

> 신규 도메인을 만들 때는 **표준 (왼쪽 컬럼)** 을 따르고, 아래 일탈 사례는 흉내내지 말 것.

| # | 일탈 도메인 | 표준 | 현재 상태 | 비고 |
|---|---|---|---|---|
| 1 | admin | 8 layer 전부 | controller + service 만 존재 (UploadService, SwaggerController) | 의도적으로 운영 보조용. 추후 admin 기능은 기획 대기 (미구현). |
| 2 | fun/playerCard | DTO 변환기 이름 `XxxMapStruct` | `FunPlayerCardDtoMapper` | 다른 도메인은 모두 `*MapStruct`. 신규 도메인은 `MapStruct` 접미사로 통일 권장. |
| 3 | fun/playerCard | `enums/` 폴더 + `XxxMessages` enum | enums 폴더 자체 없음, exception 폴더 없음 | 도메인 예외/메시지가 정의 전. 응답 코드는 미정. |
| 4 | notice | repository 1개 | `NoticeRepository` (public) + `AdminNoticeRepository` (admin) 분리 | 다른 도메인은 단일 Repository 안에서 user/admin 메서드를 분리하는 패턴. notice 는 클래스 자체를 분리. |
| 5 | community | (리뉴얼 진행 중) | 8 layer 모두 존재하나 sub-domain 단위로 분리 (`service/board`, `service/posts`, `service/reaction`, `service/report`, `service/tag`) + `enums/messages/CommunityMessages` 형태로 messages 하위 폴더 사용 | 표준 추출 대상에서는 가중치 낮음. 하위 도메인이 많을 때만 동일 패턴 채택 가능. |
| 6 | oauth | request/response 양쪽 폴더 | `dto/response/` 만 존재, `dto/request/` 폴더 없음 | OAuth 콜백 input 이 `@RequestParam` 으로 들어와서 request DTO 가 불필요. 신규 도메인은 양쪽 모두 만드는 것 권장. |
| 7 | quiz | Mapper interface 가 `int / EntityType` 반환 | `QuizMapper` 의 `selectLatestVisible`, `selectById` 가 직접 `Optional<QuizEntity>` 반환 (Repository 가 `Optional.ofNullable` 안 함) | MyBatis 가 결과 0건 → null 처리. 표준은 mapper 가 raw `Entity` 반환 → repository 가 `Optional` 로 감싸기. |
| 8 | event Mapper | `@Param` 로 모든 인자 명명 | `selectEventById(Long id)` 등 일부 누락 | 신규는 일관되게 `@Param("id")` 권장. |
| 9 | community / fun playerCard | repository/mapper 분리 패턴 | community 의 일부 Repository 는 도메인 검증 로직(throw)을 직접 가진다 (`NoticeRepository.getNoticeDetail`) | Repository 는 데이터 액세스만, 검증/예외는 Service 가 담당하는 게 표준. 일부 위반 사례 존재. |
| 10 | CacheConfig | Caffeine TTL 정책 | 전체 주석 처리, `spring.cache.type=simple` (ConcurrentMap, TTL 없음) | 캐시 만료가 없으므로 write 시 반드시 `@CacheEvict` 명시. 신규 도메인 작성 시 evict 누락 주의. |

---

## 10. 금지 / 주의 사항

- ✗ **JPA `@Entity`, `JpaRepository` 사용 금지.** 의존성 자체가 없다. 모든 DB 접근은 MyBatis Mapper interface + XML.
- ✗ **DTO 를 class 로 만들지 말 것.** 모든 도메인이 Java `record` 사용.
- ✗ **Mapper XML 의 namespace 와 interface FQCN 불일치 금지.** MyBatis 가 못 찾는다. `@MapperScan(annotationClass=Mapper.class)` 로 자동 등록되므로 interface 에 `@Mapper` 누락 금지.
- ✗ **Controller 에서 `try/catch` 로 도메인 예외 잡지 말 것.** `GlobalExceptionHandler` 가 잡는다.
- ✗ **Repository 에 비즈니스 검증/throw 추가 지양.** notice 일부 위반 사례 있으나 표준 아님.
- ✗ **`/api/admin/**` 는 자동 ADMIN 가드.** 그 외 admin 경로 (`/api/community/admin/**` 등) 는 컨트롤러에 `@PreAuthorize("hasRole('ADMIN')")` 명시 필요.
- ✗ **MapStruct `@Mapping(target = "id" / "createdAt" / "updatedAt", ignore = true)` 누락 금지** — request → entity 변환 시 timestamp/id 가 덮어써질 위험.
- ✓ **테이블 prefix 는 site_/fun_ 중 하나로 결정** — 결정 이후 mapper XML 위치도 `mapper/site/<domain>/` 또는 `mapper/fun/<domain>/` 으로 맞춘다.
- ✓ **Messages enum 은 도메인당 단일 파일** (`<DOMAIN>Messages.java`) — 응답 코드와 에러 코드를 한 곳에 둔다.
- ✓ **JWT 토큰 검증 실패 시 응답 형태**: `{"success":false,"code":"AUTH_UNAUTHORIZED","data":null}` (필터에서 직접 작성). 동일 모양 유지할 것.
- ✓ **시간 직렬화 포맷은 항상 `yyyy-MM-dd HH:mm`** (`@JsonFormat`) — DB 도 동일 정밀도.
- ✓ **read 전용 메서드는 `@Transactional(readOnly = true)`**. 클래스 레벨 `@Transactional` + 메서드 레벨 readOnly override 패턴이 다수.

---

## 부록 A. 응답 DTO 표준 패턴

| 시그니처 | 용도 | 예 |
|---|---|---|
| `GlobalResponse<T>` | 모든 컨트롤러의 기본 응답 wrapper | `GlobalResponse.success(CouponMessages.COUPON_SUCCESS, list)` |
| `GlobalResponse<List<XxxResponse>>` | 리스트 조회 | coupon, event, notice 등 |
| `GlobalResponse<XxxResponse>` | 단건 조회 / 생성 / 수정 | quiz latest, event create |
| `GlobalResponse<Void>` | 단순 성공만 알림 | visible toggle |
| `OperationResponse<M>` | 작업 단위 결과 (success + message + id) | `common/support/dto/OperationResponse` 참고 |
| `ListResponse<T>` | items wrapper (record) — `ListAssembler.assemble(...)` 와 함께 사용 | 부분 도메인에서 사용 |

## 부록 B. 자주 쓰는 어노테이션 cheat-sheet

- 컨트롤러: `@RestController` `@RequiredArgsConstructor` `@RequestMapping("/api/...")` `@PreAuthorize("hasRole('ADMIN')")`(admin만) `implements XxxSwaggerDocs`
- 서비스: `@Service` `@RequiredArgsConstructor` `@Transactional` (+ `@Transactional(readOnly = true)` 메서드 단위) `@Cacheable` / `@CacheEvict` / `@Caching`
- Repository: `@Repository` `@RequiredArgsConstructor`
- Mapper(DB): `@Mapper` (org.apache.ibatis) + `@Param`
- Mapper(객체 변환): `@Mapper(componentModel = "spring")` (org.mapstruct) + `@Mapping` + `@MappingTarget`
- Properties: `@Component` `@ConfigurationProperties(prefix = "...")` + Lombok `@Getter @Setter`
- Entity: `@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor` (+ JPA 어노테이션 절대 사용 금지)

