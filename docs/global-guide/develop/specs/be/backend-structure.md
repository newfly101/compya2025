# BE backend-structure

> Spring Boot 3 + Java 21 + MyBatis(MariaDB) + Spring Security(JWT cookie). 본 문서는 코드 baseline 기준 (`src/main/java/com/dawne/com2usbaseball/`).

---

## 1. 최상위 패키지

```
com.dawne.com2usbaseball
├─ Com2usbaseballApplication.java     # @SpringBootApplication + @EnableCaching + @ConfigurationPropertiesScan + @MapperScan
├─ common/                            # 도메인 의존 없는 공통
│  ├─ enums/                          # CommonMessages / fun.{CardGrade,PlayerRole} / site.{Grade,Target}
│  ├─ support/
│  │  ├─ advice/                      # GlobalExceptionHandler, GlobalResponseAdvice
│  │  ├─ cache/                       # CacheEvictAfterCommit (annotation) + Aspect
│  │  ├─ dto/                         # GlobalResponse / ListResponse / OperationResponse
│  │  └─ exception/BaseException
│  └─ util/                           # ClientInfoExtractor, JsonUtils
├─ config/                            # 인프라 Bean
│  ├─ CorsConfig / SecurityConfig / WebConfig / SwaggerConfig / S3Config / LoggingAspect
│  ├─ filter/AccessLogFilter
│  └─ properties/{Jwt,NaverOauth,S3}Properties
├─ security/                          # JWT 인증 인프라
│  ├─ cookie/AuthCookieFactory
│  ├─ filter/JwtAuthFilter
│  └─ provider/{JwtProvider,AuthRedirectProvider}
└─ domain/                            # 비즈니스 도메인 (8 layer 표준)
   ├─ admin/      # 운영 보조 (Upload, dev-only Swagger 토큰). 8 layer 미준수
   ├─ community/  # 게시판·댓글·반응·태그·신고. service 가 sub-domain 별 분리
   ├─ coupon/
   ├─ event/
   ├─ fun/playerCard/   # fun_ prefix
   ├─ notice/
   ├─ oauth/      # 인증/사용자 (authentication 도메인)
   ├─ player/     # 레거시 + 일부 진행 (legend / KBO 분리 전)
   ├─ quiz/
   └─ skill/
```

리소스:

- `src/main/resources/application.properties` — 기본. `spring.config.import=optional:file:./.env[.properties]` 로 `.env` 평문 키 주입.
- `application-prod.properties` — 운영 profile. ⚠ 현재 평문 secret 다수 (DB 비번 / JWT secret / Naver client-secret / AWS keys). 향후 ops 트랙에서 분리 필요.
- `mapper/site/<domain>/*.xml` — `site_*` 테이블 매퍼.
- `mapper/fun/<domain>/*.xml` — `fun_*` 테이블 매퍼.
- `mapper/*.xml`, `mapper/player/*.xml` — 레거시(`player_legend`, `teams`, `coach`, `player_skills`).

---

## 2. 도메인 8 layer 표준

| # | Layer | 패키지 | 기술 / 어노테이션 |
|---|---|---|---|
| 1 | controller | `controller/` (+ `controller/docs/`) | `@RestController` + `@RequestMapping` + `implements XxxSwaggerDocs` (+ admin 은 `@PreAuthorize("hasRole('ADMIN')")`) |
| 2 | service | `service/` | `interface` + `Impl`. `@Service` + `@RequiredArgsConstructor` + `@Transactional` (read 메서드는 `(readOnly = true)` 오버라이드) |
| 3 | repository | `repository/` | `@Repository` + `@RequiredArgsConstructor`. Mapper 의 raw 결과를 `Optional<T>` / `boolean` 으로 변환 |
| 4 | mapper (DB) | `repository/mapper/` | `@Mapper` (org.apache.ibatis) + `@Param`. XML namespace = interface FQCN |
| 4'| mapper (객체) | `dto/mapstruct/` | `@Mapper(componentModel="spring")` (org.mapstruct) + `@Mapping` + `@MappingTarget` |
| 5 | dto | `dto/request/`, `dto/response/` | 모두 Java `record`. 시간 필드 `@JsonFormat(pattern="yyyy-MM-dd HH:mm")` |
| 6 | enums | `enums/` | `<DOMAIN>Messages` (응답·에러 통합) + 도메인 enum |
| 7 | exception | (사실상 미사용) | 코드 baseline: 도메인 전용 Exception 클래스 없음. **`new BaseException(<DOMAIN>Messages.X, HttpStatus.Y)` 직접 throw 가 표준** |
| 8 | entity | `entity/` | Lombok POJO (`@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor`). **JPA 아님** |

