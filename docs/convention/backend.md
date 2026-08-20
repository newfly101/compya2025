# 백엔드 컨벤션

> 기준일: 2026-08-21
> 출처: `docs/global-guide/develop/backend-develop.md`, `docs/global-guide/develop/specs/be/backend-structure.md`, `docs/develop/auth-developer.md`
> 대상: Spring Boot 3 + Java 21 + MyBatis(MariaDB). JPA는 사용하지 않는다

---

## 1. 스택 요약

| 항목 | 값 |
|---|---|
| 언어 / 프레임워크 | Java 21, Spring Boot 3 |
| DB 접근 | MyBatis (JPA·Hibernate 사용 안 함) |
| DB | MariaDB |
| 인증 | Spring Security + JWT, HttpOnly 쿠키로만 전달 (Authorization 헤더 방식은 쓰지 않음) |
| 객체 변환 | MapStruct |
| 캐시 | Spring Cache (현재는 단순 메모리 캐시, TTL 없음 — 직접 비우는 처리 필수) |
| 파일 저장 | AWS S3 |
| API 문서 | springdoc-openapi, 도메인별 문서 인터페이스 분리 |

---

## 2. 패키지 구조

```text
com.dawne.com2usbaseball
├─ common/            # 도메인에 의존하지 않는 공통 코드 (공용 응답, 공용 예외, 유틸)
├─ config/             # 인프라 설정 빈 (CORS, 보안, S3 등)
├─ security/           # 인증 처리 (쿠키, 필터, JWT 발급/검증)
└─ domain/
   └─ {도메인명}/                        # 예: coupon, event, notice, quiz, oauth, community, admin
      ├─ controller/                    # {도메인}Controller (일반) + Admin{도메인}Controller (관리자)
      │   └─ docs/{이름}SwaggerDocs.java # API 문서 메타만 분리
      ├─ service/
      │   ├─ {도메인}Service.java        # 인터페이스
      │   ├─ {도메인}ServiceImpl.java    # 구현체
      │   └─ support/                    # 이 도메인 안에서만 쓰는 보조 클래스
      ├─ repository/
      │   ├─ {도메인}Repository.java     # 매퍼를 감싸는 얇은 래퍼
      │   └─ mapper/{도메인}Mapper.java  # MyBatis 매퍼 인터페이스
      ├─ entity/                         # DB 테이블과 매칭되는 객체
      ├─ enums/                          # 도메인 enum + 성공/실패 메시지 enum
      └─ dto/
          ├─ request/*Request.java       # 입력값 (record)
          ├─ response/*Response.java     # 응답값 (record)
          └─ mapstruct/{이름}MapStruct.java
```

리소스 매퍼 XML은 `resources/mapper/{구분}/{도메인명}/*.xml`에 도메인 폴더로 나눠 둔다.

---

## 3. 네이밍 규칙

| 대상 | 규칙 | 예 |
|---|---|---|
| 패키지 | `domain.{도메인명}.{계층}` | `domain.coupon.service` |
| Entity | `{이름}Entity` | `NoticeEntity` |
| 요청 DTO | `{이름}Request` (record) | `NoticeRequest` |
| 응답 DTO | `{이름}Response` (record) | `NoticeResponse` |
| 서비스 | `{이름}Service`(인터페이스) + `{이름}ServiceImpl` | `NoticeService` / `NoticeServiceImpl` |
| 관리자 서비스 | `Admin{이름}Service{Impl}` | `AdminNoticeServiceImpl` |
| 매퍼(MyBatis) | `{이름}Mapper.java` + 같은 이름의 xml | `BoardMapper.java` ↔ `BoardMapper.xml` |
| 저장소(레포지토리) | `{이름}Repository` | `BoardRepository` |
| 메시지 enum | `{도메인}Messages` | `NoticeMessages`, `CouponMessages` |
| 객체 변환기 | `{이름}MapStruct` | `NoticeMapStruct` |
| 컨트롤러 | `{이름}Controller` / `Admin{이름}Controller` | `NoticeController` / `AdminNoticeController` |

매퍼 XML의 `namespace`는 반드시 자바 인터페이스의 전체 경로와 똑같아야 한다. 다르면 실행 중 오류가 난다.

---

## 4. DTO / Entity 규칙

