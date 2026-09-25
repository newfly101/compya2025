# BE-05 환경별 값 하드코딩

> 상태: 열림
> 심각도: 🟠 이관 중 해결
> 닫히는 단계: 1단계 — [`phase-1`](../../03-roadmap/phase-1-blockers.md)
> 관련: BE-03, BE-04, FE-03

## 현상
로컬 · 운영을 가르는 값이 코드 상수로 박혀 있다. 이관하면 **Next 개발 서버 주소(로컬), 미리보기 배포 주소, `www`** 처럼 새 출처(origin)가 생기는데, 그때마다 BE 코드를 고치고 재배포해야 한다.

## 근거
| 값 | 위치 | 지금 |
|---|---|---|
| CORS 허용 출처 | `src/main/java/com/dawne/com2usbaseball/config/CorsConfig.java:19` | `http://localhost:3000`, `https://compyafun.com` — `www` · 미리보기 없음 |
| 로그인 후 이동 주소 | `src/main/java/com/dawne/com2usbaseball/security/provider/AuthRedirectProvider.java:13-14` | `localhost:3000/auth/callback` 또는 `compyafun.com/auth/callback` |
| 쿠키 도메인 | `src/main/java/com/dawne/com2usbaseball/security/cookie/AuthCookieFactory.java:70` | `.compyafun.com` |
| Swagger 서버 | `src/main/java/com/dawne/com2usbaseball/config/SwaggerConfig.java:34` | `http://localhost:8080` |
| (FE) API 주소 | `web/src/config/env.js:4-6` | `import.meta.env.PROD` 로 두 값 중 선택. `.env` 없음 |
| (FE) 네이버 client id · redirect URI | `web/src/domains/authentication/hooks/useAuthentication.js:5-9` | 코드 상수 |
| (FE) 쿠폰 링크 | `web/src/config/env.js:8` | `http://` (비암호화) |
| (FE) 빌드 스크립트 | `web/scripts/notice-source.mjs:9` | 운영 API 주소 상수 |

비밀값(DB · JWT · AWS · 네이버 secret)은 이미 `${ENV}` 로 분리돼 있다. 문제는 **비밀이 아닌 환경값**이다.

## 영향
- prerender 가 `localhost:3000` 에 묶인 이유가 CORS 상수다([FE-03](../frontend/FE-03-prerender-fragility.md)).
- `www.compyafun.com` 에서 API 를 부르면 CORS 로 막힌다(지금은 CloudFront 가 www 를 apex 로 301 하므로 가려져 있음).

## 해결 방향
| BE | FE |
|---|---|
| `app.cors.allowed-origins` (쉼표 목록) | `NEXT_PUBLIC_API_BASE_URL` |
| `app.auth.post-login-redirect` | `NEXT_PUBLIC_SITE_URL` (canonical · sitemap 기준) |
| `app.auth.cookie-domain`, `app.auth.cookie-secure` | 네이버 설정은 FE 에서 제거(BE-03) |
| `springdoc` 서버 URL 을 설정값으로 | `.env.example` 커밋, 실제 `.env*` 는 gitignore |

`@ConfigurationProperties` 로 묶어 기동 시 검증한다(빈 값이면 기동 실패).

## 완료 기준
- [ ] `grep -rn "compyafun.com\|localhost:3000" src/main/java` 결과 0건
- [ ] FE `web/src` 에서 API 주소 · 사이트 주소 상수 0건(환경변수 참조만)
- [ ] `.env.example`(FE) · `application-example.properties`(BE)에 키 목록과 설명
