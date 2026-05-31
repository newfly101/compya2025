# Backend Developer Guide (single entry)

> com2usbaseball BE 작업의 단일 1차 참조. 신규 코드를 만들거나 기존 코드를 수정할 때 가장 먼저 본다.
> 깊이 들어가야 할 때만 `docs/global-guide/develop/specs/be/*` 와 `docs/global-guide/develop/specs/db/*` 를 cite.
> 작성: developer-analyze (auto), 기준 일자 2026-05-31, 패키지 트리 / DTO / Service / Mapper 전수 검사 결과 반영.

---

## § 1. 스택 & 환경

| 항목 | 값 |
|---|---|
| Language | Java 21 (toolchain 강제) |
| Framework | Spring Boot 3.3.2 (web / security / aop / cache / jdbc) |
| Build | Gradle (`build.gradle` 단일) → `bootJar` 산출물 `${rootProject.name}.jar` |
| ORM | **MyBatis** (mybatis-spring-boot-starter 3.0.3). **JPA 사용 안 함** |
| DB | MariaDB (드라이버 3.3.3, HikariCP pool 5) |
| Auth | Spring Security + **JWT (jjwt 0.11.5) + HttpOnly cookie 단일 채널** (Authorization 헤더 차단) |
| Cache | Spring Cache + Caffeine. `spring.cache.type=simple` (현행) |
| Object map | MapStruct 1.5.5.Final (componentModel = "spring") |
| Doc | springdoc-openapi-starter-webmvc-ui 2.6.0 + 도메인별 `controller/docs/*SwaggerDocs.java` interface |
| Storage | AWS S3 (software.amazon.awssdk:s3 2.25.59) |
| XSS sanitize | jsoup 1.17.2 (`Jsoup.clean(html, Safelist.relaxed())`) |
| Profile | `application.properties` (env 변수 기반, default) / `application-prod.properties` (운영) |

⚠️ `application-prod.properties` 에 **하드코딩된 secret 다수 존재** (§ 16 위험 항목 참조).

---

## § 2. 패키지 / 폴더 구조 (현행 트리)

```text
src/main/java/com/dawne/com2usbaseball/
├── common/
│   ├── enums/                  # CommonMessages, site/* (Target, Grade), fun/* (PlayerRole, CardGrade)
│   ├── support/
│   │   ├── advice/             # GlobalResponseAdvice, GlobalExceptionHandler
│   │   ├── cache/              # @CacheEvictAfterCommit + Aspect
│   │   ├── dto/                # GlobalResponse, ListResponse, OperationResponse (모두 record)
│   │   ├── exception/          # BaseException (RuntimeException + Enum code + HttpStatus)
│   │   └── ListAssembler       # entities → ListResponse 변환 헬퍼
│   └── util/                   # JsonUtils, ClientInfoExtractor
├── config/
│   ├── filter/AccessLogFilter
│   ├── properties/             # @ConfigurationProperties (JwtProperties, S3Properties, NaverOauthProperties)
│   ├── CorsConfig / S3Config / SecurityConfig / SwaggerConfig / WebConfig / LoggingAspect
├── security/
│   ├── cookie/AuthCookieFactory
│   ├── filter/JwtAuthFilter
│   └── provider/JwtProvider, AuthRedirectProvider
└── domain/
    └── {domain}/                                 # admin, oauth, community, coupon, event, notice,
        ├── controller/                           #   player, quiz, skill, fun/playerCard
        │   ├── {Public}Controller.java           # /api/{domain}
        │   ├── Admin{Domain}Controller.java      # /api/admin/{domain}  (현재 mixed — § 16-B 참조)
        │   └── docs/{Name}SwaggerDocs.java       # interface로 swagger 메타만 분리
        ├── service/
        │   ├── {Domain}Service.java              # interface
        │   ├── {Domain}ServiceImpl.java          # @Service @Transactional(readOnly=true) + 변경 메서드 @Transactional
        │   └── support/                          # 도메인 내 helper (CardNameGrouper, SkillItemConvertor, NaverOAuthService 등)
        ├── repository/
        │   ├── {Domain}Repository.java           # @Repository — Mapper wrapper (boolean / Optional 변환)
        │   └── mapper/{Domain}Mapper.java        # @Mapper interface (xml namespace 일치 필수)
        ├── entity/                               # *Entity.java (lombok @Getter @Setter @Builder ... — record 금지)
        ├── enums/                                # 도메인 enum + {Domain}Messages
        └── dto/
            ├── request/*Request.java             # record
            ├── response/*Response.java           # record
            ├── command/*.java                    # record (도메인 내부 unique 컨테이너; 예 PlayerCardFormat)
            └── mapstruct/{Name}MapStruct.java    # @Mapper(componentModel="spring") interface
```

```text
src/main/resources/
├── mapper/
│   ├── site/{domain}/*.xml     # community / notice / event / coupon / oauth — 신규 권장
│   ├── fun/{domain}/*.xml      # playerCard / quiz — 신규 권장
│   ├── player/*.xml            # PlayerCareer, PlayerCardMapper — 도메인별 폴더화 중
│   └── {Name}Mapper.xml        # TeamMapper / CoachMapper / UserMapper / PlayerSkills / SkillScoreConfigMapper
│                               #   → 루트 직속 5종은 정리 대기 (§ 16-C)
├── application.properties / application-prod.properties
└── static/swagger-custom.css
```

### 2.1 신규 도메인 추가 시 디렉터리 컨벤션