> `BaseException.getDomain()` 이 `code.getDeclaringClass().getSimpleName()` 에서 `Messages` 접미사를 잘라 lowercase 로 반환 (e.g. `CouponMessages` → `coupon`). 로그 prefix 자동화에 사용됨 (`GlobalExceptionHandler`).

---

## 3. 도메인별 layer 매트릭스

✓ 표준 / △ 부분 / ✗ 없음

| Layer | coupon | event | notice | quiz | oauth | community | fun/playerCard | player | skill | admin |
|---|---|---|---|---|---|---|---|---|---|---|
| controller | ✓ User+Admin | ✓ User+Admin | ✓ User+Admin | ✓ User+Admin | ✓ Auth+User | ✓ 다수 | △ Admin 만 (User 컨트롤러 비어 있음) | ✓ Public+Admin (Admin 메서드 다수 주석) | ✓ 단일 | △ Upload+Swagger 토큰 |
| service | ✓ User/Admin Impl | ✓ | ✓ | ✓ | ✓ Auth/User/+support/Naver | ✓ board/comment/posts/reaction/report/tag | ✓ 단일 | △ Admin 일부 빈 메서드 (`return null`) | ✓ Player/Coach/SkillScoreConfig | △ Upload만 |
| repository | ✓ Admin/User 분리 (CouponAdminRepo / CouponRepo) | ✓ 단일 | ✓ Admin/User 분리 | ✓ 단일 | ✓ User+RefreshToken | ✓ 단위별 8 개 | ✓ 단일 | ✓ PlayerCard / PlayerCardInfo / Team / LegendPlayerCareer | ✓ Player/Coach/SkillScoreConfig | ✗ |
| mapper (DB) | ✓ | ✓ | ✓ | ✓ | ✓ User+RefreshToken | ✓ 9 개 | ✓ 5 개 (FunPlayerCardMapper + 4 stats/positions) | ✓ Player+Team+Career | ✓ | ✗ |
| mapper (DTO) | ✓ CouponMapStruct | ✓ EventMapStruct | ✓ NoticeMapStruct | ✓ QuizMapStruct | ✓ UserMapStruct | ✓ 단위별 | △ `FunPlayerCardDtoMapper` (이름 일탈) | ✗ DTO `from(...)` static factory 사용 | ✗ static factory | ✗ |
| dto record | ✓ | ✓ | ✓ | ✓ | △ response 만 | ✓ | ✓ | ✓ | ✓ | ✗ |
| enums Messages | ✓ CouponMessages | ✓ EventMessages | ✓ NoticeMessages + NoticeSource | ✓ QuizMessages | ✓ AuthMessages + UserRole/UserStatus/OAuthProvider | ✓ `enums/messages/CommunityMessages` (sub 폴더) + LinkType/Reaction/Report/UserRole/ReadRole | ✗ Messages 없음 | ✓ PlayerMessages | ✗ Messages 없음 (CoachPosition/CoachSkillGrade 만) | ✗ |
| exception 클래스 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| entity | ✓ | ✓ | ✓ | ✓ | ✓ User+RefreshToken | ✓ 8 개 | ✓ 5 개 | ✓ 7 개 (Card/Hitter/Pitcher/PlayerLegend/Team/Career×2) | ✓ Coach/Option/SkillScoreConfig + Player/Skills | ✗ |

### 핵심 결론

- 모든 도메인이 `BaseException` 직접 throw. 별도 `*Exception` 클래스를 만들지 않는다.
- 모든 DTO 는 `record`. request 폴더는 도메인 따라 비어 있을 수 있다 (oauth callback 처럼 `@RequestParam` 만 받는 경우).
- Repository 는 항상 mapper interface 한 개를 wrap. `int → boolean (>0)`, `T → Optional<T>` 변환이 주 책임.
- mapper 는 DB(MyBatis) / 객체(MapStruct) 두 개를 동시에 사용 — **이름으로만 구분** (`*Mapper` vs `*MapStruct`).

---

## 4. 공통 응답 / 예외 흐름

