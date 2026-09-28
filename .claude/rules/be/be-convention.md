---
paths:
  - "src/main/java/**"
  - "src/main/resources/mapper/**"
---
# BE 컨벤션 (규칙)

> 기준 2026-09-28. 대상 Spring Boot 3 + Java 21 + MyBatis(MariaDB). JPA 미사용.
> **실제로 무엇이 어디 있는지**(도메인 목록·주소 지도·예외 패턴)는 `be-structure-map.md`. 새 코드는 지도에서 가장 가까운 도메인을 먼저 찾아 그 형태를 따른다.

## 1. 스택

| 항목 | 값 |
|---|---|
| DB 접근 | MyBatis. JPA·Hibernate 금지 |
| 인증 | Spring Security + JWT, **HttpOnly 쿠키만** (Authorization 헤더 X) |
| 변환 | MapStruct (1:1 만) |
| 캐시 | Spring Cache 메모리, TTL 없음 → 변경 메서드는 반드시 비운다 |
| 파일 | AWS S3 · 문서 springdoc (기본 꺼짐, `SWAGGER_UI_ENABLED=true` + `local`) |

## 2. 패키지 형태

`common/` `config/` `security/` 는 도메인을 참조하지 않는다. 반대 방향만.

```
domain/{도메인}/
├─ controller/  {도메인}Controller · Admin{도메인}Controller · docs/{이름}SwaggerDocs(선택)
├─ service/     {도메인}Service(인터페이스) · {도메인}ServiceImpl · support/(선택)
├─ repository/  {도메인}Repository(얇은 래퍼) · mapper/{도메인}Mapper
├─ entity/      {이름}Entity
├─ enums/       {도메인}Messages + 도메인 enum
└─ dto/         request/*Request · response/*Response (record) · mapstruct/{이름}MapStruct
```

매퍼 XML: `resources/mapper/{구분}/{도메인}/*.xml`. **`{구분}`은 자바 패키지 계열과 같다** — `domain/fun/**` → `mapper/fun/`, 그 외 → `mapper/site/`. 와일드카드라 어긋나도 동작하지만 찾을 때 헤맨다. 옮길 때 `namespace` 는 안 바꾼다(인터페이스 경로).

게임 데이터는 `domain/fun/{이름}/` 2단계. `fun` 계열 클래스는 `Fun` 접두 (`FunTeamMapper`).

## 3. 네이밍

| 대상 | 규칙 |
|---|---|
| 패키지 | `domain.{도메인}.{계층}` |
| Entity / 요청 / 응답 | `{이름}Entity` / `{이름}Request` / `{이름}Response` |
| 서비스 | `{이름}Service` + `{이름}ServiceImpl`. 관리자 분리는 `{이름}AdminService` / `{이름}UserService` (event·quiz 방식) — ❓ D6, coupon·notice 는 옛 표기 잔존, 리네임 보류 |
| 매퍼 / 저장소 | `{이름}Mapper.java` ↔ 같은 이름 `.xml` / `{이름}Repository` |
| 메시지 enum / 변환기 | `{도메인}Messages` / `{이름}MapStruct` |
| 컨트롤러 | `{이름}Controller` / `Admin{이름}Controller` |

- XML `namespace` = 인터페이스 전체 경로. 다르면 기동 실패
- **매퍼 인터페이스 이름은 프로젝트 전체에서 유일.** MyBatis 는 패키지 뺀 이름으로 빈 등록 → 패키지 달라도 같으면 `ConflictingBeanDefinitionException`. 새 매퍼 전에:
  `grep -rl "@Mapper" src/main/java --include=*.java | sed 's#.*/##; s#.java$##' | sort | uniq -d`
- 구버전과 컨트롤러 이름이 겹치면 `@RestController("이름V2")`

## 4. DTO / Entity