| 종류 | 신규 위치 |
|---|---|
| 공개 도메인 | `domain/{name}/...` + `resources/mapper/site/{name}/*.xml` |
| 게임/엔터테인먼트 도메인 | `domain/fun/{name}/...` + `resources/mapper/fun/{name}/*.xml` |
| 관리자 전용 도메인 | 도메인 안에 `Admin{Name}Controller` + `Admin{Name}Service{Impl}` 별도. 기존 도메인에 끼워넣지 말 것 |
| 글로벌 spec/타입 | `common/enums/` 또는 `common/support/` 만 사용. 다른 모듈 패키지 침범 금지 |

---

## § 3. 네이밍 규칙

| 종류 | 규칙 | 예 |
|---|---|---|
| 패키지 | `com.dawne.com2usbaseball.domain.{name}.{layer}` lowerCamel domain | `domain.fun.playerCard` |
| Entity | `{Name}Entity` (lombok) | `BoardEntity`, `PlayerCardEntity` |
| Request DTO | `{Name}Request` (record) | `NoticeRequest`, `CouponVisibleRequest` |
| Response DTO | `{Name}Response` (record) | `BoardResponse`, `EventResponse` |
| Command DTO (도메인 내부) | `{Name}Format` 또는 명사형 (record) | `PlayerCardFormat` |
| Service | `{Name}Service` (interface) + `{Name}ServiceImpl` | `BoardService` / `BoardServiceImpl` |
| Admin Service | `Admin{Name}Service{Impl}` 또는 `{Name}AdminService{Impl}` (혼재 — § 16-F) | `AdminNoticeServiceImpl`, `CouponAdminServiceImpl` |
| Mapper (MyBatis) | `{Name}Mapper.java` + 동일 path `xml` | `BoardMapper.java` ↔ `mapper/site/community/BoardMapper.xml` |
| Repository | `{Name}Repository` — Mapper 의 wrapper | `BoardRepository` |
| Enum 메시지 | `{Domain}Messages` (`common/enums/CommonMessages`, `domain/{name}/enums/{Name}Messages`) | `NoticeMessages`, `CouponMessages` |
| MapStruct | `{Name}MapStruct` (`dto/mapstruct/`) | `BoardMapStruct`, `NoticeMapStruct` |
| Controller | `{Name}Controller` / `Admin{Name}Controller` | `BoardController`, `AdminBoardController` |
| Swagger doc | `{Name}SwaggerDocs` (interface, controller 가 implements) | `NoticeSwaggerDocs` |

### 3.1 Mapper XML namespace ↔ Java path 일치

```xml
<mapper namespace="com.dawne.com2usbaseball.domain.community.repository.mapper.BoardMapper">
```

— namespace 문자열은 Java interface 의 fully-qualified name 과 **반드시 동일**. 다르면 런타임 NullPointer.

---

## § 4. DTO 컨벤션 — **record 강제**

### 4.1 룰 (전수 검사 결과 — 위반 0건, 유지)

```
Request DTO   : 27 / 27 record ✓
Response DTO  : 37 / 37 record ✓
```

→ **신규 Request/Response 도 무조건 `public record`**. `public class + lombok @Getter` 패턴 금지.

### 4.2 표준 패턴

```java
// Request — 단순 입력 record
public record NoticeRequest(
        String title,
        NoticeSource source,
        String content,
        String externalUrl,
        Boolean isPinned
) { }

// Response — Jackson 직렬화 메타 가능
public record BoardResponse(
        Long id,
        String code,
        String name,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt
) { }

// Command (도메인 내부 — Request 가 Entity 로 분해될 때 컨테이너)
public record PlayerCardFormat(
        PlayerCardEntity entity,
        HitterAttributeEntity hitterAttribute,
        PitcherAttributeEntity pitcherAttribute
) {
    public boolean hasAttribute() { /* ... */ }
}
```

### 4.3 record + Builder

builder 가 꼭 필요하면 **정적 팩토리 메서드** 또는 record 위에 `@lombok.Builder` (Lombok 12+ 지원). 가급적 새 record 는 builder 없이 생성자 호출.

### 4.4 record + MapStruct

MapStruct 는 record getter 패턴(`field()`)을 1.5.x 부터 지원 — 현행 코드 동작 OK. update 메서드는 entity 가 record 가 아니므로 표준:

```java
@Mapper(componentModel = "spring")
public interface FunPlayerCardDtoMapper {
    PlayerCardEntity toEntity(FunPlayerCardCreateRequest request);
    FunPlayerCardResponse toResponse(PlayerCardEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromRequest(FunPlayerCardUpdateRequest request,
                           @MappingTarget PlayerCardEntity entity);
}
```

### 4.5 Validation (현재 0건 — § 16-A 도입 권장)

- 현행 코드 모든 `@Valid` / `@NotNull` 등 미사용 — Service 내부에서 수동 분기 (예 `validateSourcePayload`).
- **신규 작성 권고**: Request record field 위에 `jakarta.validation.constraints.*` 적용 + Controller 파라미터 `@Valid`. 점진 적용.

---

## § 5. Entity 컨벤션 (MyBatis 호환 — class 유지)

MyBatis 는 setter / no-arg constructor 기반 reflection 매핑 → **Entity 는 record 불가**. 현행 30개 entity 모두 lombok class.

표준:

```java
@Builder
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class BoardEntity {
    private Long id;
    private String code;
    private Boolean isVisible;
    private Boolean isDeleted;   // soft-delete 컬럼은 항상 보유
    private Integer sortOrder;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;
}
```

룰:

| 항목 | 룰 |
|---|---|
| 어노테이션 | `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor` (5종 세트) |
| 필드 가시성 | `private` (PlayerCardEntity 의 package-private 필드는 비표준 — § 16-D) |
| soft delete | `is_deleted` 컬럼 보유 권장. hard delete 회피 |
| 타임스탬프 | `created_at`, `updated_at` (DB default) → Entity 는 `LocalDateTime` |
| enum 매핑 | MyBatis `EnumTypeHandler` (전역 — `application.properties` 설정됨). 별도 typehandler 불필요 |
| 직렬화 포맷 | 외부에 노출하면 Response record 로 보내고 Entity 의 `@JsonFormat` 은 임시 — 길게 가지 말 것 |

---

## § 6. Controller 컨벤션

### 6.1 URL 규칙 (현행 30개 추출)

| pattern | 빈도 | 비고 |
|---|---|---|
| `/api/{domain-plural}` | 다수 | 권장 표준 (`/api/boards`, `/api/notices`, `/api/coupons`, `/api/events`, `/api/users`) |
| `/api/admin/{domain-plural}` | 다수 | admin 분리 표준 |
| `/api/{domain-singular}` | 일부 | `/api/player`, `/api/quiz`, `/api/auth`, `/api/upload`, `/api/dev` (의도적 단수) |
| `/api/{kebab-case}` | 일부 | `/api/post-tags`, `/api/post-reactions`, `/api/comment-reactions` |

⚠️ **신규는 복수형(plural) + kebab-case 권장**. 단수형은 기존 도메인 (`player`, `quiz`, `auth`)에만 유지.

### 6.2 Response wrapping (혼재 — § 16-E)

| 패턴 | 사용처 | 권고 |
|---|---|---|
| `GlobalResponse<T>` 직접 wrap | notice, auth, coupon 일부 | **권장** (status enum 명시) |
| 그냥 DTO 반환 | board, player, skill, fun playerCard, community 다수 | `GlobalResponseAdvice` 가 자동 wrap |
| `ListResponse<T>` 반환 | player 일부 (`getPlayerTeams`) | List 가 많을 때만 사용. 일반 `List<T>` 도 OK (Advice 가 wrap) |
| `OperationResponse<M>` | admin player 생성 결과 | meta(message) + id 가 필요한 admin write 응답 |

⭐ **자동 wrap 메커니즘**: `GlobalResponseAdvice` 가 controller return 을 `GlobalResponse.success(body)` 로 감쌈. 단 다음은 우회:
- return type 이 `Void` / `void`
- 이미 `GlobalResponse` 인스턴스
- `byte[]` / `String` (`ByteArrayHttpMessageConverter`, `StringHttpMessageConverter`)

→ **결론**: 신규 controller 는 `GlobalResponse<T>` 직접 반환 (status enum 명시) 을 default 로. 단순 조회는 `T` 또는 `List<T>` 반환 후 Advice 에 위임 OK.

### 6.3 Public vs Admin 분리

```java
// Public
@RestController @RequiredArgsConstructor
@RequestMapping("/api/notices")
public class NoticeController implements NoticeSwaggerDocs { ... }

// Admin — 별도 클래스
@RestController @RequiredArgsConstructor
@RequestMapping("/api/admin/notices")
public class AdminNoticeController implements AdminNoticeSwaggerDocs { ... }
```

- `SecurityConfig` 에서 `/api/admin/**` → `hasRole("ADMIN")` 자동 차단. **Controller 에 `@PreAuthorize` 중복 X**. 현재 3개 controller 만 `@PreAuthorize("hasRole('ADMIN')")` 추가 적용 (`AdminPlayerCardController`, `CouponAdminController`, `AdminEventController`) — 일관성 권고 § 16-G.

### 6.4 HTTP method 매핑

| method | 용도 |
|---|---|
| `@GetMapping` | 조회 |
| `@PostMapping` | 생성 |
| `@PutMapping("/{id}")` | 전체 수정 |
| `@PatchMapping("/{id}/{flag}")` | 부분 수정 (visible / pinned / status) |
| `@DeleteMapping("/{id}")` | 삭제 (soft) |

---

## § 7. Service 컨벤션

### 7.1 Interface + Impl 분리 (현행 다수 패턴 유지)

```java
public interface NoticeService {
    List<NoticeResponse> getNoticeList();
    NoticeResponse getNoticeDetail(Long id);
}

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)                // 클래스 레벨 default = 읽기
public class NoticeServiceImpl implements NoticeService {

    private final NoticeRepository noticeRepository;
    private final NoticeMapStruct noticeMapStruct;

    @Override
    @Cacheable(value = "notice", key = "'public'")
    public List<NoticeResponse> getNoticeList() { /* ... */ }

    @Override
    @Transactional                              // 변경 메서드만 override
    public NoticeResponse createNotice(NoticeRequest request) { /* ... */ }
}
```

룰:
- `@Service @RequiredArgsConstructor` 항상 같이.
- 클래스 레벨 `@Transactional(readOnly = true)`, 변경 메서드만 `@Transactional` override → 현재 일관성 떨어짐 (§ 16-H).
- `private final` 필드 주입. setter/field injection 금지.
- support 클래스는 같은 도메인 안 `service/support/` 또는 `service/{subname}/`. cross-domain helper 는 `common/support/` 또는 `common/util/`.

### 7.2 Exception 처리

```java
NoticeEntity notice = repository.findById(id)
    .orElseThrow(() -> new BaseException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND));
```

- `BaseException(Enum<?> code, HttpStatus status)` 단일. 도메인별 별도 exception 클래스 X.
- code 는 도메인의 `{Domain}Messages` enum.
- 일반 `IllegalArgumentException` 던지지 말 것 (현재 `FunPlayerCardServiceImpl` 위반 — § 16-I).

