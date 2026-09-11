# 유저 테이블 개편 설계

> 설계 문서. **아직 아무것도 실행하지 않았다.** 승인 후 이관 스크립트를 따로 만든다.
> 실측 기준: `sql/V2/site/CREATE_TABLE_SITE.sql` 67~90, `sql/V3/site/*`, `sql/migration/*`, `mapper/site/oauth/UserMapper.xml`, 유저 500명

## 1. 지금 무엇이 불편한가

| 실측 | 왜 문제인가 |
|---|---|
| `site_users` 한 테이블에 OAuth 원본 6개 + 서비스 정보 5개가 섞여 있음 | 네이버가 주는 값과 우리가 책임지는 값의 경계가 없다. 어느 쪽을 지워도 되는지 판단이 매번 필요 |
| `email`(V3 ALTER) → `profile_image`(migration ALTER) 순으로 덧붙음 | 서비스 정보가 생길 때마다 OAuth 테이블을 건드리는 구조. 사용자가 지적한 지점 |
| `UNIQUE KEY uk_oauth (oauth_provider, oauth_provider_id)` 가 사람의 유일성을 정함 | **한 사람 = 로그인 수단 하나**로 못이 박혀 있다. 구글을 붙이면 같은 사람이 행 2개가 된다 |
| 탈퇴 시각 전용 컬럼이 없어 `updated_at` 을 대용 중 (`UserServiceImpl` 149행 주석) | 관리자가 권한만 바꿔도 `updated_at` 이 갱신 → **1개월 보관 시계가 리셋된다.** 정책이 조용히 깨지는 자리 |
| `oauth_age_range` 를 받아 무기한 보관 | 지금 이 값을 쓰는 화면·쿼리가 없다. 개인정보 최소수집 원칙과 어긋남 |
| `id` 가 **가입 순번 그대로인 숫자**이고 그대로 밖에 나감 | 주소를 바꿔가며 남의 것을 훑어볼 수 있고, 총 회원 수와 증가 속도가 새어나간다 (§ 3) |

---

## 2. 바꿀 구조 — 새 테이블을 만들되, 새 테이블은 OAuth 쪽이다

**핵심 판단**: 사용자가 말한 "site_users 를 두고 사이트 전용 테이블을 새로 만든다" 를 **뒤집어 적용한다.**
사이트 정보가 `site_users` 에 남고(=id 유지), **OAuth 원본을 새 테이블로 뺀다.**

> 사용자 방식대로 새 사이트 테이블에 새 id 를 부여하면, 아래 § 4 의 참조 7곳을 전부 다시 매핑해야 한다.
> 얻는 결과(원본과 서비스 정보 분리)는 같은데 비용만 훨씬 크다. (기획자 의견) 권고안을 택하길 제안한다.

### site_users — 사람 하나 = 한 행 (기존 테이블 유지, 컬럼만 덜어냄)

| 컬럼 | 상태 | 왜 여기인가 |
|---|---|---|
| `id` | 그대로 | 이미 여기저기 박혀 있다. 안쪽 연결에만 쓰고 **밖으로 내보내지 않는다** (§ 3) |
| `public_id` | **추가** `CHAR(36)` UNIQUE | 주소·API·토큰에 나가는 유일한 식별자. UUID v4 (§ 3) |
| `service_nickname` / `email` / `profile_image` | 그대로 | 우리가 책임지는 값. 네이버와 무관 |
| `user_role` / `user_status` | 그대로 | 권한·제재는 로그인 수단이 아니라 **사람**에 붙는다 |
| `withdrawn_at` | **추가** | 탈퇴 시각 전용. `updated_at` 대용을 끝낸다 |
| `created_at` / `updated_at` / `last_login_at` | 그대로 | |
| `oauth_*` 6개 | **떼어냄** | 아래 테이블로 |

### site_user_oauth_accounts — 로그인 수단 하나 = 한 행 (신규)

| 컬럼 | 설명 |
|---|---|
| `id` | PK |
| `user_id` | `site_users.id` 참조. **여러 행이 같은 user_id 를 가질 수 있다** = 여러 로그인 수단 |
| `provider` / `provider_id` | 기존 `oauth_provider` / `oauth_provider_id` 그대로 |
| `provider_nickname` / `provider_email` / `provider_profile_image` | 네이버가 준 원본 스냅샷 |
| `linked_at` / `last_login_at` | 연결 시각 / 이 수단으로 마지막 로그인한 시각 |
| `UNIQUE (provider, provider_id)` | 같은 네이버 계정이 두 사람에 붙지 못하게 |
| `UNIQUE (user_id, provider)` | 한 사람이 같은 제공자를 두 번 붙이지 못하게 |

