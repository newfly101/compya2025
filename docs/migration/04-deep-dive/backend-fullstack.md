# 백엔드 풀스택 관점 — 깊게 보기

> 기준일: 2026-09-25
> 전제 지식: Spring Boot · Spring Security · MyBatis 기본

---

## 1. 새 소비자: 빌드 서버

지금까지 API 의 소비자는 **브라우저 하나**였다. 이관 후에는 둘이다.

| | 브라우저 | 빌드 서버(Next, GitHub Actions 러너) |
|---|---|---|
| 언제 부르나 | 사용자 조작 때 | 배포 때, 한 번에 수십~수백 요청 |
| 쿠키 | 있음(로그인 시) | 없음 — 항상 익명 |
| CORS | 적용됨 | **적용 안 됨**(CORS 는 브라우저 규칙) |
| 실패하면 | 화면에 에러 문구 | 빌드 실패 또는 **틀린 HTML 이 배포됨** |
| 필요한 것 | 화면 단위 응답 | 목록의 **식별자 집합**(어떤 페이지를 만들지), 404/5xx 구분, 가벼운 응답 |

이 표가 1단계 BE 작업의 이유다. 빌드 서버에게 "없음" 과 "고장" 은 전혀 다른 일이다: 없으면 그 페이지를 만들지 않고, 고장이면 배포를 멈춰야 한다.

---

## 2. API 계약 — 식별자 · 요약 · 페이지네이션

### 2.1 사람이 읽는 식별자(슬러그)는 서버 데이터다

| 설계 | 문제 |
|---|---|
| FE 가 제목으로 슬러그 생성(현재) | 중복 · 제목 수정 시 주소 깨짐 · 역조회 불가 → 목록 전체 스캔 |
| **DB 컬럼 + UNIQUE + 생성 후 불변** | 주소가 데이터의 일부가 된다. 제목을 바꿔도 검색 색인이 유지된다 |

기존 주소를 지키는 백필이 핵심이다 — 지금 FE 알고리즘을 SQL/Java 로 그대로 옮겨 1회 채우고, 결과를 FE 함수와 대조한다([BE-06](../02-diagnosis/backend/BE-06-notice-contract.md)).

### 2.2 목록은 요약, 상세는 본문

`GET /api/notices` 는 본문 HTML 을 포함한 전체 목록이다. 목록 화면 · sitemap · 정적 경로 생성에 필요한 것은 `{id, slug, title, publishedAt, updatedAt}` 뿐이다. **읽는 쪽이 필요한 모양으로 DTO 를 나누는 것**이 성능과 결합도 모두에 좋다(요약 DTO 는 이미 있고 쓰이지 않을 뿐).

### 2.3 응답 봉투 일관성

`GlobalResponse{success, code, data}` + 목록은 `ListResponse{items}` 로 통일하면, FE 는 `GlobalResponse<ListResponse<T>>` 하나의 제네릭으로 모든 목록을 다룬다. 이관 때 TypeScript 가 불일치를 전부 드러내므로 **도메인을 옮길 때마다 그 도메인의 응답을 정리**한다([BE-07](../02-diagnosis/backend/BE-07-response-shape.md)).

---

## 3. 에러 의미론

| 상황 | 올바른 응답 | 지금 | 빌드 서버의 반응 |
|---|---|---|---|
| 없는 리소스 | 404 | 직접 챙긴 곳만 404 | 페이지 생략(`notFound()`) |
| 잘못된 입력 | 400 | **500** | 코드 버그 → 빌드 실패가 맞음 |
| 인증 필요 | 401 | 401 | 공개 경로에서 나오면 안 됨 |
| 권한 없음 | 403 | 403(코드가 `AUTH_USER_BLOCKED` 로 오표기) | — |
| 서버 장애 | 500 | 500 | **배포 중단** |

`ResponseEntityExceptionHandler` 를 상속해 Spring MVC 표준 예외를 4xx 로 매핑하면 대부분 해결된다. 로그 레벨도 4xx 는 `warn`, 5xx 만 `error` — 알람의 신호 대 잡음비가 올라간다([BE-01](../02-diagnosis/backend/BE-01-all-errors-500.md)).

---

## 4. 인증 쿠키 설계

### 4.1 지금 구조 (좋은 점)

- 토큰을 **HttpOnly 쿠키**로만 주고받는다 → JS 가 토큰을 읽을 수 없어 XSS 로 탈취되지 않는다
- refresh 토큰은 무작위 값 + **SHA-256 해시로 DB 저장** + 사용 시 **회전**(rotation) → DB 가 유출돼도 원문이 없다
- 역할 변경 시 refresh 토큰 전부 삭제 → 30분 안에 권한 반영

### 4.2 고칠 점과 이유