```
Controller 직접 GlobalResponse<T> 반환
  → 그대로 직렬화

Controller 가 도메인 객체/List 반환
  → GlobalResponseAdvice (ResponseBodyAdvice) 가 GlobalResponse.success(body) 로 자동 wrap
     예외: Void / GlobalResponse / byte[] / String → wrap 안 함

throw new BaseException(Messages.X, HttpStatus.Y)
  → GlobalExceptionHandler.handle(BaseException)
     → log.warn("[{domain}] {code} (status={status})")
     → ResponseEntity.status(Y).body(GlobalResponse.fail(code))

미처리 Exception
  → 500 + GlobalResponse.fail(CommonMessages.INTERNAL_SERVER_ERROR)

Spring Security 401 / 403
  → SecurityConfig 의 CustomAuthenticationEntryPoint / CustomAccessDeniedHandler 가
     동일 모양 JSON 직접 작성: {"success":false,"code":"AUTH_UNAUTHORIZED|AUTH_USER_BLOCKED","data":null}
```

성공: `{ "success": true, "code": "<DOMAIN>_SUCCESS", "data": ... }`
실패: `{ "success": false, "code": "<DOMAIN>_NOT_FOUND", "data": null }`

---

## 5. 응답 DTO 표준 (`common/support/dto/`)

