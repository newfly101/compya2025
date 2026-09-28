---
adr: 0008
title: 전역 예외 처리기의 마지막 그물이 표준 예외를 전부 500으로 뭉개던 것을 갈랐다
status: accepted
date: 2026-09-28
created: 2026-09-28
updated: 2026-09-28
scope: src/main/java/**/common/support/advice/**
related: rules/be/be-convention.md § 5
---

# 0008 스프링 표준 예외를 상태 코드별로 분리한다

## 배경

없는 주소로 들어가거나, 요청 형식이 잘못됐거나, 허용되지 않은 방식·형식으로 호출하거나, 5MB 넘는 이미지를 올리면 전부 "서버 오류"(500) 하나로 응답되고 있었다. 이용자가 오타 난 주소(`/api/zzz-does-not-exist`)로 들어가면 "그런 주소 없음"(404)이 아니라 "서버 오류"가 떴고, 관리자가 5MB 넘는 이미지를 올리면 이미 준비돼 있던 "5MB 이하만 가능합니다" 안내 대신 "서버 오류"가 떴다 — 안내 문구는 있었지만 실행 흐름이 거기 닿지 못했다.

## 원인

`GlobalExceptionHandler.java` 의 마지막 그물 `@ExceptionHandler(Exception.class)` 이, 스프링 표준 예외 7종(`NoResourceFoundException`·`HttpMessageNotReadableException`·`MethodArgumentTypeMismatchException`·`MissingServletRequestParameterException`·`HttpRequestMethodNotSupportedException`·`HttpMediaTypeNotSupportedException`·`MaxUploadSizeExceededException`)을 앞에 구체 핸들러가 없어 전부 삼켜 500 으로 내려보내고 있었다. 도메인 예외(`BaseException`, 99곳)는 이 문제가 없다 — 호출부가 지정한 상태 코드를 정확히 반환한다.

## 결정

`Exception.class` 마지막 그물은 최후 방어선으로 그대로 두고, 그 **앞에 구체 타입 핸들러 5개**를 추가해 스프링 표준 예외를 원래 상태 코드로 분리한다.

| 예외 | 상태 | 의미 |
|---|---|---|
| `NoResourceFoundException` | 404 | 없는 주소 |
| `HttpMessageNotReadableException` / `MethodArgumentTypeMismatchException` / `MissingServletRequestParameterException` (3종 묶음) | 400 | 깨진 JSON · 타입 불일치 · 필수값 누락 |
| `HttpRequestMethodNotSupportedException` | 405 | 허용 안 된 방식 |
| `HttpMediaTypeNotSupportedException` | 415 | 지원 안 하는 형식 |
| `MaxUploadSizeExceededException` | 400 | 용량 초과 — 기존 `UploadMessages.UPLOAD_FILE_TOO_LARGE` 안내 문구 재사용 |

새 핸들러 5개는 전부 `Exception.class` 보다 구체적인 타입이라 항상 먼저 매칭되고, 기존 catch-all 의 동작 범위(정말 미확인인 예외)는 그대로 유지된다. 부수적으로 이미지 업로드 S3 저장 실패 catch 블록 2곳에도 `log.error("S3 업로드 실패 key={}", key, e)` 로그를 추가했다 — 원인이 로그에 한 줄도 안 남던 문제였다.

## 왜 (대안과 비교)

| 대안 | 문제 | 판정 |
|---|---|---|
| 405·415 를 400 한 갈래로 묶어 처리한다 | 상태코드는 각자 뜻이 있다. "전부 500" 이 문제였는데 "전부 400" 으로 바꾸면 같은 종류의 뭉개기를 규모만 줄여 반복하는 셈이다 | 기각 |
| `extends ResponseEntityExceptionHandler` 로 전체를 오버라이드 | 응답 바디 모양(`GlobalResponse` 봉투)을 다시 맞춰야 해서 diff 가 더 커진다 | 기각 — 구체 핸들러 5개 추가가 더 짧다 |
| catch-all 을 아예 없앤다 | 정말 예상 못 한 예외의 마지막 방어선이 사라진다 | 기각 |

## 함께 해소된 관련 문제 — 403 오분류

권한 부족(403)과 계정 정지가 같은 오류 코드 `AUTH_USER_BLOCKED` 를 쓰고 있어 화면에서 둘을 구분할 수 없었다. `AuthMessages` 에 `AUTH_FORBIDDEN` 을 신설해 권한 부족 전용 코드로 분리했다(커밋 `589570a7`). FE `client.js` 도 경로(`/admin`)로 우회 판별하던 방식을 코드값(`AUTH_FORBIDDEN`/`AUTH_USER_BLOCKED`/`AUTH_UNAUTHORIZED`) 판별로 교체했다(커밋 `af38fa87`).

## 영향받는 곳

- `common/support/advice/GlobalExceptionHandler.java` — 핸들러 5개 추가 (커밋 `8b697772`)
- `domain/upload/service/UploadServiceImpl.java` — S3 실패 로깅 2곳 추가
- `rules/be/be-convention.md` § 5 — "새 예외를 catch-all 에 떨어뜨리지 말고 전용 핸들러를 둔다" 규칙의 근거
- FE `web/src/infra/http/client.js` — 서버 오류 코드 문자열을 그대로 들고 있어, 코드값이 바뀌면 동반 배포 필요(0002 관측 사례와 동일 성격)

## 아직 미정인 것 (❓)

- `ConstraintViolationException` 핸들러(사문 — `@Validated` 가 코드에 0곳이라 한 번도 발화하지 않음) 를 삭제할지, 주석만 "현재 미사용"으로 정정할지
- `*_NOT_FOUND` 인데 400 으로 던지는 곳 1곳(`CacheSyncServiceImpl.java:127`, `CACHE_SYNC_TARGET_NOT_FOUND`) — 다른 39곳과 맞춰 404로 통일할지, 코드 이름 자체를 `_INVALID` 로 바꿀지
- OAuth 콜백 실패가 JSON 그대로 브라우저 주소창에 노출되는 문제(`AuthController.java:59`) — 이번 라운드 범위 밖, 리다이렉트 방식으로 감싸는 안이 제안만 된 상태
- 같은 조사에서 함께 나온 별개 사안 — 모든 요청의 IP·국가·UA 를 보존기간·로테이션 설정 없이 콘솔에 상시 기록 중(`AccessLogFilter`). 예외 상태코드 문제와는 무관하지만, 개인정보 보존기간은 코드가 정할 수 없는 승인 사안이라 여기 남긴다
