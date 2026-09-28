# DB mapper-mapping

> ⚠️ 2026-08-20: coach/skill(코치) 도메인 서버·DB·시드 완전 삭제됨. 아래 coach 관련 서술은 삭제 이전 기록.

> Java mapper interface ↔ MyBatis XML namespace 1:1 매핑 검증 + entity ↔ DB column 매핑.
> baseline: `src/main/java/.../repository/mapper/*.java` + `src/main/resources/mapper/**/*.xml`.

---

## 1. interface ↔ XML namespace 표

| Java interface (FQCN) | XML namespace | 위치 | 정합성 |
|---|---|---|---|
| `domain.coupon.repository.mapper.CouponMapper` | 동일 | `mapper/site/coupon/CouponMapper.xml` | ✓ |
| `domain.event.repository.mapper.EventMapper` | 동일 | `mapper/site/event/EventMapper.xml` | ✓ |
| `domain.notice.repository.mapper.NoticeMapper` | 동일 | `mapper/site/notice/NoticeMapper.xml` | ✓ |
| `domain.quiz.repository.mapper.QuizMapper` | 동일 | `mapper/fun/quiz/QuizMapper.xml` | ✓ |
| `domain.oauth.repository.mapper.UserMapper` | 동일 | `mapper/UserMapper.xml` | ✓ |
| `domain.oauth.repository.mapper.RefreshTokenMapper` | 동일 | `mapper/site/oauth/RefreshTokenMapper.xml` | ✓ |
| `domain.community.repository.mapper.BoardMapper` | 동일 | `mapper/site/community/BoardMapper.xml` | ✓ |
| `domain.community.repository.mapper.PostMapper` | 동일 | `mapper/site/community/PostMapper.xml` | ✓ |
| `domain.community.repository.mapper.CommentMapper` | 동일 | `mapper/site/community/CommentMapper.xml` | ✓ |
| `domain.community.repository.mapper.PostReactionMapper` | 동일 | `mapper/site/community/PostReactionMapper.xml` | ✓ |
| `domain.community.repository.mapper.CommentReactionMapper` | 동일 | `mapper/site/community/CommentReactionMapper.xml` | ✓ |
| `domain.community.repository.mapper.PostTagMapper` | 동일 | `mapper/site/community/PostTagMapper.xml` | ✓ |
| `domain.community.repository.mapper.TagMapper` | 동일 | `mapper/site/community/TagMapper.xml` | ✓ |
| `domain.community.repository.mapper.ReportMapper` | 동일 | `mapper/site/community/ReportMapper.xml` | ✓ |
| `domain.skill.repository.mapper.PlayerSkillsMapper` | 동일 | `mapper/PlayerSkills.xml` | ✓ |
| `domain.skill.repository.mapper.CoachMapper` | 동일 | `mapper/CoachMapper.xml` | ✓ |
| `domain.skill.repository.mapper.SkillScoreConfigMapper` | 동일 | `mapper/SkillScoreConfigMapper.xml` | ✓ |
| `domain.player.repository.mapper.TeamMapper` | 동일 | `mapper/TeamMapper.xml` | ✓ |
| `domain.player.repository.mapper.PlayerCardMapper` | 동일 | `mapper/player/PlayerCardMapper.xml` | ✓ |
| `domain.player.repository.mapper.LegendPlayerCareerMapper` | 동일 | `mapper/player/PlayerCareer.xml` | ✓ |
| **`domain.fun.playerCard.repository.mapper.FunPlayerCardMapper`** | **`domain.fun.playerCard.mapper.PlayerCardMapper`** | `mapper/fun/playerCard/PlayerCardMapper.xml` | ⚠ **mismatch** |
| **`domain.fun.playerCard.repository.mapper.PlayerCardHitterStatsMapper`** | **`domain.fun.playerCard.mapper.PlayerCardHitterStatsMapper`** | `mapper/fun/playerCard/PlayerCardHitterStatsMapper.xml` | ⚠ **mismatch** |
| **`domain.fun.playerCard.repository.mapper.PlayerCardPitcherStatsMapper`** | **`domain.fun.playerCard.mapper.PlayerCardPitcherStatsMapper`** | `mapper/fun/playerCard/PlayerCardPitcherStatsMapper.xml` | ⚠ **mismatch** |
| **`domain.fun.playerCard.repository.mapper.PlayerCardPitcherPitchGradesMapper`** | **`domain.fun.playerCard.mapper.PlayerCardPitcherPitchGradesMapper`** | `mapper/fun/playerCard/PlayerCardPitcherPitchGradesMapper.xml` | ⚠ **mismatch** |
| **`domain.fun.playerCard.repository.mapper.PlayerCardPositionsMapper`** | **`domain.fun.playerCard.mapper.PlayerCardPositionsMapper`** | `mapper/fun/playerCard/PlayerCardPositionsMapper.xml` | ⚠ **mismatch** |

