# BE-08 캐시 설정과 문서의 괴리

> 상태: 열림
> 심각도: 🟡 정리
> 닫히는 단계: 5단계 — [`phase-5`](../../03-roadmap/phase-5-seo-parity.md)
> 관련: OPS-01

## 현상
문서(Notion 「기술 기록」)는 "Caffeine 캐시 · 3중 캐시" 라고 적지만, 실제 설정은 **TTL 도 크기 제한도 없는 메모리 맵**이다. HTTP 캐시 헤더는 게임 데이터 5개 컨트롤러에만 있다.

## 근거
| 위치 | 내용 |
|---|---|
| `src/main/resources/application.properties:76` | `spring.cache.type=simple` → `ConcurrentMapCacheManager` |
| `build.gradle:46` | `caffeine` 의존성은 있으나 설정 · `CaffeineCacheManager` 없음 |
| 게임 데이터 5개 컨트롤러 (예: `src/main/java/com/dawne/com2usbaseball/domain/fun/historyMode/controller/FunHistoryModeController.java`) | `@Cacheable` + ETag + `Cache-Control: public, max-age=3600` |
| 공지 · 쿠폰 · 이벤트 · 퀴즈 | 서버 `@Cacheable` 만, HTTP 캐시 헤더 없음 |
| `src/main/java/com/dawne/com2usbaseball/domain/admin/controller/CacheSyncController.java` | 관리자가 캐시를 수동으로 비우는 API(대상 10개) |

## 영향
- 메모리 사용량이 데이터 크기만큼 계속 커진다(현재 데이터 규모에서는 문제 없음 — 선수 카드 11,668건 수준).
- 문서를 믿고 "Caffeine TTL 로 자동 만료된다" 고 가정하면 운영 판단이 틀린다.
- **이관 관점**: Next 빌드는 API 를 한 번에 많이 부른다. 공지 · 쿠폰 · 이벤트에 ETag 가 없으면 매 빌드가 전체 본문을 다시 받는다.

## 해결 방향
| 선택 | 판단 |
|---|---|
| Caffeine 을 실제로 설정(`spring.cache.type=caffeine`, `maximumSize`, `expireAfterWrite`) | 권장 — 의존성이 이미 있고 설정 3줄 |
| Caffeine 의존성 제거하고 문서를 "simple" 로 정정 | 차선 — 지금 규모면 충분하지만 문서 정정은 필수 |

그리고 공지 요약 · 쿠폰 · 이벤트 목록에 ETag(`ShallowEtagHeaderFilter` 또는 기존 패턴 재사용)를 붙인다. 캐시 무효화는 지금처럼 어드민 변경 시 `@CacheEvict` 를 유지한다.

## 완료 기준
- [ ] 설정과 Notion 「기술 기록」 2.5 · 4-(e) 서술이 일치
- [ ] `curl -sI /api/coupons` 응답에 `ETag`
