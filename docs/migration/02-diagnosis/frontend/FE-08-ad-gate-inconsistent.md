# FE-08 광고 게이트 검사 누락

> 상태: 열림
> 심각도: 🟡 정리
> 닫히는 단계: 1단계 — [`phase-1`](../../03-roadmap/phase-1-blockers.md)
> 관련: `docs/convention/adsense.md`

## 현상
광고는 `ADS_ENABLED` 로 승인 전후를 가르기로 했다. 그런데 `<AdSlot>` 을 쓰는 8개 화면 중 **3개만** 이 플래그를 확인한다.

## 근거
| 위치 | 내용 |
|---|---|
| `web/src/infra/ads/adConfig.js:9` | `ADS_ENABLED = false`, 슬롯 ID 는 전부 `TODO_*` |
| `ADS_ENABLED` 를 확인하는 화면 | `LegendStatsScreen` · `PlayerEncyclopediaScreen` · `PlayerSkillScreen` |
| 확인 없이 `<AdSlot>` 렌더 | `HomeScreen.jsx` · `CouponScreen.jsx` · `EventScreen.jsx` · `NoticeScreen.jsx` · `GuideDetailScreen.jsx` |
| `web/src/infra/ads/AdSlot.jsx` | 운영 빌드에서 `<ins class="adsbygoogle">` 를 렌더하고, `window.adsbygoogle` 이 있을 때만 push |

## 영향
- 지금은 로더 스크립트가 주석이라 광고가 뜨지 않는다. 하지만 **빈 `<ins>` 자리**가 DOM 에 남고, 승인 후 로더를 켜는 순간 게이트를 안 거친 화면에도 광고가 붙는다 — 규칙(`adsense.md`)과 다른 배치가 생긴다.

## 해결 방향
게이트를 **각 화면이 아니라 `AdSlot` 한 곳**에서 확인한다: `if (!ADS_ENABLED) return null;`. 화면 쪽 중복 검사는 지운다. 이관 후에도 `AdSlot` 은 클라이언트 컴포넌트(`"use client"`)로 두고 마운트 후에만 push 한다.

## 완료 기준
- [ ] `AdSlot.jsx` 첫 줄에서 `ADS_ENABLED` 확인
- [ ] `ADS_ENABLED=false` 빌드의 HTML 에 `adsbygoogle` 문자열 0건
