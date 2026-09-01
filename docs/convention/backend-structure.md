# 백엔드 구조 지도

> 기준일: 2026-09-01
> 대상: `src/main/java/com/dawne/com2usbaseball` + `src/main/resources/mapper`
> 이 문서는 **실제로 무엇이 어디 있는지** 를 적는다. 규칙 자체는 [backend.md](./backend.md) 를 본다.

새 코드를 짜기 전에 **비슷한 일을 하는 기존 도메인을 먼저 찾아서 그 형태를 따른다.**
도메인 하나만 보고 따라가면 소수 패턴을 베낄 수 있으니, 아래 표로 전체를 먼저 확인한다.

---

## 1. 최상위 4구역

| 구역 | 담는 것 | 도메인 의존 |
|---|---|---|
| `common/` | 공용 응답·예외·유틸·공용 enum | 없음 |
| `config/` | 인프라 설정 빈 (보안·CORS·S3·Swagger·로깅) | 없음 |
| `security/` | 쿠키·JWT·인증 필터 | 없음 |
| `domain/` | 업무 코드 | — |

`common` · `config` · `security` 는 도메인을 참조하지 않는다. 반대 방향만 허용한다.

### common 안에 이미 있는 것

새로 만들기 전에 여기 있는지부터 본다.

| 파일 | 쓰임 |
|---|---|
| `support/dto/GlobalResponse` | 모든 응답 껍데기. `success(메시지enum, data)` / `fail(메시지enum)` |
| `support/dto/ListResponse` · `OperationResponse` | 목록·단순 처리 결과 응답 |
| `support/exception/BaseException` | 업무 예외. `(메시지enum, HttpStatus)` 로 던진다 |
| `support/advice/GlobalExceptionHandler` | 예외 → 응답 변환 |
| `support/advice/GlobalResponseAdvice` | 응답 후처리 |
| `support/cache/CacheEvictAfterCommit` | 커밋 이후 캐시 비우기 (직접 만들지 말 것) |
| `support/ListAssembler` | 목록 조립 도우미 |
| `util/ClientInfoExtractor` · `util/JsonUtils` | IP·UA 추출, JSON 변환 |
| `enums/CommonMessages` | 공통 성공 코드 |
| `enums/fun/CardGrade` · `enums/fun/PlayerRole` | 게임 공용 enum. **도메인마다 새로 만들지 않는다** |
| `enums/site/Grade` · `enums/site/Target` | 사이트 공용 enum |

---

## 2. 도메인 목록

`domain/` 아래 9개다.

| 도메인 | 성격 | 비고 |
|---|---|---|
| `admin` | 관리자 부속 | 업로드, Swagger 토큰 발급. 저장소·엔티티 없음 |
| `community` | 게시판 | 도메인 하나에 컨트롤러 14개. 가장 큼 |
| `coupon` | 쿠폰 | 문서 인터페이스 있음 |
| `event` | 이벤트 | 문서 인터페이스 있음 |
| `fun` | 게임 데이터 | **2단계 구조** — `fun/playerCard`, `fun/legendCard` |
| `notice` | 공지 | 문서 인터페이스 있음 |
| `oauth` | 인증·회원 | 서비스 보조 클래스 있음 |
| `player` | 선수(구버전) | 서비스 보조 클래스 있음 |
| `quiz` | 퀴즈 | 문서 인터페이스 있음 |

`fun` 은 게임 원본 데이터라 그 아래에서 한 번 더 나뉜다. 새 게임 데이터는 `fun/{이름}/` 으로 만든다.

---

## 3. 주소 지도

같은 자원인데 주소가 겹치지 않도록, 새 컨트롤러를 만들기 전에 여기서 확인한다.

### 일반

| 주소 | 컨트롤러 |
|---|---|
| `/api/auth` | AuthController |
| `/api/users` | UserController |
| `/api/boards` · `/api/posts` · `/api/comments` | BoardController · PostController · CommentController |
| `/api/tags` · `/api/post-tags` · `/api/reports` | TagController · PostTagController · ReportController |
| `/api/post-reactions` · `/api/comment-reactions` | PostReactionController · CommentReactionController |
| `/api/coupons` · `/api/events` · `/api/notices` · `/api/quiz` | 각 도메인 컨트롤러 |
| `/api/player` | PlayerCardController (구버전) |
| `/api/player-cards` | FunPlayerCardController (선언만, 엔드포인트 없음) |
| `/api/legends` | FunPlayerLegendController |