- 요청·응답·도메인 내부 조립 객체 전부 **record**. class + getter 금지
- 시간 `@JsonFormat(pattern = "yyyy-MM-dd HH:mm")`. 검증은 요청 record 필드 + 컨트롤러 `@Valid`
- Entity 만 Lombok 클래스 (`@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor`, 필드 `private`) — MyBatis setter 주입 때문
- `isDeleted` 는 **그 테이블에 컬럼이 있을 때만** (§ 7)
- 여러 소스 합치는 응답: MapStruct 말고 응답 record 안 정적 팩토리 `of(entity, items)` (`fun/legendCard` 방식)
- MapStruct 는 **엔티티 1:1 일 때만.** 응답이 계산값 조합(home·admin·statistics)이거나 파생 필드가 많으면(fun 5곳: 요일·주차·split) 서비스 `private static` 변환이 맞다 — 억지로 옮기면 `@Named` 만 늘어난다
- 목록 변환: `toResponseList(List)` 또는 `.stream().map(mapper::toResponse).toList()` — 도메인 안에서 하나로

## 5. 컨트롤러 / 서비스 / 저장소

| 계층 | 한다 | 안 한다 |
|---|---|---|
| 컨트롤러 | 입력, 서비스 호출, `GlobalResponse<T>` 포장 + 결과 코드 명시 | 업무 판단, 직접 조회, try-catch |
| 서비스 | 업무 흐름, `BaseException` 던지기, 트랜잭션 | SQL |
| 저장소 | 매퍼 호출 감싸기, `int → boolean` (`> 0`), 단건 `Optional<T>` | 업무 판단, 예외 |
| 매퍼 | SQL. 파라미터 2개 이상이면 `@Param` | 그 외 |

- URL `/api/{도메인 복수형}` · 관리자 `/api/admin/{도메인 복수형}`, kebab-case. 클래스 분리
- GET 조회 · POST 생성 · PUT `/{id}` 전체 · PATCH `/{id}/{항목}` 부분 · DELETE `/{id}`
- `@Service @RequiredArgsConstructor`, 생성자 주입만. 클래스 `@Transactional(readOnly = true)`, 쓰기 메서드만 `@Transactional`. 인터페이스+Impl 분리가 기본이나 public 메서드 1~2개면 단일 클래스 허용 (`HomeService`)
- 다른 도메인 Service 호출은 오케스트레이션(`HomeService`·`CacheSyncService`)에서만. Repository·Mapper 를 건너뛰지 않는다 (2026-09-28 실측 위반 0건 — 유지)
- 응답 봉투 `{ success, code, data }`. 예외는 `BaseException(도메인Messages.코드, HttpStatus)` 하나만, 도메인별 예외 클래스 금지. 코드는 `NOTICE_` 처럼 도메인 대문자 접두, 성공·실패 한 enum. `*_NOT_FOUND` 는 404 (다른 status 금지)
- `GlobalExceptionHandler` 는 MVC 표준 예외를 제 코드로 낸다 — 없는 주소 404 · 깨진 JSON/타입/필수 누락 400 · 405 · 415 · 5MB 초과 400. **새 예외를 catch-all(`Exception` → 500) 에 떨어뜨리지 말고 전용 핸들러를 둔다** (경위 `docs/decisions/0008`)
- `BaseException` 은 cause 를 못 받는다 → 외부 예외(S3 등)를 감쌀 때 catch 안에서 `log.error("…", e)` 필수. 아니면 원인이 어디에도 안 남는다
- 시각은 `LocalDateTime.now()`. 타임존은 KST 로 명시한다(`docs/decisions/0007-kst-timezone.md` 확정) — 신규 컬럼은 `DATETIME` 만 쓴다, `TIMESTAMP` 금지

## 6. 권한