**지금 필요 없는 것은 만들지 않는다** — 구조는 여러 수단을 받을 수 있게 열어두되, **연결/해제 화면·API 는 이번에 만들지 않는다.** 당분간 행은 사람당 1개다.

### 프로필 이미지 두 자리 · `user_status` 의 소속

- **사용자가 올린 것** = `site_users.profile_image` (우리가 보관·삭제 책임) / **네이버가 준 것** = `site_user_oauth_accounts.provider_profile_image` (제공자 스냅샷, 우리가 관리 못 함)
- `profile_image` 는 `UserMapper.xml` 20·99행이 이미 SELECT 중 — **운영에 컬럼이 없으면 지금 조회가 깨진다.** 사실상 이미 적용됐다고 봐야 하나, 스크립트는 「있으면 건너뛰고 없으면 추가」로 쓴다
- `user_status` 4값은 전부 사람에 붙으므로 `site_users` 에 남는다. 단 `WITHDRAWN` 만 **1개월 기한**이 있어 `withdrawn_at` 으로 정확히 잰다. `BLOCKED`/`SUSPENDED` 는 이번에 건드리지 않는다 (§ 8)

---

## 3. 식별자를 무엇으로 할 것인가 — 이번 개편의 핵심

| | ① PK 자체를 UUID 로 | ② **PK 는 숫자로 두고, 밖에 나가는 UUID 를 따로** |
|---|---|---|
| 보안 목적(순번 숨김) | 달성 | **똑같이 달성** |
| 공사 범위 | 참조 7개 컬럼 + FK 1개 타입 변경 | `site_users` 에 컬럼 1개 추가 |
| `site_user_event` 비용 | 행마다 user_id 가 8바이트 → CHAR(36). **영구 비용** | 없음 (숫자 그대로) |
| 되돌리기 | 타입 변경은 사실상 비가역 | **전 단계 되돌릴 수 있음** |
| 고유 위험 | 없음 | 실수로 숫자 id 를 내보내는 사고 |

### 권고 — ②

- 사용자가 원한 건 UUID 라는 형태가 아니라 **순번이 안 보이는 것**이다. ②도 그걸 그대로 이룬다
- `site_user_event` 는 **앞으로 가장 많이 쌓일 테이블**이다. 이미 `anon_id CHAR(36)` 를 들고 있는데 `user_id` 까지 CHAR(36) 가 되면 행당 고정 비용이 크게 는다. 같은 파일 21행이 「쓰기 성능 우선 — UUID 대신 순차 증가」로 PK 를 숫자로 고른 판단과도 어긋난다
- ②는 **되돌릴 수 없는 단계가 하나도 없고**, 이관 중 강제 로그아웃도 없다 (§ 5)

> 500명이라 ①도 데이터 옮기기 자체는 몇 초다. 갈림길은 **데이터 양이 아니라 영구 비용과 비가역성**이다. ①의 경로도 § 4·§ 5 에 함께 적어뒀다.

### ②의 유일한 위험 — 숫자 id 유출을 어떻게 막는가

| 장치 | 내용 |
|---|---|
| 응답 DTO 에서 숫자 id 제거 | `UserMeResponse` / `AdminUserResponse` 에 `id` 필드를 **두지 않는다.** 없으면 샐 수 없다 |
| 토큰 주체 교체 | JWT subject 를 `public_id` 로. 토큰만 봐도 숫자를 알 수 없다 |
| 주소 파라미터 타입 | API 경로를 문자열로 받고 UUID 형식이 아니면 거절. 숫자를 넣어보는 시도가 통하지 않는다 |
| 변환 지점 1곳 | `public_id → id` 변환은 서비스 진입부 한 곳에서만. 안쪽은 지금처럼 숫자로 |
| 새는지 확인 | 응답 JSON 에 숫자 id 키가 있으면 실패하는 테스트 1개 |

### UUID 형태 — v4 / `CHAR(36)`