| 시그니처 | 용도 |
|---|---|
| `GlobalResponse<T>(success, Enum<?> code, T data)` | 모든 컨트롤러 표준 wrapper |
| `ListResponse<T>(List<T> items)` | items wrapper. `ListResponse.of(...)` factory + `ListAssembler.assemble(entities, mapper)` 헬퍼 |
| `OperationResponse<M>(success, M message, Long id)` | 작업 단위 결과 (ex: AdminPlayerCardController#createPlayerCard) |

---

## 6. 캐시 정책

- `spring.cache.type=simple` — Spring `ConcurrentMapCacheManager`. **TTL 없음**. 수동 evict 필수.
- 표준 패턴: `@Cacheable(value="<domain>", key="'<scope>'")`
  - scope 예: `'public'` / `'admin'` / `'external::admin'` / `'external::public'` / `'latest'` / `#noticeId + '_public'` / `#target`
- write 메서드 evict 두 가지 패턴 공존:
  1. **Spring 표준**: `@Caching(evict = { @CacheEvict(value=...), ... })` — event/notice/quiz/auth-related 다수
  2. **커스텀 AOP**: `@CacheEvictAfterCommit(cacheName=..., keys={...})` — coupon 도메인. 트랜잭션 commit 후에 evict 실행 (롤백 시 evict 안 함). `common/support/cache/` 의 annotation + `@AfterReturning` aspect.
- caffeine 의존성은 build.gradle 에 있으나 `CacheConfig` 없이 simple 사용. 신규 cache name 도입 시 evict 누락 검증 필수.

캐시 이름 ↔ 도메인 매핑:

| cacheName | 도메인 | 키 패턴 |
|---|---|---|
| `coupons` | coupon | `'public'`, `'admin'` |
| `events` | event | `'external::public'`, `'external::admin'` |
| `notice` | notice | `'public'`, `'admin'` |
| `noticeDetail` | notice | `#noticeId + '_public'`, `#noticeId + '_admin'` |
| `quiz` | quiz | `'latest'`, `'admin'` |
| `playerInfoByTarget` | player | `#target` |
| `playerSkillSetByTarget` | skill | `#target` |
| `coachSkills` | skill | (default) |
| `skillScoreConfig` | skill | (default) |

---

## 7. 컨트롤러 컨벤션

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/<domain>")               // user 진입은 prefix 없이
public class XxxController implements XxxSwaggerDocs {
    private final XxxUserService service;

    @Override @GetMapping
    public GlobalResponse<List<XxxResponse>> getList() {
        return GlobalResponse.success(XxxMessages.XXX_SUCCESS, service.getList());
    }
}
```

Admin 컨트롤러:

```java
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/<domain>")
public class AdminXxxController implements AdminXxxSwaggerDocs { ... }
```

> `SecurityConfig` 가 `/api/admin/**` 자체를 hasRole(ADMIN) 으로 차단하므로 `@PreAuthorize` 는 이중 가드. `@EnableMethodSecurity` 가 `SecurityConfig` 에 켜져 있어 `@PreAuthorize` 도 실제로 동작.

---

## 8. 서비스 컨벤션

```java
@Service
@RequiredArgsConstructor
@Transactional               // 또는 (readOnly = true) — 도메인 read-heavy 일 때
public class XxxAdminServiceImpl implements XxxAdminService {

    private final XxxAdminRepository repository;
    private final XxxMapStruct mapStruct;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "xxx", key = "'admin'")
    public List<XxxResponse> getList() {
        return mapStruct.toResponseList(repository.findAll());
    }

    @Override
    @CacheEvictAfterCommit(cacheName = "xxx", keys = {"admin", "public"})
    public XxxResponse create(XxxRequest request) {
        XxxEntity e = mapStruct.toEntity(request);
        try {
            if (!repository.save(e)) {
                throw new BaseException(XxxMessages.XXX_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (DataIntegrityViolationException ex) {
            throw new BaseException(XxxMessages.XXX_CODE_DUPLICATED, HttpStatus.CONFLICT);
        }
        return mapStruct.toResponse(repository.findById(e.getId())
            .orElseThrow(() -> new BaseException(XxxMessages.XXX_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR)));
    }
}
```

---

## 9. Repository 컨벤션

```java
@Repository
@RequiredArgsConstructor
public class XxxRepository {
    private final XxxMapper mapper;

    public List<XxxEntity> findAll()              { return mapper.selectAll(); }
    public Optional<XxxEntity> findById(Long id)  { return Optional.ofNullable(mapper.selectById(id)); }
    public boolean save(XxxEntity e)              { return mapper.insert(e) > 0; }
    public boolean update(XxxEntity e)            { return mapper.update(e) > 0; }
}
```

> ✗ Repository 에 `throw new BaseException(...)` 추가 금지. 검증/예외는 service 책임.
> 일탈 사례: `NoticeRepository.getNoticeDetail` / `AdminNoticeRepository.getAdminNoticeDetail` 가 직접 throw — 신규 도메인 따라하지 말 것.

---

## 10. Mapper (MyBatis) 컨벤션

```java
@Mapper
public interface XxxMapper {
    List<XxxEntity> selectAll();
    XxxEntity selectById(@Param("id") Long id);            // raw — Repository 가 Optional 로 wrap
    int insertXxx(XxxEntity e);
    int updateXxx(XxxEntity e);
    int updateXxxVisible(@Param("id") Long id, @Param("visible") boolean visible);
}
```

XML namespace = `<mapper namespace="<interface FQCN>">`. 위치는 `mapper/site/<domain>/XxxMapper.xml` 또는 `mapper/fun/<domain>/XxxMapper.xml`. `mybatis.configuration.map-underscore-to-camel-case=true` 활성 → DB `created_at` ↔ Java `createdAt` 자동.

> 일탈: `QuizMapper.selectLatestVisible / selectById` 가 직접 `Optional<QuizEntity>` 반환. 표준은 raw entity 반환 + Repository 가 wrap.

---

## 11. DTO record + MapStruct

```java
public record XxxRequest(String title, Boolean isVisible) {}

public record XxxResponse(
    Long id,
    String title,
    Boolean isVisible,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime createdAt
) {}

@Mapper(componentModel = "spring")
public interface XxxMapStruct {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    XxxEntity toEntity(XxxRequest req);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(XxxRequest req, @MappingTarget XxxEntity entity);

    XxxResponse toResponse(XxxEntity e);
    List<XxxResponse> toResponseList(List<XxxEntity> entities);
}
```

> 일탈: fun/playerCard 만 `FunPlayerCardDtoMapper` 라는 다른 이름. 신규는 `*MapStruct` 통일.

---

## 12. 신규 도메인 추가 — 9 단계 체크리스트

- [ ] **1. 트랙 prefix 결정** — 운영 콘텐츠 → `site_<domain>` / 게임 콘텐츠 → `fun_<domain>`
- [ ] **2. 패키지 트리 생성** — `domain/<name>/{controller,service,repository,repository/mapper,dto/{request,response,mapstruct},entity,enums}`
- [ ] **3. Entity 정의** — POJO + Lombok. JPA 어노테이션 금지
- [ ] **4. Mapper interface (`@Mapper`) + XML** — namespace = interface FQCN. mapper XML 은 `resources/mapper/<prefix>/<domain>/`
- [ ] **5. Repository wrapper** — `Optional` / `boolean` 변환만. throw 금지
- [ ] **6. Messages enum + DTO record + MapStruct** — `<DOMAIN>Messages` 단일 파일에 응답·에러 코드 통합
- [ ] **7. Service interface + Impl** — `@Service @Transactional`. Read 메서드 `(readOnly = true)`. 예외는 `new BaseException(Messages.X, HttpStatus.Y)`
- [ ] **8. Controller (User + Admin 분리)** — Admin 은 `@PreAuthorize("hasRole('ADMIN')")` + `/api/admin/<domain>`
- [ ] **9. 캐시 정책** — read 에 `@Cacheable`, write 에 `@Caching evict` 또는 `@CacheEvictAfterCommit` 누락 없이 매핑

---

## 13. 일탈 / 위반 사례 (신규 도메인은 흉내내지 말 것)

| # | 위반 도메인 | 표준 | 현재 |
|---|---|---|---|
| 1 | admin | 8 layer 전체 | controller + service 만, dto/enums/repository 없음 |
| 2 | fun/playerCard | `*MapStruct` 이름 | `FunPlayerCardDtoMapper` |
| 3 | fun/playerCard | enums 폴더 + `<DOMAIN>Messages` | enums 폴더 자체 없음. Service 가 `IllegalArgumentException` throw (BaseException 아님) |
| 4 | fun/playerCard PlayerCardMapper.xml | namespace = interface FQCN | XML namespace `domain.fun.playerCard.mapper.PlayerCardMapper` ↔ Java interface 는 `domain.fun.playerCard.repository.mapper.FunPlayerCardMapper`. **불일치 — XML 이 어떤 interface 와도 바인딩 안 됨** ❓ 운영 영향 검증 필요 |
| 5 | notice | 단일 Repository 안에서 user/admin 메서드 분리 | `NoticeRepository` + `AdminNoticeRepository` 클래스 분리 |
| 6 | notice | repository 는 데이터 액세스만 | `getNoticeDetail` / `getAdminNoticeDetail` 가 직접 BaseException throw |
| 7 | community | enums 폴더 직하 | `enums/messages/CommunityMessages` 추가 sub 폴더 사용 |
| 8 | oauth | request + response 폴더 | `dto/response/` 만 (callback `@RequestParam` 만) |
| 9 | quiz | mapper raw entity 반환 + repo wrap | `QuizMapper` 가 `Optional<QuizEntity>` 직접 반환 |
| 10 | player AdminPlayerCardServiceImpl | Service 인터페이스 메서드 모두 구현 | `getPlayerInfo()`, `updatePlayerCard()` 가 `return null` |
| 11 | player AdminPlayerCardController | 컨트롤러 메서드 정의 | 5 개 메서드가 주석 처리 (미구현) |
| 12 | application-prod.properties | secret 외부 주입 | DB pwd / JWT secret / Naver client-secret / AWS keys 평문 |

---

## 14. 금지·필수 cheat-sheet

**금지**
- ✗ JPA `@Entity` / `JpaRepository` (의존성 자체 없음)
- ✗ DTO 를 class 로 (모두 record)
- ✗ Mapper XML namespace ≠ interface FQCN
- ✗ Controller 에서 도메인 예외 try-catch
- ✗ Repository 에서 throw
- ✗ 도메인 전용 `*Exception` 클래스 추가 (모두 `BaseException` 직접 사용)
- ✗ `@PreAuthorize` 누락 — `/api/admin/**` 외 admin 경로 사용 시 명시 필요
- ✗ MapStruct request → entity 변환 시 `id/createdAt/updatedAt` `@Mapping(ignore=true)` 누락

**필수**
- ✓ Messages enum 도메인당 단일 파일 (`<DOMAIN>Messages`)
- ✓ 시간 직렬화 `yyyy-MM-dd HH:mm`
- ✓ read 메서드 `@Transactional(readOnly = true)`
- ✓ write 메서드 cache evict 매핑
- ✓ `@MapperScan(annotationClass=Mapper.class)` 의존: interface `@Mapper` 필수

---

## 15. 환경 / 의존성 요약

| 영역 | 의존성 |
|---|---|
| Web / Security | `spring-boot-starter-web`, `spring-boot-starter-security` |
| DB / MyBatis | `spring-boot-starter-jdbc`, `mariadb-java-client`, `mybatis-spring-boot-starter` |
| AOP | `spring-boot-starter-aop` (LoggingAspect, CacheEvictAfterCommitAspect) |
| JWT | `jjwt-api/impl/jackson` |
| Cache | `spring-boot-starter-cache` (`spring.cache.type=simple`) |
| 객체 변환 | `mapstruct` (compile + processor) |
| Lombok | `lombok` (compileOnly + processor) |
| AWS S3 | `software.amazon.awssdk:s3` |
| HTML sanitize | `jsoup` (NoticeService 사용) |
| API doc | `springdoc-openapi-starter-webmvc-ui` |