- `/api/admin/**` 만 보안 설정이 ADMIN 을 강제 — **작동하는 유일한 가드**. 관리자 기능은 반드시 이 경로
- 그 외 경로는 로그인 강제 없음 → 로그인 필요 API 는 컨트롤러에서 `사용자아이디 == null` 직접 확인 (빠뜨리기 쉬움)
- 신규 엔드포인트: 공개/로그인/관리자 분류 → URL → 쿠키 없이·일반 쿠키로 관리자 경로 호출 검증
- 응답 코드: 미로그인 `AUTH_UNAUTHORIZED`(401), 권한 부족 `AUTH_FORBIDDEN`(403), 정지·탈퇴 `AUTH_USER_BLOCKED`. 관리자 승급은 코드에 없음(DB 직접). ⚠️ 코드 문자열은 FE `client.js` 가 들고 있다 → 바꾸면 동반 배포
- OAuth 콜백 실패는 JSON 이 아니라 앱 화면 리다이렉트 `?error=코드`. `code`·`state` 는 `required=false`

## 7. 삭제 경계 — `is_deleted` 는 4개 테이블뿐

| 성격 | 방식 | 테이블 |
|---|---|---|
| 사용자에게 보이는 글·댓글·태그 | **소프트** (`UPDATE … is_deleted = TRUE`, 조회 `WHERE is_deleted = FALSE` 필수, 집계도) | `site_board` `site_post` `site_comment` `site_tag` |
| 토큰 · 매핑 · 반응 · 처리 끝난 신고 | **하드** `DELETE` | `site_refresh_tokens` `site_post_tag` `site_*_reaction` `site_report` |
| 관리자 콘텐츠 (컬럼 없음) | 하드 | `site_notices` `site_events` `fun_quiz` |
| 쿠폰 / 회원 | `is_visible = false` / `user_status` + `withdrawn_at` | `site_coupons` / `site_users` |

- 위 4개 밖에서 `DELETE FROM` 은 위반 아님. 새 테이블은 표에서 성격을 고른 뒤 소프트일 때만 컬럼 추가
- 함정: UNIQUE 컬럼(`site_tag.code`, `coupon_code`)은 삭제 표시 후 **재등록이 막힌다**. 재등록 데이터면 소프트 금지
- ⚠️ 컬럼 추가는 DDL. **test·운영 DB 가 같은 인스턴스**라 즉시 운영 반영 → 사용자 승인 + 운영 트랙. 코드 작업 중 금지
- 왜 이렇게 됐나: `docs/decisions/0004-soft-delete-boundary.md`

## 8. 캐시

조회 `@Cacheable(value = "도메인", key = "'public'")`. 변경 후 비우기는 `common/support/cache/CacheEvictAfterCommit`(커밋 후, 롤백 안전 — 직접 만들지 말 것). 단순 `@CacheEvict` 도 허용.

## 9. 신규 도메인 체크리스트

- [ ] 주소가 `be-structure-map` § 3 과 안 겹친다 · 가장 가까운 기존 도메인 형태를 따랐다
- [ ] `common` 에 있는 것(`GlobalResponse` `BaseException` `PlayerRole` `CardGrade`)을 다시 만들지 않았다
- [ ] 패키지 8종 생성 → Entity(`createdAt` `updatedAt`, `isDeleted` 는 § 7) → 매퍼 인터페이스·XML(namespace 일치, CRUD 5종) → Repository
- [ ] `{이름}Messages` → DTO record + 검증 → MapStruct(`dto/mapstruct/`)
- [ ] 서비스(readOnly 기본) → 컨트롤러(일반 + 관리자 분리) → 캐시 결정
- [ ] 매퍼 XML 갈래(`site`/`fun`/`player`) 맞음 · 매퍼 이름 유일 grep 통과
- [ ] `./gradlew compileJava` 통과. DB 테이블·마이그레이션은 운영 트랙

## 10. 금지

- DTO class+Lombok · 도메인별 예외 클래스 · Repository 에서 예외 · 컨트롤러 try-catch
- 관리자 기능을 `/api/admin/**` 밖에 · 로그인 확인 누락 · `is_deleted` 조회 조건 누락
- 컬럼 없는 테이블에 다른 컬럼으로 소프트 삭제 흉내 (DDL 은 승인 사안)
- 운영 설정 파일에 비밀번호·키 평문 (환경변수)
- `fun/playerCard` 의 `dto/FunPlayerCardDtoMapper` 위치는 예외 — 따라가지 않는다