### 1.1 ⚠ fun/playerCard 5 개 mapper namespace mismatch

- XML namespace: `...mapper.PlayerCardMapper` (Java 클래스 미존재)
- Java interface: `...repository.mapper.FunPlayerCardMapper`
- 결과: XML 의 `<insert/update/select>` 가 어떤 interface 와도 바인딩 안 됨
- MyBatis 가 XML 의 statement 를 실행하지 않음 (또는 invocation 에러)
- **운영 시 fun_player_card CRUD 가 동작하지 않을 가능성** ❓ runtime 검증 필요
- 수정 옵션:
  - A. XML namespace 를 Java interface FQCN 으로 수정
  - B. Java interface 를 XML namespace 위치로 이동 (`domain.fun.playerCard.mapper.*`)
- 권고: A. (다른 도메인 일관성 — Java 가 `repository.mapper.*` 표준)

---

## 2. interface 메서드 ↔ XML statement id 매칭

표준은 메서드명 = `<select|insert|update|delete id="...">`. parameter / result 타입은 XML 에서 명시.

### 2.1 CouponMapper

| Java method | XML id | XML 라인 |
|---|---|---|
| `selectCouponList` | `selectCouponList` | `mapper/site/coupon/CouponMapper.xml:22` |
| `selectCouponListForUser` | `selectCouponListForUser` | `:7` |
| `selectCouponById` | `selectCouponById` | `:35` |
| `insertCoupon` | `insertCoupon` (useGeneratedKeys) | `:49` |
| `updateCouponById` | `updateCouponById` | `:69` |
| `updateCouponVisible` | `updateCouponVisible` | `:93` |

### 2.2 EventMapper — ⚠ 컬럼 alias 오타

| Java method | XML id | 비고 |
|---|---|---|
| `selectEventByExternalForUser` | `:8` | OK |
| `selectEventByExternal` | `:27` | ⚠ `event_type AS evemtType` 오타 (eventType 이어야 함) → entity field `eventType` 매핑 안 됨 |
| `selectEventById` | `:44` | ⚠ 동일 오타 |
| `insertEvent` | `:60` | OK |
| `updateEventByExternal` | `:84` | OK |
| `updateEventVisible` | `:114` | OK |

> **운영 영향**: admin 화면에서 `eventType` 필드가 항상 null. UI 에서 OFFICIAL/INTERNAL 구분 불가. 수정 권고.

### 2.3 NoticeMapper

| Java method | XML id | 라인 |
|---|---|---|
| `getNoticeList` | `:12` | public |
| `getNoticeDetail` | `:33` | public, `is_visible=TRUE` filter |
| `getAdminNoticeList` | `:57` | admin |
| `getAdminNoticeDetail` | `:77` | admin (filter 없음) |
| `selectNoticeById` | `:96` | admin findById |
| `insertNotice` | `:115` | useGeneratedKeys |
| `updateNotice` | `:142` | |
| `updateNoticeVisible` | `:158` | |
| `updateNoticePinned` | `:165` | |
| `deleteNotice` | `:172` | |

### 2.4 QuizMapper

| Java method | XML id |
|---|---|
| `selectLatestVisible` | `:7` (Optional<QuizEntity> 직접 반환 — repo wrap 안 함) |
| `selectAll` | `:19` |
| `selectById` | `:30` (Optional 반환) |
| `insertQuiz` | `:41` |
| `updateQuiz` | `:46` (set 동적) |
| `deleteQuiz` | `:55` |

> ⚠ MyBatis 가 result 0 건일 때 null → Optional 변환은 mapper 에서 직접 처리 (`@MapperScan` 만 으로는 자동화 안 됨). MyBatis 3.5+ 부터 Optional 반환 지원하지만 표준 패턴은 raw + Repository wrap. quiz 만 일탈.