### 관리자

`/api/admin/**` 는 보안 설정에서 `ADMIN` 권한을 요구한다.

| 주소 | 컨트롤러 |
|---|---|
| `/api/admin/boards` · `/posts` · `/comments` · `/tags` · `/post-tags` · `/reports` | community 관리자군 |
| `/api/admin/coupons` · `/events` · `/notices` · `/quiz` · `/users` | 각 도메인 관리자 |
| `/api/admin/player` · `/api/admin/player-cards` | 구버전 · fun |
| `/api/admin/dev` | SwaggerController (로컬 전용) |
| `/api/upload` | UploadController (ADMIN) |

---

## 4. 도메인 한 개의 속

`coupon` 이 가장 표준에 가깝다. 새 도메인은 이 형태를 따른다.

```text
domain/{도메인}/
├─ controller/
│   ├─ {도메인}Controller.java
│   ├─ Admin{도메인}Controller.java
│   └─ docs/{이름}SwaggerDocs.java     # 선택 — 문서 설명만 분리
├─ service/
│   ├─ {도메인}Service.java            # 인터페이스
│   ├─ {도메인}ServiceImpl.java
│   └─ support/                        # 선택 — 이 도메인에서만 쓰는 보조
├─ repository/
│   ├─ {도메인}Repository.java         # 매퍼를 감싸는 얇은 래퍼
│   └─ mapper/{도메인}Mapper.java      # MyBatis 인터페이스
├─ entity/{이름}Entity.java
├─ enums/
│   ├─ {도메인}Messages.java           # 성공·실패 메시지
│   └─ 그 밖의 도메인 enum
└─ dto/
    ├─ request/{이름}Request.java      # record
    ├─ response/{이름}Response.java    # record
    └─ mapstruct/{이름}MapStruct.java
```

### 계층별 책임

| 계층 | 하는 일 | 하지 않는 일 |
|---|---|---|
| 컨트롤러 | 입력 받기, 서비스 호출, `GlobalResponse` 포장 | 업무 판단, 직접 조회 |
| 서비스 | 업무 흐름, 예외 던지기, 트랜잭션 | SQL 작성 |
| 저장소 | 매퍼 호출을 감싸기 | 업무 판단 |
| 매퍼 인터페이스 + XML | SQL | 그 외 전부 |
| MapStruct | 객체 1:1 변환 | 여러 소스 합치기 |

---

## 5. 자주 틀리는 네 가지

### 변환기 위치

`dto/mapstruct/{이름}MapStruct.java` 가 맞다. 13개 도메인이 이 형태다.

`fun/playerCard` 만 `dto/FunPlayerCardDtoMapper.java` 로 되어 있는데 **이건 예외이고 따라가면 안 된다.**
같은 묶음 안에 있다고 그대로 베끼면 소수 패턴을 늘리게 된다.

### 여러 소스를 합치는 응답

MapStruct는 1:1 변환만 시킨다. 상위 객체와 하위 목록을 합쳐야 하면
응답 record 안에 정적 팩토리를 둔다.

```java
public record XxxDetailResponse(..., List<YyyResponse> items) {
    public static XxxDetailResponse of(XxxEntity entity, List<YyyResponse> items) { ... }
}
```

record 는 항목을 늘리면 컴파일이 깨져 빠뜨릴 수 없다. `fun/legendCard` 가 이 방식을 쓴다.

### 목록 변환

매퍼에 `toResponseList(List)` 를 두거나, 서비스에서 `.stream().map(mapper::toResponse).toList()` 로 푼다.
둘 다 쓰이고 있으니 도메인 안에서만 한 가지로 통일하면 된다.

### 매퍼 인터페이스 이름은 프로젝트 전체에서 하나뿐이어야 한다

MyBatis 는 매퍼 빈을 **패키지를 뺀 클래스 이름만으로** 등록한다.
그래서 패키지가 달라도 이름이 같으면 서버가 아예 뜨지 않는다.