| 속성 | 지금 | 권장 | 이유 |
|---|---|---|---|
| `ACCESS_TOKEN` Max-Age | 없음(세션) | JWT 수명(1800초) | 만료 토큰이 계속 전송되어 공개 API 401([BE-02](../02-diagnosis/backend/BE-02-expired-token-blocks-public-get.md)) |
| SameSite | None | **Lax** | `compyafun.com` ↔ `api.compyafun.com` 은 같은 사이트(eTLD+1 동일). None 은 제3 사이트에서의 요청에도 쿠키를 실어 CSRF 위험 증가 — CSRF 필터는 꺼져 있다 |
| Domain | 코드 상수 | 설정값 | 환경별 분리([BE-05](../02-diagnosis/backend/BE-05-hardcoded-env.md)) |
| `REFRESH_TOKEN` Path | `/api/auth` | 유지(정적 export) / 7단계에서 재검토 | 서버 렌더에서 갱신이 필요할 때만 넓힌다 — 노출 범위를 최소로 |

### 4.3 공개 경로에서 무효 토큰 = 익명

필터가 할 일은 "토큰이 유효하면 인증 정보를 채운다" 까지다. "이 요청에 인증이 필요한가" 는 인가 규칙의 일이다. 둘을 섞으면 이번처럼 공개 API 가 로그인 사용자에게만 실패한다.

### 4.4 OAuth `state`

`state` 는 **로그인 시작과 콜백을 같은 브라우저 세션으로 묶는 값**이다. 생성 → 저장(HttpOnly 단명 쿠키) → 콜백에서 비교 → 삭제, 네 단계가 모두 있어야 의미가 있다. 콜백을 BE 가 받으므로 생성도 BE 가 해야 한 곳에서 닫힌다([BE-03](../02-diagnosis/backend/BE-03-oauth-state-unchecked.md)).

---

## 5. CORS 와 출처

- CORS 는 **브라우저가 다른 출처의 응답을 JS 에 보여줄지** 정하는 규칙이다. 서버 간 호출(빌드)에는 적용되지 않는다 → prerender(브라우저)는 CORS 에 묶였고 Next 빌드(Node)는 묶이지 않는다.
- `allowCredentials(true)` 이면 `*` 를 쓸 수 없으므로 출처를 나열해야 한다. 나열은 **설정값**으로: 로컬 Next(`localhost:3000`), 운영, 필요 시 미리보기.
- `exposedHeaders("Set-Cookie")` 는 효과가 없다 — 브라우저는 `Set-Cookie` 를 JS 에 절대 노출하지 않는다.

---

## 6. 캐시와 변경 알림

| 층 | 지금 | 이관 후 역할 |
|---|---|---|
| 서버 메모리 캐시 | `@Cacheable`, `simple`(TTL 없음) | 유지. Caffeine 으로 크기 · 만료 상한([BE-08](../02-diagnosis/backend/BE-08-cache-config-drift.md)) |
| HTTP 캐시 | 게임 데이터 5개에 ETag + max-age 1h | 공지 요약 · 쿠폰 · 이벤트에도 ETag — 잦은 빌드의 부하 감소 |
| 정적 HTML | prerender 스냅샷 | Next `out/` |
| **변경 알림** | 사람이 배포 버튼 | 어드민 변경 **커밋 후** → `repository_dispatch` → 재빌드 |

변경 알림은 `@TransactionalEventListener(phase = AFTER_COMMIT)` 로 건다. 커밋 전에 알리면 빌드가 옛 데이터를 읽는 경쟁 상태가 생긴다. 알림 실패가 저장 실패가 되지 않도록 비동기 + 로그로 처리한다.

---

## 7. 운영 — 마이그레이션 · 테스트 · 배포

| 주제 | 지금 | 이관 기간에 필요한 최소 |
|---|---|---|
| 스키마 변경 | 수동 SQL, 적용 기록 없음 | 공지 slug 부터 기록(Flyway baseline 또는 기록표)([OPS-03](../02-diagnosis/ops/OPS-03-db-migration.md)) |
| 테스트 | 매퍼 테스트(실 DB 필요) 위주 | 보안 규칙 · 예외 매핑 · OAuth `@WebMvcTest`([OPS-04](../02-diagnosis/ops/OPS-04-test-gap.md)) |
| 배포 | 수동, 테스트 생략 | 배포 워크플로에 `test` 추가, PR 검사([OPS-02](../02-diagnosis/ops/OPS-02-deploy-pipeline.md)) |

---

## 8. 스스로 점검 질문

1. 이 엔드포인트를 쿠키 없는 빌드 서버가 불러도 같은 결과인가?
2. "없음" 과 "고장" 이 다른 상태 코드로 오는가?
3. 이 데이터가 바뀌면 정적 HTML 을 다시 만들라고 누가 알리나? 커밋 후인가?
4. 이 쿠키는 어떤 요청에 실리나(Domain · Path · SameSite)? 그게 필요한 최소 범위인가?
5. 이 설정값은 환경이 바뀌면 코드를 고쳐야 하나?