- 요청/응답 DTO는 **무조건 `record`로 작성한다.** `class` + getter 방식 금지
- 시간 필드는 `@JsonFormat(pattern = "yyyy-MM-dd HH:mm")`로 직렬화한다
- 도메인 내부에서만 쓰는 조립용 객체(엔티티 여러 개를 묶어 넘기는 용도)도 record로 만든다
- 입력값 검증(`@NotBlank`, `@NotNull` 등)은 요청 record 필드에 붙이고, 컨트롤러 파라미터에 `@Valid`를 붙인다

```java
public record NoticeRequest(String title, String content, Boolean isPinned) { }
```

- Entity는 MyBatis가 setter로 값을 채우는 방식이라 record로 만들 수 없다 — 예외적으로 Lombok 클래스(`@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor`) 사용, 필드는 항상 `private`
- Entity에는 삭제 컬럼(`isDeleted`)을 두고, 실제 삭제(DELETE 문) 대신 값만 바꾸는 소프트 삭제를 기본으로 한다

---

## 5. 컨트롤러 규칙

| 항목 | 규칙 |
|---|---|
| URL | `/api/{도메인명(복수형)}` (일반), `/api/admin/{도메인명(복수형)}` (관리자). 소문자 연결(kebab-case) |
| 클래스 분리 | 일반 `{도메인}Controller` / 관리자 `Admin{도메인}Controller` 로 클래스 자체를 나눈다 |
| HTTP 메서드 | GET 조회 · POST 생성 · PUT `/{id}` 전체수정 · PATCH `/{id}/{항목}` 부분수정(공개여부 등) · DELETE `/{id}` 삭제(소프트) |

`/api/admin/**` 경로는 보안 설정에서 관리자 권한만 통과하도록 이미 막혀 있다. 이게 실제로 작동하는 유일한 권한 가드이므로, 새 관리자 기능은 반드시 이 경로 규칙을 따라야 한다.

---

## 6. 서비스 규칙

- `@Service @RequiredArgsConstructor` 항상 같이 사용, 생성자 주입만 사용(필드 직접 주입 금지)
- 클래스 전체에 읽기 전용 트랜잭션을 기본으로 걸고, 값을 바꾸는 메서드에만 일반 트랜잭션을 따로 건다
- 내부에서만 쓰는 도우미 메서드는 `private`으로 만든다
- 예외는 `throw new BaseException(도메인Messages.코드, HttpStatus.상태)` 형태로 던진다

---

## 7. 저장소(Repository) / 매퍼 규칙

```
Controller → Service → Repository → Mapper(인터페이스) ↔ Mapper(xml) → DB
```

- Repository는 매퍼를 감싸는 얇은 래퍼다. 여기서 비즈니스 로직이나 예외를 던지지 않는다 — 그 역할은 Service가 한다
- 매퍼 인터페이스에서 여러 값을 넘길 때는 `@Param`을 반드시 붙인다
- insert/update/delete는 영향받은 행 수(`int`)를 반환하고, Repository가 이를 `boolean`으로 바꿔준다 (`mapper.insert(e) > 0`)
- 단일 조회는 `Optional<T>`로 감싸는 것을 표준으로 한다
- 매퍼 XML: 조회 쿼리 WHERE 절에 `is_deleted = FALSE`를 항상 넣는다. 삭제는 `UPDATE ... SET is_deleted = TRUE`로 처리한다 (실제 DELETE 문 금지). DB 컬럼명(snake_case)과 자바 필드명(camelCase)은 자동 변환되며, 이름이 다른 경우에만 별도로 매핑을 지정한다

---

## 8. 응답 형식 / 예외 처리

```json
// 성공
{ "success": true, "code": "NOTICE_SUCCESS", "data": { ... } }
// 실패
{ "success": false, "code": "NOTICE_NOT_FOUND", "data": null }
```

- 컨트롤러가 일반 객체나 리스트를 그대로 반환하면 위 형태로 자동 포장된다. 신규 컨트롤러는 이 형태(`GlobalResponse<T>`)를 직접 반환하며 결과 코드를 명시하는 방식을 기본으로 한다
- 예외는 공통 예외 클래스 하나(`BaseException`)만 사용한다. 도메인마다 별도 예외 클래스를 새로 만들지 않는다
- 예외 코드는 도메인별 메시지 enum(`{도메인}Messages`)에서 가져온다. enum 이름 앞에는 도메인명을 대문자로 붙이고(`NOTICE_`, `COUPON_`), 성공/실패 코드를 같은 enum 안에 함께 둔다