### 7.3 캐시 패턴

| 시나리오 | 어노테이션 |
|---|---|
| 단순 read 캐시 | `@Cacheable(value = "notice", key = "'public'")` |
| 변경 후 즉시 evict (트랜잭션 외) | `@CacheEvict` |
| **변경 후 트랜잭션 commit 후 evict** | `@CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})` ⭐ 권장 |
| 다중 key evict | `@Caching(evict = {@CacheEvict(...), @CacheEvict(...)})` |

⭐ rollback 시 stale cache 노출 방지 → 변경 메서드는 `@CacheEvictAfterCommit` 우선 사용.

---

## § 8. Repository / Mapper 컨벤션

### 8.1 3-layer 구조

```
Controller → Service → Repository → Mapper(interface) ↔ Mapper(xml) → MariaDB
```

### 8.2 Mapper interface

```java
@Mapper
public interface BoardMapper {
    List<BoardEntity> getBoardList();
    BoardEntity getBoardDetail(@Param("id") Long id);
    int insertBoard(BoardEntity entity);                              // int 반환 → row count
    int updateBoardVisible(@Param("id") Long id,
                           @Param("isVisible") Boolean isVisible);    // 다인자는 @Param 필수
    int deleteBoard(@Param("id") Long id);
}
```

룰:
- `@Mapper` 항상.
- 다인자는 무조건 `@Param`.
- insert/update/delete 는 `int` (row count) 반환 → Repository 가 boolean 으로 변환.
- 단일 조회는 `Optional<T>` 또는 nullable `T` 반환. 신규는 `Optional<T>` 권장 (현행 mixed — § 16-J).

### 8.3 Repository wrapper

```java
@Repository
@RequiredArgsConstructor
public class BoardRepository {
    private final BoardMapper boardMapper;

    public boolean insertBoard(BoardEntity entity) {
        return boardMapper.insertBoard(entity) > 0;       // int → boolean 캡슐화
    }
    public BoardEntity getBoardDetail(Long id) {
        return boardMapper.getBoardDetail(id);            // null 처리는 Service 가
    }
}
```

→ Repository 는 **Mapper 의 얇은 wrapper**. 비즈니스 로직 / null 분기 X.

### 8.4 MyBatis xml 표준

```xml
<mapper namespace="com.dawne.com2usbaseball.domain.community.repository.mapper.BoardMapper">

    <resultMap id="boardResultMap" type="com.dawne.com2usbaseball.domain.community.entity.BoardEntity">
        <id     property="id"            column="id"/>
        <result property="userRoleType"  column="write_role"/>      <!-- snake → camel + 의미 다른 컬럼명 명시 -->
        ...
    </resultMap>

    <select id="getBoardList" resultMap="boardResultMap">
        SELECT id, code, name, ...
        FROM site_board
        WHERE is_deleted = FALSE
        ORDER BY sort_order ASC, id ASC
    </select>

    <insert id="insertBoard" parameterType="com.dawne.com2usbaseball.domain.community.entity.BoardEntity"
            useGeneratedKeys="true" keyProperty="id">
        INSERT INTO site_board ( ... ) VALUES ( #{code}, #{name}, ... )
    </insert>

    <update id="deleteBoard">
        UPDATE site_board SET is_deleted = TRUE
        WHERE id = #{id} AND is_deleted = FALSE
    </update>
</mapper>
```

룰:
- `mybatis.configuration.map-underscore-to-camel-case=true` 전역 활성 → 컬럼명 = field 와 다르면 `resultMap` / `AS alias` 둘 중 하나로 매핑.
- soft delete: `UPDATE ... SET is_deleted = TRUE` (DELETE 문 회피).
- `is_deleted = FALSE` 필터 항상 WHERE 에. (legacy `<select>` 도 동일)
- `useGeneratedKeys="true" keyProperty="id"` 로 PK auto-fill.

### 8.5 namespace ↔ 인터페이스 path 정합 (현행 전수 검증 — 모두 OK)

```
domain/community/repository/mapper/BoardMapper.java
↔ resources/mapper/site/community/BoardMapper.xml   (namespace 일치 ✓)

domain/oauth/repository/mapper/UserMapper.java
↔ resources/mapper/UserMapper.xml                   (root xml — § 16-C 정리 대기)

domain/player/repository/mapper/TeamMapper.java
↔ resources/mapper/TeamMapper.xml                   (root xml — § 16-C 정리 대기)
```

---

## § 9. 함수 길이 / 접근제어자 / SOLID

### 9.1 권장 길이 (강제 X — 가독성 기준)

| 종류 | 권장 |
|---|---|
| Controller method | 1~10줄 (단일 서비스 호출 + return) |
| Service method | 20~40줄 (분기 많으면 private helper 로 추출) |
| Repository method | 1~3줄 (Mapper 위임만) |

⚠️ 50줄 초과 시 — 분해 필요 신호. 가능한 한 private helper 로 의도 단위 분리 (예 `AdminNoticeServiceImpl#createNotice` 가 `validateSourcePayload`, `sanitizeHtml` 로 분리된 사례 참고).

### 9.2 접근제어자 — 의도적 사용

| modifier | 의도 | 예 |
|---|---|---|
| `public` | 외부 호출 (controller / service interface / 다른 모듈) | 모든 controller method, service interface 구현 |
| `protected` | 같은 도메인 내 상속/확장 의도 (드물게) | `AdminPlayerCardServiceImpl#insertAttributes` (test 상속 가능성) |
| `private` | 내부 도우미 (한 클래스 안에서만 호출) | `AdminNoticeServiceImpl#validateSourcePayload`, `sanitizeHtml` |
| package-private (default) | **사용 금지** (실수 회피) | — |

