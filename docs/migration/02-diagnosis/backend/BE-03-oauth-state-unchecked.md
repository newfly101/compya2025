# BE-03 OAuth `state` 미검증 (로그인 CSRF)

> 상태: 열림
> 심각도: 🔴 이관 차단 (보안 — 이관과 무관하게 먼저)
> 닫히는 단계: 1단계 — [`phase-1`](../../03-roadmap/phase-1-blockers.md)
> 관련: BE-05

## 현상
네이버 로그인에서 `state` 값을 만들기는 하지만 **어디에도 저장하지 않고 아무도 확인하지 않는다.** `state` 는 "이 로그인 콜백이 우리 사이트가 시작한 로그인의 결과인가" 를 확인하는 장치다.

## 근거
| 위치 | 내용 |
|---|---|
| `web/src/domains/authentication/hooks/useAuthentication.js:26` | `state = crypto.randomUUID()` — 저장하지 않음 |
| `src/main/java/com/dawne/com2usbaseball/domain/oauth/controller/AuthController.java:36-41` | 콜백에서 `state` 를 받아 그대로 서비스로 전달 |
| `src/main/java/com/dawne/com2usbaseball/domain/oauth/service/support/NaverOAuthService.java:46-55` | 네이버 토큰 요청 본문에 `state` 를 넣을 뿐 비교하지 않음 |

## 영향
공격자가 **자기 네이버 계정의 인가 코드**가 담긴 콜백 링크를 피해자에게 열게 하면, 피해자 브라우저에 공격자 계정으로 로그인된 쿠키가 심긴다(login CSRF). 피해자가 그 상태로 남긴 글 · 퀴즈 기록 · 프로필 변경은 공격자 계정에 쌓인다.

## 해결 방향
콜백을 **BE 가 받으므로 BE 가 검증**한다.

1. 로그인 시작을 BE 엔드포인트로 옮긴다: `GET /api/auth/naver/authorize?redirect=/probability`
   - 무작위 `state` 생성 → **HttpOnly · SameSite=Lax · 5분 수명 쿠키**(`OAUTH_STATE`, path `/api/auth`)에 저장
   - 네이버 인가 URL 로 302
2. 콜백에서 쿼리의 `state` 와 쿠키 값을 비교 → 다르면 401, 같으면 쿠키 삭제 후 진행
3. 로그인 후 돌아갈 경로(`redirect`)도 같은 쿠키에 담아, FE 의 `sessionStorage.redirectPath` 를 없앤다. 값은 **사이트 내부 경로만 허용**(`/` 로 시작, `//` 금지)해 오픈 리다이렉트를 막는다.
4. 네이버 client id · redirect URI 를 FE 코드에서 제거(BE 설정으로 이동) → [BE-05](./BE-05-hardcoded-env.md)

## 완료 기준
- [ ] `state` 쿠키 없이 콜백 URL 을 직접 호출하면 401
- [ ] 정상 로그인 흐름이 로컬 · 운영에서 동작
- [ ] `web/src` 에서 `NAVER_CLIENT_ID` · `crypto.randomUUID`(로그인 용도) 0건
- [ ] 콜백 검증 단위 테스트(일치 · 불일치 · 쿠키 없음)