---

## 9. 권한 처리 (인증/인가)

- 외부 로그인(네이버) 인증 후 서버가 사용자 정보를 확인/생성하고 JWT를 HttpOnly 쿠키로 내려준다. 신규 사용자는 자동으로 일반 등급 생성, 관리자 등급으로 올리는 절차는 코드에 없다 — DB에서 직접 바꾼다
- 매 요청마다 서버 필터가 쿠키 토큰을 검증해 사용자 아이디/권한을 꺼내 요청에 심는다. `/api/admin/**` 경로만 관리자 권한을 강제로 요구하며, 그 외 경로는 로그인 강제가 없다 — 로그인이 꼭 필요한 화면은 컨트롤러에서 직접 `사용자아이디 == null`을 체크해야 한다 (빠뜨리기 쉬운 지점)

신규 엔드포인트 권한 설정 순서
1. 공개 / 로그인 필요 / 관리자 전용 중 분류
2. URL 결정 — 공개·로그인 필요는 `/api/{도메인}/...`, 관리자는 `/api/admin/{도메인}/...`
3. 관리자 경로는 자동으로 막히므로 별도 설정 불필요. 로그인 필요 경로는 컨트롤러에서 직접 확인
4. 검증: 쿠키 없이 호출(공개 성공/나머지 실패), 일반 사용자 쿠키로 관리자 경로 호출(실패) 확인

인증 관련 응답 코드: 로그인 안 됨 `AUTH_UNAUTHORIZED`, 상태 제한(정지·탈퇴) 또는 권한 부족 `AUTH_USER_BLOCKED`.

---

## 10. 캐시 규칙

| 상황 | 방식 |
|---|---|
| 단순 조회 캐시 | `@Cacheable(value = "도메인명", key = "'public'")` |
| 값 변경 후 즉시 비우기 | `@CacheEvict` |
| 값 변경 후 트랜잭션 커밋 완료 시점에 비우기 (권장) | 커밋 후 비우는 전용 어노테이션 — 롤백 시 캐시가 잘못 비워지는 문제를 막는다 |

현재 TTL이 없는 캐시를 쓰기 때문에, 값을 바꾸는 메서드는 캐시 비우기 처리를 빠뜨리면 안 된다.

---

## 11. 신규 도메인 추가 체크리스트

1. 패키지 생성: `domain/{이름}/{controller,service,repository,repository/mapper,entity,enums,dto/{request,response,mapstruct}}`
2. Entity 작성 (`isDeleted`, `createdAt`, `updatedAt` 포함) → 매퍼 인터페이스 + XML 작성 (namespace 일치 확인, 조회/등록/수정/삭제 5종) → Repository 작성 (int → boolean 변환만)
3. `{이름}Messages` enum → 요청/응답 DTO(record) + 필요한 입력값 검증 → 객체 변환기(MapStruct) 작성
4. 서비스 인터페이스 + 구현체 작성 (읽기 readOnly, 변경은 일반 트랜잭션, 예외는 `BaseException`) → 컨트롤러 작성 (일반 + 필요 시 관리자 별도 클래스)
5. 캐시 적용 여부 결정 (조회는 `@Cacheable`, 변경은 캐시 비우기)
6. DB 테이블/마이그레이션은 별도 트랙(운영)에서 진행 — 여기서 직접 하지 않는다

---

## 12. 하지 말아야 할 것

- DTO를 class + Lombok 방식으로 만들지 않는다 — 항상 record
- 매퍼 XML의 namespace를 자바 인터페이스 경로와 다르게 두지 않는다
- 컨트롤러에서 도메인 예외를 try-catch로 직접 처리하지 않는다 (전역 처리기에 맡긴다)
- Repository에서 예외를 던지지 않는다
- 도메인마다 별도 예외 클래스를 새로 만들지 않는다 (`BaseException` 하나만 사용)
- 관리자 기능을 `/api/admin/**` 바깥 경로에 만들지 않는다
- 로그인 여부 확인이 필요한 일반 API에서 확인 로직을 빠뜨리지 않는다
- 운영 환경 설정 파일에 비밀번호·키 값을 평문으로 적지 않는다 — 환경변수로 주입한다

---

## 13. 참고

- 프론트엔드 쪽 API 호출 규칙은 `docs/convention/frontend.md` 참조
