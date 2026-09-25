# BE-01 처리 못 한 예외가 전부 500

> 상태: 열림
> 심각도: 🔴 이관 차단
> 닫히는 단계: 1단계 — [`phase-1`](../../03-roadmap/phase-1-blockers.md)
> 관련: BE-07

## 현상
직접 던진 `BaseException` 외의 예외는 모두 **500 `INTERNAL_SERVER_ERROR`** 로 응답한다. 잘못된 파라미터 타입, 필수 파라미터 누락, 깨진 JSON, `@Valid` 검증 실패처럼 **클라이언트 잘못(4xx)** 도 서버 장애처럼 보인다.

## 근거
| 위치 | 내용 |
|---|---|
| `src/main/java/com/dawne/com2usbaseball/common/support/advice/GlobalExceptionHandler.java:15` | `BaseException` → 예외에 담긴 상태 코드 |
| `src/main/java/com/dawne/com2usbaseball/common/support/advice/GlobalExceptionHandler.java:23` | 그 밖의 `Exception` → 500 |
| 예: `GET /api/notices/abc` | 경로 변수 타입 불일치(`MethodArgumentTypeMismatchException`) → 500 |
| 대조: `src/main/java/com/dawne/com2usbaseball/domain/notice/repository/NoticeRepository.java:23-28` | 없는 공지는 `BaseException` 으로 404 — **직접 챙긴 곳만** 올바르다 |

## 영향
- **이관**: 빌드(서버 컴포넌트)가 API 응답으로 "이 페이지는 없다(`notFound()`)" 와 "API 가 죽었다(빌드 실패)" 를 구분해야 한다. 500 이 섞이면 둘 다 빌드 실패로 처리하거나, 둘 다 무시하는 수밖에 없다.
- **운영**: 모니터링에서 500 이 사용자 입력 실수와 진짜 장애를 섞어 버린다. 로그도 전부 `log.error` 스택 트레이스로 남는다.
- **보안**: 500 응답과 스택 로그 폭증은 공격 탐지를 어렵게 한다.

## 해결 방향
`GlobalExceptionHandler` 에 Spring MVC 표준 예외를 4xx 로 매핑한다. `ResponseEntityExceptionHandler` 를 상속하면 한 번에 처리된다.

| 예외 | 상태 | 코드(추가할 `CommonMessages`) |
|---|---|---|
| `MethodArgumentNotValidException`, `HandlerMethodValidationException` | 400 | `INVALID_INPUT` |
| `MethodArgumentTypeMismatchException`, `MissingServletRequestParameterException`, `HttpMessageNotReadableException` | 400 | `INVALID_INPUT` |
| `NoResourceFoundException` | 404 | `NOT_FOUND` |
| `HttpRequestMethodNotSupportedException` | 405 | `METHOD_NOT_ALLOWED` |
| `AccessDeniedException`(메서드 보안) | 403 | `FORBIDDEN` — [BE-07](./BE-07-response-shape.md) 과 함께 |

로그 레벨도 4xx 는 `warn`, 5xx 만 `error`.

## 완료 기준
- [ ] `curl -s -o /dev/null -w "%{http_code}" https://api.compyafun.com/api/notices/abc` → 400
- [ ] 없는 경로 `/api/nope` → 404
- [ ] 위 두 요청이 `error` 레벨 로그를 남기지 않는다
- [ ] 예외 매핑 단위 테스트(`@WebMvcTest`) 추가 — [OPS-04](../ops/OPS-04-test-gap.md)