⭐ 위반 점검: 외부에서 호출되지 않는 helper 가 `public` 인 경우 → `private` 로 강등. 현재 위반 후보는 § 16-K.

### 9.3 분해 패턴 — 권장 예

```java
// before (50줄 단일 메서드)
public Result createNotice(NoticeRequest req) {
    // validation 8줄
    // sanitize 5줄
    // mapping 4줄
    // save 6줄
    // postprocess 5줄
}

// after (의도 단위 helper)
@Transactional
public NoticeResponse createNotice(NoticeRequest request) {
    validateSourcePayload(request);
    NoticeEntity notice = mapAndSanitize(request);
    return saveAndRespond(notice);
}

private void validateSourcePayload(NoticeRequest req) { ... }
private NoticeEntity mapAndSanitize(NoticeRequest req) { ... }
private NoticeResponse saveAndRespond(NoticeEntity entity) { ... }
```

---

## § 10. 예외 처리 / 에러 응답

### 10.1 단일 예외 + 글로벌 핸들러

```java
// 던지는 쪽 (service)
throw new BaseException(NoticeMessages.NOTICE_NOT_FOUND, HttpStatus.NOT_FOUND);

// 받는 쪽 (GlobalExceptionHandler — 자동)
@ExceptionHandler(BaseException.class)
public ResponseEntity<GlobalResponse<Void>> handle(BaseException e) {
    log.warn("[{}] {} (status={})", e.getDomain(), e.getCode(), e.getStatus());
    return ResponseEntity.status(e.getStatus()).body(GlobalResponse.fail(e.getCode()));
}
```

### 10.2 응답 포맷 (실 응답 예)

```json
// 정상
{ "success": true,  "code": "NOTICE_SUCCESS", "data": [ ... ] }

// 실패
{ "success": false, "code": "NOTICE_NOT_FOUND", "data": null }

// 401 (SecurityConfig CustomAuthenticationEntryPoint — 하드코딩 JSON)
{ "success": false, "code": "AUTH_UNAUTHORIZED", "data": null }

// 403 (SecurityConfig CustomAccessDeniedHandler)
{ "success": false, "code": "AUTH_USER_BLOCKED", "data": null }
```

⚠️ `SecurityConfig` 의 401/403 응답은 하드코딩 JSON. enum 사용으로 통일 권고 — § 16-L.

### 10.3 도메인 messages enum

도메인마다 `enums/{Domain}Messages.java` 단일 enum:

```java
public enum NoticeMessages {
    NOTICE_SUCCESS, NOTICE_DETAIL_SUCCESS,
    NOTICE_NOT_FOUND,
    NOTICE_CREATED, NOTICE_CREATED_FAILED,
    NOTICE_UPDATED, NOTICE_UPDATED_FAILED,
    NOTICE_VISIBLE_UPDATED, NOTICE_VISIBLE_UPDATED_FAILED,
    NOTICE_PINNED_UPDATED, NOTICE_PINNED_UPDATED_FAILED,
    NOTICE_DELETED, NOTICE_DELETED_FAILED,
    NOTICE_INVALID_SOURCE_PAYLOAD
}
```

룰:
- **prefix = 도메인명 대문자** (`NOTICE_`, `COUPON_`, `AUTH_`).
- success / fail 양쪽 동일 enum 안에 둠.
- 메시지 문자열은 enum value 에 안 넣음 (현행). FE 에서 코드 → 사용자 메시지 매핑.

---

## § 11. Validation

| 항목 | 현행 | 권고 |
|---|---|---|
| `@Valid` 사용 | 0건 | 신규 controller `@RequestBody` 에 `@Valid` 적용 |
| `@NotNull` 등 | 0건 | 신규 Request record field 위에 적용 |
| 수동 검증 | service 의 private helper 다수 | DB CHECK 미러링 / cross-field 검증은 service 유지. 단순 null/공백/길이는 annotation 으로 위양 |
| custom validator | 0건 | 필요 시 `common/support/validation/` 디렉터리 신설 |

신규 표준:

```java
public record NoticeRequest(
        @NotBlank @Size(max = 200) String title,
        @NotNull  NoticeSource source,
        String content,                   // INTERNAL 일 때만 필요 — service 가 검증
        String externalUrl,
        Boolean isPinned
) { }

@PostMapping
public GlobalResponse<NoticeResponse> createNotice(@Valid @RequestBody NoticeRequest request) { ... }
```

---

## § 12. 공용 응답 / 페이지네이션

### 12.1 표준 wrapper (모두 record)

| 클래스 | 시그니처 | 용도 |
|---|---|---|
| `GlobalResponse<T>` | `(boolean success, Enum<?> code, T data)` | 모든 endpoint 의 최종 wrapper. `success(T)`, `success(Enum, T)`, `fail(Enum)` 정적 팩토리 |
| `ListResponse<T>` | `(List<T> items)` + `of(List)` | 리스트만 단독 반환할 때. null → `List.of()` 자동 |
| `OperationResponse<M>` | `(boolean success, M message, Long id)` | admin write — 결과 메시지 + 생성 PK 같이 반환 |
| `ListAssembler.assemble(entities, mapper)` | helper | `List<Entity>` → `ListResponse<Response>` 한 줄 변환 |

### 12.2 페이지네이션 (현재 미도입 — § 16-M 차후 과제)

게시판/댓글/리스트 폭증 우려 — 권고 패턴:

```java
public record PageRequest(int page, int size, String sort) {
    public int offset() { return Math.max(0, page) * Math.max(1, size); }
}
public record PageResponse<T>(List<T> items, int page, int size, long total) { }
```

→ MyBatis 는 `LIMIT #{size} OFFSET #{offset}` 추가. cursor 기반은 별도 record 정의.

---

## § 13. 로깅 / 트랜잭션 / 보안 (요약)

### 13.1 로깅

| 항목 | 룰 |
|---|---|
| 라이브러리 | `lombok.extern.slf4j.Slf4j` 만 사용. `LogManager` / `getLogger()` 금지 (현재 위반 0건) |
| 레벨 | `INFO` 운영 default. `DEBUG` 는 개발 시. ERROR 는 unhandled 예외만 (GlobalExceptionHandler) |
| Aspect | `LoggingAspect` (전역) — controller / service 진입/종료/슬로우(>1초)/에러 자동 로깅 + sensitive arg mask |
| MyBatis SQL log | `org.apache.ibatis.logging.slf4j.Slf4jImpl` (전역 설정됨) |

### 13.2 트랜잭션

| 위치 | 룰 |
|---|---|
| Service Impl class | `@Transactional(readOnly = true)` 권장 default |
| 변경 메서드 | `@Transactional` override |
| 단일 readOnly 메서드만 있는 service | class 레벨 readOnly 만 |
| Repository / Controller | `@Transactional` 금지 (service layer 단일) |

### 13.3 보안

| 항목 | 룰 |
|---|---|
| 인증 채널 | **HttpOnly cookie `ACCESS_TOKEN` 단일** (Authorization 헤더 차단 — `JwtAuthFilter#resolveToken`) |
| Refresh | DB 저장된 hash 와 비교 + rotation (`AuthServiceImpl#refresh`) |
| 권한 | `/api/admin/**` → `hasRole("ADMIN")` (`SecurityConfig`). 도메인 메서드 단위는 `@PreAuthorize` 가능 (현재 3건만 사용) |
| 세션 | STATELESS |
| CSRF | disable (JWT 기반) |
| CORS | `CorsConfig` 에서 통제 — 운영 origin whitelist 필수 |
| XSS | HTML 입력은 `Jsoup.clean(html, Safelist.relaxed())` 통과 후 저장 (notice 사례) |
| secret | `.env` + `application.properties` placeholder. **운영 파일 하드코딩 절대 금지** (§ 16-시급) |

---

## § 14. 환경 설정 / Profile

### 14.1 properties 표

| key | local (`application.properties`) | prod (`application-prod.properties`) |
|---|---|---|
| `spring.datasource.url` | `jdbc:mariadb://${DB_HOST}:${DB_PORT}/${DB_NAME}` | `jdbc:mariadb://127.0.0.1:3306/compyafun` (하드코딩 — fix) |
| `spring.datasource.username` | `${DB_USERNAME}` | `newfly101` (하드코딩 — fix) |
| `spring.datasource.password` | `${DB_PASSWORD}` | `hi159951!` ⚠️ (하드코딩 — fix) |
| `mybatis.mapper-locations` | `classpath:mapper/**/*.xml` | 동일 |
| `mybatis.configuration.map-underscore-to-camel-case` | `true` | `true` |
| `mybatis.configuration.default-enum-type-handler` | `EnumTypeHandler` | 동일 |
| `jwt.secret` | `${JWT_SECRET}` | `JHKIMSCOM2USPROBASEBALL...` ⚠️ (하드코딩) |
| `jwt.access-token-expire-minutes` | `30` | `60` |
| `jwt.refresh-token-expire-days` | `30` | (없음 — fallback) |
| `cloud.aws.*` | env var | 하드코딩 ⚠️ |
| `naver.client-id` / `secret` | env var | 하드코딩 ⚠️ |
| `springdoc.swagger-ui.enabled` | `${SWAGGER_UI_ENABLED:false}` | `false` |
| `spring.cache.type` | `simple` | `simple` (Caffeine 활성 X — § 16-N) |

### 14.2 활성 profile

| 환경 | 활성 방법 |
|---|---|
| 로컬 | `application.properties` only (default), `.env` 로 secret 주입 |
| 운영 | `-Dspring.profiles.active=prod` → `application-prod.properties` overlay |

⭐ prod 파일은 **placeholder 화 의무**. 실제 secret 은 배포 서버 환경변수 / vault.

---

## § 15. 신규 도메인 추가 N단계 체크리스트

신규 도메인 `{name}` (예: `schedule`) 추가 시 — 위에서 아래 순서. 빠지면 build 실패하거나 runtime null 위험.

