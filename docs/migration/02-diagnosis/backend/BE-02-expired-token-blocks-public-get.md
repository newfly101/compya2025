# BE-02 만료 토큰이면 공개 조회도 401

> 상태: 열림
> 심각도: 🔴 이관 차단
> 닫히는 단계: 1단계 — [`phase-1`](../../03-roadmap/phase-1-blockers.md)
> 관련: BE-04

## 현상
`/api/**` 는 공개(permitAll)인데, 요청에 **만료되었거나 잘못된 `ACCESS_TOKEN` 쿠키**가 붙어 있으면 JWT 필터가 곧바로 401 을 돌려준다. 로그인했던 사용자가 30분 뒤 쿠폰 목록을 열면 비로그인 사용자보다 먼저 실패한다.

## 근거
| 위치 | 내용 |
|---|---|
| `src/main/java/com/dawne/com2usbaseball/security/filter/JwtAuthFilter.java:52-60` | 토큰 파싱 실패 시 `SC_UNAUTHORIZED` 를 직접 쓰고 필터 체인 중단 |
| `src/main/java/com/dawne/com2usbaseball/security/cookie/AuthCookieFactory.java:18-25` | `ACCESS_TOKEN` 쿠키에 `maxAge` 없음 → 브라우저 세션 동안 유지. JWT 수명은 30분 |
| `src/main/java/com/dawne/com2usbaseball/config/SecurityConfig.java:55-68` | `/api/**` permitAll |
| `web/src/infra/http/client.js:64-99` | 401 이면 `/auth/refresh` 후 재시도 — 클라이언트가 이 결함을 가리고 있다 |

## 영향
- **지금**: 클라이언트 인터셉터가 refresh → 재시도로 덮어 준다. 대신 공개 조회마다 요청이 두세 번 나가고, refresh 토큰까지 만료된 사용자는 공개 페이지에서도 에러 문구를 본다.
- **이관**: 정적 export 의 hydrate 후 재조회, 7단계 SSR 의 쿠키 전달 모두 이 동작에 걸린다. 서버 렌더에서 사용자의 낡은 쿠키를 API 로 넘기는 순간 **공개 페이지 렌더가 401 로 실패**한다.

## 해결 방향
"인증이 **필요한** 곳에서만 인증 실패를 말한다" 로 바꾼다.

1. 필터는 토큰이 유효하지 않으면 **인증 정보 없이 체인을 계속 진행**한다(익명 요청으로 취급). 401 판정은 인가 단계(`authenticated()`, `hasRole`, 컨트롤러의 `userId == null` 확인)가 한다.
2. 만료 토큰과 위조 토큰을 구분해 로그만 다르게 남긴다(만료 → debug, 서명 불일치 → warn).
3. 클라이언트가 "토큰 만료" 를 알 수 있도록, 인증이 필요한 엔드포인트의 401 응답 코드는 `AUTH_TOKEN_EXPIRED` 처럼 구분한다.
4. `ACCESS_TOKEN` 쿠키 `maxAge` 를 JWT 수명과 맞춘다 → [BE-04](./BE-04-cookie-model.md).

## 완료 기준
- [ ] 만료 JWT 쿠키를 붙인 `GET /api/coupons` → 200
- [ ] 같은 쿠키로 `GET /api/users/me` → 401
- [ ] 필터 단위 테스트: 유효 · 만료 · 위조 · 없음 네 경우