### 2.5 PlayerSkillsMapper

| Java method | XML id |
|---|---|
| `selectSkillsByTarget(Target)` | `:6` |

> 인터페이스 메서드 이름 vs Repository 메서드 이름 mismatch: `PlayerSkillsRepository.findAllSkillSetByTarget` 가 `mapper.selectSkillsByTarget` 호출. 표준 OK.

### 2.6 fun/playerCard/FunPlayerCardMapper (Java)

| Java method | 매핑할 XML statement | 매칭 |
|---|---|---|
| `insert(PlayerCardEntity)` | XML 의 `id="insert"` (namespace = `...mapper.PlayerCardMapper` ⚠) | ⚠ namespace 불일치로 실제 바인딩 안 됨 |
| `update(PlayerCardEntity)` | XML `id="update"` | ⚠ 동일 |
| `deleteById(Long)` | XML `id="deleteById"` | ⚠ |
| `findById(Long)` | XML `id="findById"` | ⚠ |
| `findByCardCode(String)` | XML `id="findByCardCode"` | ⚠ |
| `findAll()` | XML `id="findAll"` | ⚠ |

---

## 3. ResultMap / Type alias

### 3.1 application.properties 설정

```
mybatis.mapper-locations=classpath:mapper/**/*.xml
mybatis.type-aliases-package=com.dawne.com2usbaseball.entity,com.dawne.com2usbaseball.dto
mybatis.configuration.map-underscore-to-camel-case=true
mybatis.configuration.default-enum-type-handler=org.apache.ibatis.type.EnumTypeHandler
```

> ⚠ `type-aliases-package` 가 `com.dawne.com2usbaseball.entity, com.dawne.com2usbaseball.dto` — **현재 패키지에 그 위치 없음** (entity 는 `domain.<x>.entity`, dto 는 `domain.<x>.dto`). type-aliases 가 활성화 안 되므로 모든 XML 에서 `resultType` / `parameterType` 에 FQCN 직접 명시. 현재 XML 들은 모두 FQCN 사용 중 — 영향 없음. 정리하려면 properties 수정 또는 alias 자체 제거.

### 3.2 underscore → camelCase

`map-underscore-to-camel-case=true` 활성. 예: `created_at` → `createdAt` 자동.

XML 에서 명시적 alias (`AS isVisible`) 도 다수 — 일관성 없음. 신규는 alias 생략 + `map-underscore-to-camel-case` 신뢰 권장.

### 3.3 ENUM type handler

`default-enum-type-handler=EnumTypeHandler`. DB ENUM 문자열 ↔ Java enum 이름 자동 매핑. `dual-management.md` 의 ENUM 정합 검증 필요.

---

## 4. Entity ↔ DB column 매핑 표 (주요 도메인)

### 4.1 CouponEntity ↔ site_coupons

| Java field | DB column | 메모 |
|---|---|---|
| id | id | |
| couponCode | coupon_code | |
| title | title | |
| detail | detail | |
| expireAt | expire_at | LocalDateTime |
| visible (boolean) | is_visible | ⚠ 필드명이 `visible` (Lombok `@Getter` 가 `isVisible()` 생성). MyBatis result alias 가 `is_visible AS visible` 사용 → 매핑 OK |
| createdAt / updatedAt | created_at / updated_at | |

### 4.2 NoticeEntity ↔ site_notices

| Java field | DB column |
|---|---|
| id | id |
| source (NoticeSource enum) | source ENUM |
| title / summary / content / externalUrl / imageUrl | 동일 (underscore → camel) |
| isVisible / isPinned | is_visible / is_pinned (Boolean) |
| publishedAt | published_at |
| createdAt / updatedAt | created_at / updated_at |

### 4.3 EventEntity ↔ site_events

| Java field | DB column | 메모 |
|---|---|---|
| eventType (EventType enum) | event_type | ⚠ admin select 의 `evemtType` alias 오타 |
| title | title | |
| startAt / expireAt | start_at / expire_at | |
| imageUrl / externalLink | image_url / external_link | |
| visible | is_visible | |

### 4.4 QuizEntity ↔ fun_quiz

| Java field | DB column |
|---|---|
| id / round / imageUrl | id / round / image_url |
| createdAt / updatedAt | created_at / updated_at |