| # | 단계 | 산출 |
|---|---|---|
| 1 | 패키지 생성 | `domain/{name}/{controller,service,repository,repository/mapper,entity,enums,dto/{request,response,mapstruct}}` |
| 2 | `{Name}Entity.java` (lombok class) | `is_deleted`, `created_at`, `updated_at` 보유 |
| 3 | `{Name}Mapper.java` (`@Mapper`) + `resources/mapper/site/{name}/{Name}Mapper.xml` (namespace 일치) | CRUD 5종 (`getList`, `getDetail`, `insert`, `update`, `delete`) |
| 4 | `{Name}Repository.java` (`@Repository`, Mapper wrapper) | int → boolean 변환, Optional 처리 |
| 5 | `enums/{Name}Messages.java` | 도메인 success / fail enum |
| 6 | `dto/request/{Name}Request.java` (record) + `dto/response/{Name}Response.java` (record) | record 강제. Validation annotation (§ 11) |
| 7 | `dto/mapstruct/{Name}MapStruct.java` (`@Mapper(componentModel="spring")`) | `toEntity` / `toResponse` / `updateEntity` |
| 8 | `service/{Name}Service.java` (interface) + `{Name}ServiceImpl.java` (`@Service @Transactional(readOnly=true) @RequiredArgsConstructor`) | 변경 메서드 `@Transactional` override, exception 은 `BaseException` |
| 9 | (필요시) `service/Admin{Name}Service{Impl}.java` 별도 | admin write 전용 |
| 10 | `controller/{Name}Controller.java` (`@RestController @RequestMapping("/api/{name-plural}")`) + 필요 시 `Admin{Name}Controller.java` (`/api/admin/{name-plural}`) | swagger doc interface `{Name}SwaggerDocs` 작성 + implements |
| 11 | (옵션) cache annotation | read 는 `@Cacheable`, write 는 `@CacheEvictAfterCommit` |
| 12 | `sql/V2/{site,fun}/{name}.sql` 작성 → ops 트랙에서 migration | ops HITL 필요 (CLAUDE § 8 의 destructive 룰) |
| 13 | `test/*.http` 작성 (REST Client) | 로컬 검증 |

---

## § 16. 코드 수정 follow-up 리스트 ⭐

> Phase 1 전수 검사에서 발견된 일관성 위반 / 개선 권고. 본 가이드 작성 agent 는 코드 수정 X.
> 메인 어시스턴트가 backend-developer agent 에게 이 리스트를 input 으로 넘겨 **일괄 수정** 가능한 형태로 정리.
> 마커: 🔴 시급 / 🟧 권고 / 🟨 cleanup / 🟦 정보성

### 16.1 위험 항목 (HITL — 별도 결정 필요)

| 우선 | 파일 | 항목 | 위험 / 영향 | 권고 |
|---|---|---|---|---|
| 🔴 시급 | `src/main/resources/application-prod.properties` (10~52행) | **DB password / JWT secret / AWS access+secret key / Naver client secret 하드코딩** | git 커밋 시 노출 사고 (이미 git status 에 포함되어 있음). 운영 키 누출 → 데이터/금전 피해 가능 | 즉시 placeholder (`${DB_PASSWORD}` 등) 화 + 배포 서버 환경변수 주입. git history 정리 (rotation 필수) — **사용자 결정 사안**. ops 트랙 분리 |
| 🔴 시급 | `application-prod.properties` (40행 누락) | `jwt.refresh-token-expire-days` 미설정 (local 은 30일) | 운영에서 refresh ttl fallback / NPE 가능 | prod 에도 동일 키 명시 |
| 🟧 권고 | `domain/admin/controller/SwaggerController.java` (`@RequestMapping("/api/dev")`) | dev 전용 endpoint 가 `/api/dev/**` → `SecurityConfig` 는 `/api/admin/**` 외 `/api/**` permitAll | 운영에서도 dev endpoint 노출 가능 | path 를 `/api/admin/dev/**` 로 이동하거나 SecurityConfig 에 별도 deny |

### 16.2 컨벤션 일관성 — 일괄 수정 가능