```
ConflictingBeanDefinitionException:
  Annotation-specified bean name 'teamMapper' ...
  conflicts with existing, non-compatible bean definition of same name
```

실제로 `domain/fun/team` 에 `TeamMapper` 를 만들었다가 `domain/player` 의 같은 이름과 부딪혀
기동이 막혔다. `FunTeamMapper` 로 바꿔 해결했다.

**새 매퍼를 만들기 전에 같은 이름이 있는지 본다.**

```bash
grep -rl "@Mapper" src/main/java --include=*.java | sed 's#.*/##; s#.java$##' | sort | uniq -d
```

`fun` 묶음은 `Fun` 을 앞에 붙이는 것이 이미 관례다 — `FunPlayerLegendMapper`, `FunTeamMapper`.

---

## 6. 매퍼 XML 자리

`resources/mapper/{구분}/{도메인}/*.xml` 이고, 구분은 세 갈래다.

| 구분 | 담는 것 | 예 |
|---|---|---|
| `site/` | 서비스 운영 데이터 | `site/community/PostMapper.xml`, `site/coupon/CouponMapper.xml` |
| `fun/` | 게임 데이터 | `fun/legendCard/PlayerLegendMapper.xml` |
| `player/` | 선수(구버전) | `player/TeamMapper.xml` |

이 갈래는 `sql/V2/{site,fun}` 폴더 나눔과 짝을 이룬다. 테이블 이름도 `site_` · `fun_` · `data_` 로 앞이 붙는다.

XML 파일 이름은 매퍼 인터페이스와 맞추고, `namespace` 에는 인터페이스 전체 경로를 적는다.
이름이 어긋나면 앱 뜰 때 터진다.

---

## 7. 새 도메인 만들 때 확인표

- [ ] 주소가 § 3 과 겹치지 않는가
- [ ] 이미 있는 도메인 중 성격이 가장 가까운 것을 골라 그 형태를 따랐는가
- [ ] `common` 에 이미 있는 것을 다시 만들지 않았는가 (특히 `PlayerRole` · `CardGrade`)
- [ ] 변환기를 `dto/mapstruct/` 에 뒀는가
- [ ] 메시지 enum 을 만들고 컨트롤러가 그것으로 응답하는가
- [ ] 매퍼 XML 을 올바른 갈래(`site` / `fun` / `player`)에 뒀는가
- [ ] XML `namespace` 와 인터페이스 경로가 같은가
- [ ] `@Transactional(readOnly = true)` 를 서비스 구현에 걸었는가 (쓰기 메서드만 따로 `@Transactional`)
- [ ] 빌드가 지나가는가 (`./gradlew compileJava`)

---

## 8. 알아둘 특이사항

| 사항 | 내용 |
|---|---|
| 빈 이름 충돌 | 구버전과 이름이 같으면 `@RestController("이름V2")` 처럼 이름을 준다. `FunPlayerCardController` 가 그렇게 하고 있다 |
| 빈 컨트롤러 | `FunPlayerCardController` 는 주소 선언만 있고 안이 비어 있다. 채우기 전에 쓰임을 먼저 정한다 |
| 문서 인터페이스 | `coupon` · `event` · `notice` · `oauth` · `quiz` 5개만 `controller/docs/` 를 두고 있다. 나머지는 컨트롤러에 바로 붙인다 |
| 서비스 보조 | `oauth` · `player` 만 `service/support/` 를 쓴다. 서비스가 길어질 때만 나눈다 |
| Swagger | 기본이 꺼져 있다. `SWAGGER_UI_ENABLED=true` 와 `local` 프로필로 띄우면 `/swagger-ui.html` 이 열린다. 운영은 강제로 꺼져 있다 |
| 구버전 잔재 | `domain/player` 와 `player_card` · `player_legend` · `teams` 테이블은 구버전이다. `fun_` · `data_` 쪽과 헷갈리지 않게 한다 |

---

## 9. 함께 볼 것

- [backend.md](./backend.md) — 규칙 (네이밍·응답·권한·캐시·금지사항)
- [frontend.md](./frontend.md) — 화면 쪽 규칙
- `sql/V2/{site,fun}` · `sql/V3/data` — 테이블 정의와 초기 데이터
