# BE-04 인증 쿠키 설정이 SSR 과 맞지 않음

> 상태: 열림
> 심각도: 🟠 이관 중 해결 (정적 export 단계에서는 영향 작음, 7단계 전 필수)
> 닫히는 단계: 1단계(수명 · SameSite) + 7단계(서버 렌더 인증) — [`phase-7`](../../03-roadmap/phase-7-runtime-optional.md)
> 관련: BE-02, BE-05

## 현상
인증은 HttpOnly 쿠키 두 개로 한다. 방향은 옳지만 속성 몇 개가 **"브라우저가 API 도메인만 부른다"** 는 가정에 맞춰져 있다.

## 근거
| 쿠키 | 위치 | 속성 | 문제 |
|---|---|---|---|
| `ACCESS_TOKEN` | `src/main/java/com/dawne/com2usbaseball/security/cookie/AuthCookieFactory.java:18-25` | path `/`, **maxAge 없음**(세션 쿠키) | JWT 는 30분인데 쿠키는 브라우저를 닫을 때까지 남음 → 만료 토큰이 계속 전송됨([BE-02](./BE-02-expired-token-blocks-public-get.md)) |
| `REFRESH_TOKEN` | 같은 파일 `:37-45` | path `/api/auth`, 30일 | path 가 **API 경로**라 `compyafun.com` 의 서버(7단계 Next 서버)에는 전송되지 않음 → 서버 측 갱신 불가 |
| 공통(운영) | 같은 파일 `:67-70` | `Secure`, **`SameSite=None`**, `Domain=.compyafun.com`(하드코딩) | `compyafun.com` 과 `api.compyafun.com` 은 **같은 사이트(same-site)** 라 `Lax` 로 충분. `None` 은 다른 사이트에서의 요청에도 쿠키를 실어 CSRF 노출면을 넓힌다(CSRF 보호는 꺼져 있음, `SecurityConfig.java:44`) |
| 공통(로컬) | 같은 파일 `:61-65` | 서버 이름이 localhost 면 `Secure=false`, `Lax`, domain 없음 | 판정을 요청 호스트로 함 → 설정값으로 바꾸는 게 명확 |

## 영향
- **정적 export(1~6단계)**: 브라우저가 API 를 직접 부르는 구조는 그대로라 기능상 문제는 BE-02 뿐이다.
- **SSR(7단계)**: Next 서버가 사용자 요청의 쿠키를 받아 API 로 전달하려면 ① 쿠키가 `compyafun.com` 요청에도 실려야 하고(Domain `.compyafun.com` 은 충족) ② refresh 가 서버에서도 가능해야 한다(path 때문에 불가).

## 해결 방향
| 단계 | 변경 | 이유 |
|---|---|---|
| 1단계 | `ACCESS_TOKEN` 에 `maxAge` = JWT 수명 | 만료 토큰 전송 제거 |
| 1단계 | 운영 `SameSite=Lax` | 같은 사이트 구조에서 충분, CSRF 노출면 축소 |
| 1단계 | 쿠키 domain · secure 를 `application-*.properties` 로 | 환경 판정을 설정으로 |
| 7단계 | 서버 렌더 인증 방식 결정 — 아래 표 | |

7단계 선택지:

| 선택 | 방법 | 판단 |
|---|---|---|
| A. 서버에서 인증 안 함 | 로그인 상태가 필요한 부분은 계속 클라이언트 렌더 | 공개 페이지 위주면 가장 단순. **1순위** |
| B. Next 서버가 쿠키 전달 | `cookies()` 로 `ACCESS_TOKEN` 을 읽어 API 호출 헤더에 붙임. refresh path 를 `/` 로 넓히거나, refresh 는 클라이언트만 담당 | 개인화 페이지를 서버 렌더할 때 |
| C. BFF | Next Route Handler 가 인증을 대행 | 이 규모에선 과함 |

## 완료 기준
- [ ] 1단계: 로그인 후 응답의 `Set-Cookie` 에 `Max-Age=1800`(ACCESS), `SameSite=Lax`
- [ ] 1단계: 로그인 · 갱신 · 로그아웃 · 탈퇴가 운영에서 동작
- [ ] 7단계 진입 시 A/B 중 선택을 이 문서 하단에 기록