| ID | 우선 | 파일 / 영역 | 위반 항목 | 수정 권고 |
|---|---|---|---|---|
| A | 🟧 | 전 controller 의 `@RequestBody`, 전 Request record | `@Valid` / `@NotBlank` / `@NotNull` 등 0건 | 도메인별 신규 작성 시 validation annotation 적용. 기존은 점진 보강 |
| B-1 | 🟨 | `domain/coupon/controller/CouponAdminController.java` ↔ `domain/notice/controller/AdminNoticeController.java` | Admin controller 네이밍 혼재 (`CouponAdminController` vs `AdminNoticeController`) | **`Admin{Domain}Controller` 로 통일** 권장 (대다수 패턴). `CouponAdminController` → `AdminCouponController` rename |
| B-2 | 🟨 | service 도 동일 혼재 (`CouponAdminService` vs `AdminNoticeService`) | 같음 | `Admin{Domain}Service{Impl}` 로 통일 |
| C | 🟨 | `resources/mapper/{TeamMapper,CoachMapper,UserMapper,PlayerSkills,SkillScoreConfigMapper}.xml` 5개 | xml 루트 직속 배치 — 도메인 구조와 불일치 | 각각 도메인 폴더로 이동: `mapper/site/oauth/UserMapper.xml`, `mapper/player/TeamMapper.xml`, `mapper/skill/CoachMapper.xml`, `mapper/skill/PlayerSkills.xml`, `mapper/skill/SkillScoreConfigMapper.xml`. (namespace 는 변경 X) |
| D | 🟨 | `domain/player/entity/PlayerCardEntity.java` | 필드 가시성 누락 (`Long id;` → package-private) | 모두 `private` 명시. 다른 entity 와 일관성 맞추기 |
| E | 🟧 | board / community / player / skill / fun playerCard controller 다수 | response wrap 혼재 — `GlobalResponse` 직접 / 자동 wrap mixed | **신규는 `GlobalResponse<T>` 직접 + status enum 명시** 로 통일. 기존도 점진 마이그레이션 |
| F | 🟨 | service interface vs impl 분리 | `SkillScoreConfigServiceImpl` 등 interface 없이 single 파일도 일부 존재 (재확인 필요) | interface 없는 single service 는 그대로 두되, 신규는 항상 interface 분리 |
| G | 🟨 | `AdminPlayerCardController` (`@PreAuthorize("hasRole('ADMIN')")`), `CouponAdminController`, `AdminEventController` 만 적용 | `/api/admin/**` 은 이미 SecurityConfig 에서 차단. `@PreAuthorize` 중복 | 셋 다 `@PreAuthorize` 제거 → SecurityConfig 단일 권한 정책으로 일원화 (또는 모든 admin controller 에 일괄 추가 — 일관성만 잡으면 됨) |
| H | 🟨 | service impl 다수 — `@Transactional` 사용 패턴 mixed | `FunPlayerCardServiceImpl` 는 class 레벨 `@Transactional` (readOnly X) → 조회도 write tx | class 레벨 `@Transactional(readOnly = true)` + 변경 메서드 `@Transactional` 패턴으로 통일 |
| I | 🟧 | `domain/fun/playerCard/service/FunPlayerCardServiceImpl.java` (35, 47, 54, 62행) | `throw new IllegalArgumentException(...)` — 도메인 exception 미사용 | `BaseException(FunPlayerCardMessages.XXX, HttpStatus.NOT_FOUND)` 로 교체. `FunPlayerCardMessages` enum 신설 필요 |
| J | 🟨 | mapper interface 다수 | 단일 조회 nullable `T` vs `Optional<T>` 혼재 (`BoardMapper.getBoardDetail` 은 nullable, `UserMapper.selectUserById` 는 `Optional`) | 단일 조회는 `Optional<T>` 로 통일 권장 |
| K | 🟨 | service impl 의 helper method | 외부 미호출 helper 가 `public` 인 케이스 (예 `AdminPlayerCardServiceImpl#insertAttributes` 는 `protected` 유지 OK, 다른 helper 는 점검 필요) | `private` 강등 가능 케이스 grep + 일괄 |
| L | 🟧 | `config/SecurityConfig.java` (87~96, 109~118행) | 401/403 응답 본문이 하드코딩 JSON. enum 미사용 | `AuthMessages` enum + ObjectMapper 직렬화로 GlobalResponse 통일 |
| M | 🟦 | 게시판/댓글/notice list 등 모든 list endpoint | 페이지네이션 미적용 — full select | `PageRequest`/`PageResponse` 도입 + xml `LIMIT/OFFSET` 추가 (장기 과제) |
| N | 🟦 | `application*.properties` `spring.cache.type=simple` | Caffeine 의존성 추가됨에도 SimpleCacheManager 만 사용 | `spring.cache.type=caffeine` + spec (max size / TTL) 설정. 운영부터 검증 후 적용 |
| O | 🟨 | `domain/fun/playerCard/controller/FunPlayerCardController.java` | controller body 비어 있음 (껍데기만) | dead code 정리 또는 endpoint 구현 |
| P | 🟨 | `domain/fun/playerCard/dto/request/{FunPlayerCardCreateRequest,FunPlayerCardUpdateRequest}.java` | record body 모두 empty — field 0 | 실제 field 정의 (`PlayerCardEntity` 와 매핑). 현 상태로는 admin endpoint 실호출 시 null insert |
| Q | 🟨 | `domain/player/service/AdminPlayerCardServiceImpl.java` (29~31, 78~80행) | `getPlayerInfo`, `updatePlayerCard` 가 `return null;` 미구현 | 미구현 메서드 명시 제거 또는 구현 |
| R | 🟨 | `domain/player/controller/AdminPlayerCardController.java` (21~59행) | 주석 처리된 endpoint 다수 (`getAllPlayerCardList`, `getPlayerCardListByGrade` 등) | 미구현은 삭제 또는 issue 로 격리 |
| S | 🟨 | `domain/oauth/service/support/NaverOAuthService.java` (34행) | `private final RestTemplate restTemplate = new RestTemplate();` field new | `RestTemplate` Bean 으로 분리 + 주입 (테스트 / config 통일성) |
| T | 🟦 | `domain/community/enums/messages/CommunityMessages.java` | 다른 도메인은 `domain/{name}/enums/{Name}Messages.java`, community 만 `enums/messages/` 한 계층 더 깊음 | `domain/community/enums/CommunityMessages.java` 로 이동 (참조처 일괄 수정 필요) |
| U | 🟦 | `domain/oauth/enums/AuthMessages.java` ↔ `domain/admin/` 디렉터리 | admin 도메인은 service / controller 만 있고 enum/dto/entity 없음 (소속 모호) | admin 의 upload 기능은 자체 도메인 격상 (`domain/upload/`) 또는 그대로 유지 명시 |

### 16.3 단순 cleanup (개별 처리)

| 위치 | 항목 |
|---|---|
| `application-prod.properties` (39행) | `jwt.refresh-token-expire-days` 누락 (16.1 위험과 동일) |
| `domain/community/entity/PostTagEntity.java` | 형식은 OK — 참고 패턴 (가장 간단한 entity) |
| `domain/fun/playerCard/controller/FunAdminPlayerCardController.java` 의 `delete` endpoint | service 에 `delete(Long id)` 있으나 controller 노출 X — 추가 |

---

## § 17. 메인 어시스턴트 → backend-developer 일괄 수정 지시 예

```
backend-developer agent 호출. input: docs/global-guide/develop/backend-develop.md § 16.
범위:
- B (Admin* 네이밍 통일) + C (mapper xml 도메인 폴더 이동) + I (FunPlayerCard exception 교체) + Q/R (미구현/주석 정리)
회피:
- 16.1 (HITL 사용자 결정 사안) 손대지 말 것
- M (페이지네이션) 별도 라운드
보고: 변경된 파일 목록 + import 변경 영향 + 빌드 확인 가능 여부
```

— 끝.