| 물음 | 판단 |
|---|---|
| 버전 | **v4(무작위).** v7 은 **시간순**이라 가입 시각·가입 순서가 값에 그대로 담긴다 — 순번 id 를 없애려는 목적과 정면으로 어긋난다. v5 는 이름에서 계산돼 재현 가능해야 하는 마스터 데이터용(`data_player_card.sql`)이지, 사람 식별자에는 맞지 않는다 |
| MariaDB `UUID()` 함수 | **쓰지 않는다.** 10.5.4 의 `UUID()` 는 v1 이라 **시각과 장비 MAC 주소**가 값에 들어간다. `data_player_legend.sql` 14행이 이미 같은 이유로 배제했다 → **애플리케이션에서 생성** |
| 저장 형태 | **`CHAR(36)`.** `BINARY(16)` 이 작지만, 이 프로젝트 전체(`data_player_*`, `data_history_*`, `site_user_event.anon_id`)가 `CHAR(36)` 이고 눈으로 읽히는 편이 운영에 유리하다. 500행에서 용량 차이는 무의미 |

---

## 4. 참조 영향

`site_users.id` 가 그대로 남으므로 **권고안(② + OAuth 분리)에서는 하나도 깨지지 않는다.**

| 참조처 | 형태 | 실측 행수 | 권고안 ② | 만약 ①(PK 교체)이면 |
|---|---|---|---|---|
| `site_refresh_tokens.user_id` | **FK 제약** (`fk_refresh_user`, CASCADE) | 2 | 그대로 | FK 를 떼고 타입 변경 후 다시 검. 그동안 로그인 세션이 걸린다 |
| `site_user_event.user_id` | 앱 레벨 (FK 없음) | 계속 쌓임 | 그대로 | **행마다 CHAR(36). 영구 비용 — 가장 비싼 지점** |
| `site_post.author_id` · `site_comment.author_id` | 앱 레벨 | **둘 다 0건** | 그대로 | 비어 있어 타입 변경 자체는 쌈 |
| `site_post_reaction.user_id` · `site_comment_reaction.user_id` | 앱 레벨 | **0건** | 그대로 | 동상 |
| `site_report.reporter_id` · `site_report.reviewed_by` | 앱 레벨 | **0건** | 그대로 | 동상 |
| `sql/migration/V1_TO_V2_COMMUNITY.sql` | **아직 실행 안 됨** (파일 4행) | — | 영향 없음 | 118행 `JOIN site_users u` 를 고쳐야 이관 가능 |

**동결 커뮤니티** — v2 커뮤니티 테이블은 **전부 0건**이고 v1→v2 이관은 **아직 실행 전**이다(`V1_TO_V2_COMMUNITY.sql` 4행). 그래서 "동결 데이터를 건드리는 위험"은 여기엔 없다. 진짜 위험은 그 스크립트가 `author_id=1` 이라는 **숫자를 그대로 박아 넣도록 쓰여 있다**는 점 — ①을 택하면 먼저 고쳐야 하고, 안 고치고 돌리면 조용히 깨진다. 어느 쪽이든 **이번 개편과 커뮤니티 이관을 같은 날 하지 않는다.**

---

## 5. 옮기는 순서 — 500명 기준. **서비스를 멈추지 않는다**

⚠️ **운영 DB 다.** 로컬이 터널로 운영을 그대로 본다. 각 단계는 사용자가 직접 실행한다.

| 순서 | 하는 일 | 500명 기준 소요 | 서비스 영향 | 되돌리기 |
|---|---|---|---|---|
| 1 | `site_user_oauth_accounts` 생성(빈 채로) + `site_users` 에 `withdrawn_at`·`public_id` 추가 | 1초 미만 | 없음. 읽는 코드가 아직 없다 | 가능 — DROP |
| 2 | OAuth 6개 값을 새 테이블로 **복사**(원본은 그대로) + 500명에게 `public_id` 채움 | 수 초 | 없음 | 가능 — 값 비우기 |
| 3 | `public_id` 에 UNIQUE + NOT NULL 부여 | 1초 미만 | 없음 | 가능 |
| 4 | 기존 `WITHDRAWN` 계정의 `withdrawn_at` 을 현재 `updated_at` 값으로 채움 | 즉시 | 없음 | 가능 |
| 5 | 코드 배포 — 새 테이블을 읽고, 밖으로는 `public_id` 만 내보냄 (쓰기는 양쪽 동시) | 배포 시간 | 배포 순간만 | 가능 — 이전 버전 재배포 |
| 6 | 며칠 관찰. 두 곳 값이 어긋나지 않는지 확인 | — | 없음 | — |
| 7 | 쓰기를 새 테이블 한 곳으로만 | 배포 시간 | 없음 | 가능 — 5단계 코드로 |
| 8 | 🔴 `site_users` 에서 `oauth_*` 6개 컬럼 DROP | 1초 미만 | 없음 (읽는 코드 없음) | **되돌릴 수 없다** |

