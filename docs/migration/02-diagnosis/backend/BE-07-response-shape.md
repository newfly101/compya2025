# BE-07 응답 형태 · 에러 코드 불일치

> 상태: 열림
> 심각도: 🟡 정리
> 닫히는 단계: 1단계(403 코드) ~ 4단계(도메인 이관 때마다) — [`phase-4`](../../03-roadmap/phase-4-page-migration.md)
> 관련: BE-01

## 현상
공통 응답 `GlobalResponse{success, code, data}` 가 있지만 컨트롤러마다 쓰는 법이 다르다. 이관 때 TypeScript 타입을 만들면 이 차이가 **타입 분기**로 드러난다.

## 근거
| 위치 | 내용 |
|---|---|
| `src/main/java/com/dawne/com2usbaseball/common/support/dto/GlobalResponse.java:5-20` | `record GlobalResponse<T>(boolean success, Enum<?> code, T data)` |
| `src/main/java/com/dawne/com2usbaseball/common/support/advice/GlobalResponseAdvice.java:20,35` | 감싸지 않은 응답을 `SUCCESS` 로 자동 포장 |
| 커뮤니티 컨트롤러 전부, `StatisticsController` | 원시 DTO 반환 → 항상 일반 `SUCCESS` 코드(도메인 코드 없음) |
| 목록 응답 | 어떤 곳은 `ListResponse{items}`, 어떤 곳은 `List` 그대로 |
| `src/main/java/com/dawne/com2usbaseball/config/SecurityConfig.java:119` | 권한 부족(403)에 `AUTH_USER_BLOCKED`(정지 회원) 코드를 씀 — 의미가 다름 |
| `src/main/java/com/dawne/com2usbaseball/config/CorsConfig.java` | 노출 헤더에 `Set-Cookie` — 브라우저가 절대 노출하지 않는 헤더라 효과 없음 |

## 영향
- FE 는 응답마다 `data.items` 인지 `data` 인지 기억해야 한다. 이관 때 API 클라이언트 타입이 도메인별 예외투성이가 된다.
- 403 이 "정지 회원" 으로 보이면 FE 가 잘못된 안내 문구를 띄운다.

## 해결 방향
1. **1단계**: 403 전용 코드(`AUTH_FORBIDDEN`) 추가. `Set-Cookie` 노출 설정 제거.
2. **규칙 확정**(`docs/convention/backend.md` 에 한 줄 추가): 모든 컨트롤러는 `GlobalResponse` 를 명시 반환, 목록은 항상 `ListResponse{items}`(페이지네이션 시 `{items, page, size, total}`).
3. **4단계**: 도메인을 이관할 때 그 도메인의 응답을 규칙에 맞추고, FE 타입을 `GlobalResponse<ListResponse<CouponResponse>>` 처럼 하나의 제네릭으로 쓴다. 한 번에 전부 바꾸지 않는다 — 이관하는 도메인만.
4. 가능하면 springdoc 이 만든 OpenAPI 문서로 FE 타입을 생성(`openapi-typescript`)해 계약 불일치를 빌드에서 잡는다(선택).

## 완료 기준
- [ ] 권한 부족 응답 코드가 `AUTH_FORBIDDEN`
- [ ] 이관 완료된 도메인의 컨트롤러가 전부 `GlobalResponse` 명시 반환
- [ ] FE `types/api.ts` 에 도메인별 예외 분기 0건
