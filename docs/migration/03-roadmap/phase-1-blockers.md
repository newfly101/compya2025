# 1단계 — 선결 결함: 현행 앱에서 먼저 고친다

> 목표: 이관을 막는 결함과 보안 결함을 **지금 운영 중인 앱**에서 닫는다
> 닫는 결함: 🔴 [FE-05](../02-diagnosis/frontend/FE-05-browser-only-code.md) · [BE-01](../02-diagnosis/backend/BE-01-all-errors-500.md) · [BE-02](../02-diagnosis/backend/BE-02-expired-token-blocks-public-get.md) · [BE-03](../02-diagnosis/backend/BE-03-oauth-state-unchecked.md) · [BE-06](../02-diagnosis/backend/BE-06-notice-contract.md) / 🟠 [BE-05](../02-diagnosis/backend/BE-05-hardcoded-env.md) · [BE-04](../02-diagnosis/backend/BE-04-cookie-model.md)(수명 · SameSite) / 🟡 [FE-07](../02-diagnosis/frontend/FE-07-login-flag-policy-mismatch.md) · [FE-08](../02-diagnosis/frontend/FE-08-ad-gate-inconsistent.md) · [FE-09](../02-diagnosis/frontend/FE-09-dead-code-and-deps.md) · [BE-07](../02-diagnosis/backend/BE-07-response-shape.md)(403 코드) · [OPS-03](../02-diagnosis/ops/OPS-03-db-migration.md)
> 운영 영향: BE 배포 있음 — 인증 흐름 변경은 **로그인 → 갱신 → 로그아웃 → 탈퇴** 수동 확인 필수

---

## 1. 순서 (의존 관계 순)

| # | 결함 | 트랙 | 먼저인 이유 |
|---|---|---|---|
| 1-1 | BE-01 예외 매핑 + 테스트 틀 | BE | 이후 BE 수정의 테스트가 이 위에서 돈다 |
| 1-2 | BE-02 필터: 무효 토큰 = 익명 | BE | 공개 조회 안정화. BE-04 쿠키 수명과 한 PR |
| 1-3 | BE-04(부분) `ACCESS_TOKEN` maxAge · SameSite=Lax | BE | 1-2 와 같은 변경 묶음 |
| 1-4 | BE-05 환경값 설정화 | BE | 1-5 의 리다이렉트 주소가 설정값이어야 함 |
| 1-5 | BE-03 OAuth state + 로그인 시작 BE 이동 | BE + FE | 보안. FE `useAuthentication` 정리(FE-05 일부 동시 해소) |
| 1-6 | OPS-03 + BE-06 공지 slug 컬럼 · 요약/슬러그 API | ops + BE | 스키마 변경 → 적용 기록부터 |
| 1-7 | BE-06 FE 쪽: 서버 slug 사용, 슬러그 함수 삭제 | FE | 1-6 배포 후 |
| 1-8 | FE-05 모듈 최상위 · 렌더 중 브라우저 API | FE | 동작 변화 없는 리팩터 |
| 1-9 | FE-07 · FE-08 · FE-09 | FE | 한 줄~소규모. 이관 범위 축소 |
| 1-10 | BE-07 403 코드 · `Set-Cookie` 노출 제거 | BE | 작음 |

---

## 2. 배포 묶음

| 배포 | 포함 | 확인 |
|---|---|---|
| BE #1 | 1-1 ~ 1-4, 1-10 | 공개 API 전부 200, 만료 쿠키로 공개 API 200, 관리자 API 비인가 403 |
| BE #2 + FE #1 | 1-5 | 로컬 · 운영 로그인, 위조 콜백 401 |
| DB → BE #3 → FE #2 | 1-6, 1-7 | 기존 공지 주소 전부 열림(기준선 JSON 과 비교) |
| FE #3 | 1-8, 1-9 | 기준선 스크립트 재실행 — 차이 없음(FE-07 로그인 모달 제외) |

---

## 3. 완료 기준

- [ ] 위 10개 결함 md 의 완료 기준 전부 체크
- [ ] 기준선 스크립트 재실행 결과가 0단계 기준선과 같다(의도한 차이만 기록)
- [ ] `./gradlew test` 에 보안 · 예외 · OAuth 테스트 포함, CI 통과