- **중단 시간 0분.** 1~4 는 값을 더하기만 할 뿐 기존 컬럼을 건드리지 않아, 구버전 코드가 도는 중에 돌려도 안전하다
- **로그인 중이던 사용자는 그대로 로그인 상태다.** `site_refresh_tokens.user_id` 는 숫자 그대로 남으므로 FK 를 떼었다 붙일 일이 없다. 발급된 토큰도 유효하다
  - 단 **JWT subject 를 `public_id` 로 바꾸면**(§ 3) 기존 access token 이 해석되지 않는다 → 5단계 배포 시 **옛 형식 토큰도 한동안 함께 받아준다.** 이게 없으면 그 순간 모두 로그아웃된다
  - ①(PK 교체)을 택하면 FK 를 떼는 동안 **전원 강제 로그아웃**이 불가피하다
- **비가역 단계는 8 하나뿐이다.** 실행 직전 `site_users` 전체 덤프를 남기고, 앞 단계가 며칠 무사히 돈 뒤에만 한다

---

## 6. 코드에 미치는 영향 (경로만)

| 파일 | 무엇이 바뀌나 |
|---|---|
| `src/main/resources/mapper/site/oauth/UserMapper.xml` | 조회 3곳이 새 테이블 JOIN 으로. `insertUser` 는 두 테이블 INSERT 로 분리 |
| `src/main/java/.../domain/oauth/entity/UserEntity.java` | OAuth 필드 분리. 새 entity 1개 추가 |
| `src/main/java/.../domain/oauth/repository/{UserRepository,mapper/UserMapper}.java` | 위에 맞춘 시그니처 |
| `src/main/java/.../domain/oauth/service/UserServiceImpl.java` | 가입·로그인·탈퇴·복구. **149행 `updated_at` 대용 주석이 `withdrawn_at` 으로 해소됨** |
| `src/main/java/.../domain/oauth/service/support/NaverOAuthService.java` | 제공자 값 저장 대상 변경 |
| `src/main/java/.../domain/oauth/dto/**`, `mapstruct/UserMapStruct.java` | 🔴 **응답에서 숫자 `id` 필드를 제거하고 `public_id` 로 교체** — § 3 의 유출 방지 핵심 |
| `src/main/java/.../domain/oauth/controller/{User,AdminUser}Controller.java` | 경로·파라미터를 UUID 문자열로. 숫자면 거절 |
| 인증 필터 / JWT 발급·검증 (`domain/oauth/service/AuthServiceImpl.java` 및 security 설정) | subject 를 `public_id` 로. **옛 형식 토큰 한시 허용** (§ 5) |
| `web/src/domains/users/**` | 주소·요청에 쓰던 숫자 id 를 UUID 로 |

> `RefreshToken*` 계열은 `user_id` 만 쓰므로 **변경 없음**.

---

## 7. 결정이 필요한 것

| # | 물음 | 선택지 | 결정 |
|---|---|---|---|
| 1 | 사이트 정보를 새 테이블로 뺄까, OAuth 를 뺄까 | ① 새 사이트 테이블(새 id) ② **OAuth 를 새 테이블로, id 유지** | **② 확정** — 결과는 같고 참조 7곳이 안 깨진다 |
| 2 | 🔴 식별자 — PK 를 UUID 로 바꿀까, 노출용 UUID 를 따로 둘까 | ① PK 자체를 UUID ② **PK 는 숫자 + `public_id` 노출** | **② 확정** — 보안 목적은 같고, `site_user_event` 영구 비용과 강제 로그아웃을 피한다. 대신 § 3 의 유출 방지 5장치를 **반드시 함께** 넣는다 |
| 3 | UUID 를 어떤 형태로 | ① v4 / `CHAR(36)` ② v7 ③ MariaDB `UUID()` ④ `BINARY(16)` | **① 확정** — v7·`UUID()` 는 시각이 값에 담겨 목적과 어긋난다. `CHAR(36)` 은 프로젝트 전례와 일치 |
| 4 | `oauth_age_range` 를 계속 받고 보관할까 | ① **계속 받는다** ② 새 테이블로 옮겨 보관 ③ 수집·보관 중단 | **① 확정 (사용자 결정 — 권고 뒤집힘)** — 수집을 멈추지 않는다. 개인정보처리방침 문구도 그대로 둔다. 새 테이블(`site_user_oauth_accounts`)에는 그대로 옮겨 계속 저장한다 |
| 5 | 여러 로그인 수단을 지금 어디까지 | ① 구조+화면 모두 ② **구조만 열고 화면은 나중** ③ 아무것도 안 함 | **② 확정** — 나중에 테이블 공사를 또 하지 않기 위한 최소 투자 |
| 6 | 1개월 지난 탈퇴 계정을 실제로 어떻게 파기할까 | ① 행 삭제 ② 개인정보 컬럼만 비우고 행 유지 | **보류 (사용자 결정)** — 지금 정할 내용이 아니다. `withdrawn_at` 컬럼만 두고 파기 배치·삭제 로직은 만들지 않는다 |

