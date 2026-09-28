---
created: 2026-09-28
updated: 2026-09-28
---

# 시스템 아키텍처

## 1. 시스템 구성도

```mermaid
flowchart LR
  User["사용자 브라우저"] -->|HTTPS| CDN["CDN + 정적 호스팅<br/>(S3 + CloudFront)"]
  CDN -->|"React SPA 다운로드"| SPA["FE: React SPA<br/>(Vite 빌드)"]
  SPA -->|"REST 호출<br/>(axios, JWT 쿠키)"| API["BE: Spring Boot API<br/>(EC2)"]
  API -->|MyBatis 매퍼| DB[("MariaDB<br/>테이블 36개")]
  API -->|업로드·조회| S3Img[("S3<br/>이미지 저장소")]
  API -.->|"인메모리 캐시<br/>(Caffeine, TTL 없음)"| Cache[["캐시"]]
  API -->|"토큰 교환 + 프로필 조회"| Naver["네이버 OAuth"]
```

⚠️ FE 정적 파일과 사용자 업로드 이미지가 같은 S3 버킷을 쓴다 — 배포 시 동기화가 업로드물을 지우지 않도록 예외 처리한다(§5).

## 2. 기술 스택

| 영역 | 기술 | 버전 | 근거 |
|---|---|---|---|
| FE 프레임워크 | React | ^19.2.0 | `web/package.json` |
| FE 상태관리 | Redux Toolkit | ^2.11.0 | 〃 |
| FE 라우팅 | React Router DOM | ^7.10.1 | 〃 |
| FE 빌드 | Vite | ^7.2.4 | 〃 |
| FE 스타일 | Sass (SCSS modules) | ^1.97.1 | 〃 |
| BE 언어 | Java | 21 | `build.gradle` toolchain |
| BE 프레임워크 | Spring Boot | 3.3.2 | `build.gradle` |
| BE DB 접근 | MyBatis Spring Boot Starter | 3.0.3 | 〃 |
| BE 인증 | Spring Security + JJWT | 0.11.5 | 〃 |
| BE 변환 | MapStruct | 1.5.5.Final | 〃 |
| BE 캐시 | Caffeine (Spring Cache, `type=simple`) | — | `build.gradle` · `application.properties` |
| BE 문서화 | springdoc-openapi | 2.6.0 | `build.gradle` |
| DB | MariaDB | 10.5.29(운영 실측) | `mariadb-java-client:3.3.3` |
| 배포 | GitHub Actions | — | `.github/workflows/*.yml` |

## 3. 요청 흐름

FE 화면 → API 호출 → BE 계층 순서로 한 겹씩 내려간다.

1. **FE**: `web/src/domains/{도메인}/mobile/{도메인}Screen.jsx` → `hooks/use{도메인}List.js` → Redux thunk → `infra/http/client.js`(axios)
2. **API 경로**: `/api/{도메인 복수형}`(공개) · `/api/admin/{도메인 복수형}`(관리자) — kebab-case
3. **BE**: `{도메인}Controller` → `{도메인}ServiceImpl`(업무 흐름·트랜잭션) → `{도메인}Repository`(얇은 래퍼) → `{도메인}Mapper.xml`(SQL) → DB
4. 응답은 항상 `{ success, code, data }` 봉투로 포장한다(`GlobalResponseAdvice`)

상세 규칙: `.claude/rules/be/be-structure-map.md`(BE 패키지·주소 지도) · `.claude/rules/fe/fe-convention.md`(FE 폴더·라우트 등록).

## 4. 인증·보안

네이버 OAuth 단일 로그인 수단. Access·Refresh 토큰 모두 HttpOnly 쿠키(`ACCESS_TOKEN`/`REFRESH_TOKEN`) — `Authorization` 헤더 방식은 쓰지 않는다.

```mermaid
sequenceDiagram
    participant U as 사용자
    participant FE as 웹(React)
    participant N as 네이버
    participant BE as AuthController/AuthServiceImpl
    participant Filter as JwtAuthFilter
    participant DB as site_refresh_tokens

    U->>FE: 로그인 버튼 클릭
    FE->>N: 리다이렉트(client_id, redirect_uri, state)
    N->>U: 로그인·동의 화면
    U->>N: 로그인 승인
    N->>BE: GET /api/auth/naver/callback?code&state
    BE->>N: code로 access_token 교환
    BE->>N: GET /v1/nid/me
    BE->>BE: site_users 조회·생성
    BE->>BE: 서비스 JWT 발급(access) + refresh 발급(SHA-256 해시)
    BE->>DB: INSERT refresh token
    BE->>U: Set-Cookie ACCESS_TOKEN/REFRESH_TOKEN + 302 redirect
    U->>BE: GET /api/users/me
    Note over Filter: 이후 모든 요청은 JwtAuthFilter가 쿠키의 ACCESS_TOKEN을 검증해 userId를 세팅(STATELESS)
    BE-->>U: 로그인 상태 확정
    Note over U,BE: access 만료(401) 시 client.js가 /api/auth/refresh 1회 호출 후 원 요청 재시도
```

| 항목 | 로컬 | 운영 |
|---|---|---|
| access 토큰 수명 | 30분 | 60분 |
| refresh 토큰 수명 | 30일 | 30일 |
| 세션 정책 | STATELESS(서버 세션 없음) | 〃 |

권한 방어선: `/api/admin/**`만 `SecurityConfig`가 `hasRole("ADMIN")`으로 강제 차단하는 **유일한 자동 가드**다. 그 외 로그인 필요 API는 컨트롤러가 직접 `userId == null`을 확인한다. FE `AuthGuard`는 화면 진입을 먼저 걷어내는 UX 보조 장치일 뿐 최종 방어선이 아니다 — API를 직접 호출해도 서버가 막는다.

## 5. 배포 파이프라인

```mermaid
flowchart LR
  FEPush["master push: web/**"] -->|GitHub Actions| FEBuild["vite build + prerender"]
  FEBuild --> FEVerify["prerender 스냅샷 검증"]
  FEVerify --> S3Sync["S3 동기화(업로드물 제외)"]
  S3Sync --> CFInvalidate["CloudFront 무효화 + 전파 대기"]
  CFInvalidate --> FELive["배포 후 라이브 검증"]

  BEManual["Actions 탭 수동 실행<br/>(workflow_dispatch)"] --> BEBuild["gradle bootJar"]
  BEBuild --> BEVerify["jar 크기 검증"]
  BEVerify --> S3Upload["S3 아티팩트 업로드"]
  S3Upload --> SSM["AWS SSM 원격 배포"]
  SSM --> BERestart["systemctl restart + 기동 확인"]
```

| 환경 | FE | BE | DB |
|---|---|---|---|
| dev(로컬) | `npm start`(Vite dev, 3000) | `bootRun`(8080), `application.properties` | `.env.properties`로 접속, JWT access 30분 |
| prod | master push 시 자동 배포 | **수동**(workflow_dispatch만 — push 트리거는 비활성) | `application-prod.properties`, JWT access 60분 |

⚠️ **테스트 DB와 운영 DB가 같은 인스턴스다.** `sql/V3/`에 DDL을 작성하는 순간 운영에도 즉시 반영된다 — 스키마 변경 전에는 항상 사용자 확인이 먼저다.

## 6. 로컬 실행

BE `./gradlew bootRun`(8080) + FE `cd web && npm start`(3000). 상세 절차·환경변수 목록은 루트 [`SETTING.md`](../../SETTING.md) 참고.