> ⚠ `is_visible` DB 컬럼 — `QuizEntity` 에 매핑 필드 없음. select 쿼리에도 안 가져옴. 노출 제어가 application 단에서 무시됨. visible filter 는 SQL 에 직접 포함되지 않음 (`selectLatestVisible` 도 ORDER + LIMIT 만, WHERE is_visible 누락). ❓ 검증 필요

### 4.5 UserEntity ↔ site_users

| Java field | DB column |
|---|---|
| id | id |
| oauthProvider / oauthProviderId / oauthNickname / oauthEmail / oauthProfileImage / oauthAgeRange | 동일 (underscore→camel) |
| serviceNickname | service_nickname |
| userRole (UserRole enum) | user_role |
| userStatus (UserStatus enum) | user_status |
| createdAt / updatedAt / lastLoginAt | 동일 |

### 4.6 RefreshTokenEntity ↔ site_refresh_tokens

| Java field | DB column |
|---|---|
| id | id |
| userId | user_id |
| tokenHash | token_hash (CHAR(64)) |
| expiresAt | expires_at |
| createdAt | created_at |
| revokedAt | revoked_at (NULL = 활성) |

### 4.7 PlayerCardEntity (fun) ↔ fun_player_card

| Java field | DB column | enum 매핑 |
|---|---|---|
| id | id | |
| cardCode | card_code (UNIQUE) | |
| playerId | player_id | CHAR(36) (UUID) |
| playerName | player_name | |
| teamId | team_id | |
| playerRole (`common.enums.fun.PlayerRole`) | player_role ENUM | HITTER, PITCHER |
| cardGrade (`common.enums.fun.CardGrade`) | card_grade ENUM | ⚠ DB ENUM 7개 vs Java 9개 — `dual-management.md` |
| seasonYear | season_year SMALLINT | |
| overallRating | overall_rating SMALLINT | |

---

## 5. 신규 mapper 추가 체크리스트

- [ ] **interface 위치** — `domain/<x>/repository/mapper/XxxMapper.java`
- [ ] **`@Mapper` 어노테이션** — `@MapperScan(annotationClass=Mapper.class)` 으로 자동 등록
- [ ] **XML namespace = interface FQCN** (정확히 일치)
- [ ] **XML 위치** — `resources/mapper/<prefix>/<domain>/XxxMapper.xml` (`prefix` = `site` 또는 `fun`)
- [ ] **`@Param` 사용** — 멀티 인자 또는 명시적 매핑 시 필수
- [ ] **`useGeneratedKeys="true" keyProperty="id"`** — INSERT 후 entity.id 채우기
- [ ] **`resultType` 또는 `resultMap`** — FQCN 으로 명시 (현재 type-aliases-package 가 동작 안 함)
- [ ] **camelCase 의존** — `map-underscore-to-camel-case` 신뢰. 명시적 `AS xxxYyy` 는 가급적 생략
- [ ] **Optional / boolean 변환은 Repository 가 책임** — Mapper 는 raw entity / int 반환

---

## 6. 일탈 / 위반

| # | 위반 mapper | 표준 | 현재 | 수정 |
|---|---|---|---|---|
| 1 | fun/playerCard 5개 XML | namespace = interface FQCN | `domain.fun.playerCard.mapper.*` (interface 미존재) | XML namespace 를 `repository.mapper.*` 로 변경 |
| 2 | EventMapper.xml `selectEventByExternal/ById` | alias 정확성 | `event_type AS evemtType` 오타 | `eventType` 으로 수정 (또는 alias 제거) |
| 3 | QuizMapper interface | raw entity 반환 + Repo wrap | `Optional<QuizEntity>` 직접 반환 | 표준화 시 raw 로 변환 권장 |
| 4 | application.properties type-aliases-package | 실제 패키지와 일치 | `com.dawne.com2usbaseball.entity, dto` (없는 경로) | 패키지 수정 또는 properties 제거 |
| 5 | QuizMapper `selectLatestVisible` | is_visible filter 적용 | 적용 안 함 (LIMIT 1 만) | WHERE is_visible=true 추가 |
| 6 | XML alias 일관성 | underscore→camel 자동 의존 | NoticeMapper / CouponMapper 는 `AS xxxYyy` alias 사용, EventMapper 도 일부 사용 | 신규는 alias 생략 권장 |