---

## 8. 이번에 하지 않는 것

| 안 하는 것 | 이유 |
|---|---|
| 커뮤니티 테이블의 `user_id`·`author_id` 를 UUID 로 | 권고안 ②에서는 바꿀 이유가 없다. 게다가 **전부 0건**이고 v1 이관이 아직 안 됐다 |
| 커뮤니티 v1→v2 이관 (`V1_TO_V2_COMMUNITY.sql`) | 별개 작업. 이번 개편과 **같은 날 하지 않는다** |
| `BLOCKED` / `SUSPENDED` 제재 이력 테이블 분리 | 지금 제재 건수가 없다 |
| 로그인 수단 연결·해제 화면과 API | 구글 추가가 보류(`user-features-index.md` § 4 결정 4번) |
| 1개월 지난 탈퇴 계정 자동 파기 배치 | 위 결정 6번이 **보류** 상태다. 정해진 뒤에 만든다 |
| legacy `users` / `user_roles` 정리 | 별개 트랙. 범위가 두 배가 된다 |

---

## 9. 이관 SQL 파일 (작성 완료 — ⚠️ 아직 실행 안 함)

`sql/migration/` 에 3개 파일로 나눴다. **되돌릴 수 있는 것과 없는 것을 한 파일에 섞지 않았다.**

| 순서 | 파일 | 내용 | 되돌리기 |
|---|---|---|---|
| 1 | `USER_RESTRUCTURE_01_ADD_PUBLIC_ID_AND_WITHDRAWN_AT.sql` | `public_id`·`withdrawn_at` 추가 + 500행 채움(v4) + `UNIQUE`/`NOT NULL` + `WITHDRAWN` 행 백필. `profile_image` 는 `IF NOT EXISTS` 로 유무 무관하게 안전 | 가능 |
| 2 | `USER_RESTRUCTURE_02_CREATE_OAUTH_ACCOUNTS_TABLE.sql` | `site_user_oauth_accounts` 신설 + 기존 `oauth_*` 6개 값을 **복사**(원본은 그대로) + 500행 일치 검증 | 가능 — 새 테이블 DROP |
| 3 | `USER_RESTRUCTURE_03_DROP_SITE_USERS_OAUTH_COLUMNS.sql` | 🔴 `site_users` 에서 `oauth_*` 6개 컬럼 DROP | **불가능** — 실행 전 전체 덤프 필수 |

1·2번은 서로 다른 컬럼/테이블만 만져 순서를 바꿔도 결과는 같지만, 위 순서를 권한다.
**`public_id` 500행을 v4 로 채우는 법** — MariaDB 10.5.4 `UUID()` 는 v1(시각·MAC 포함)이라 못 쓰고, v4 를
만드는 내장 함수도 없다. 1번 파일에서 `RAND()` 로 비트 조각을 만들어 버전 자리에 `4`, 변형 자리에 `8/9/a/b`
를 고정해 `CONCAT` 으로 조립했다. 신규 가입자의 `public_id` 는 이 SQL 이 아니라 **애플리케이션이
`UUID.randomUUID()` 로 생성**한다 — SQL 방식은 이번 500행 백필 전용이다.
**코드 배포 ↔ SQL 순서** — 1·2번은 컬럼/테이블을 더하기만 해 구버전 코드 중에도 안전, 배포보다 먼저 돌려도 된다.
3번은 **`site_user_oauth_accounts` 를 읽고 쓰는 코드가 이미 배포되고 며칠 관찰까지 끝난 뒤에만** 돌린다 —
먼저 돌리면 구버전 코드가 여전히 읽던 `oauth_*` 컬럼이 사라져 로그인이 그 자리에서 깨진다.
