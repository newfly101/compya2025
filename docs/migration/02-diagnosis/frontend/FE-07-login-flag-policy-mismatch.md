# FE-07 정책과 어긋난 「로그인 필요」 표시

> 상태: 열림
> 심각도: 🟡 정리
> 닫히는 단계: 1단계 — [`phase-1`](../../03-roadmap/phase-1-blockers.md)
> 관련: Notion 「서비스 정책」 2장

## 현상
정책은 "조회 화면은 전부 공개" 로 정해졌다(2026-09-10). 그런데 확률 공시 메뉴와 홈 바로가기에는 아직 `loginRequired` 가 붙어 있어, 비로그인 사용자가 **메뉴로 들어가면 막히고 주소를 치면 열린다.**

## 근거
| 위치 | 내용 |
|---|---|
| `web/src/app/wrapper/mobile/config/MENU_GROUPS.js:24` | `{ label: '확률 공시', to: '/probability', loginRequired: true }` |
| `web/src/domains/home/config/QUICK_MENUS.js:13` | 같은 경로 `loginRequired: true` |
| `web/src/app/router/routes/PublicRoutes.jsx` | `/probability` 에 가드 없음. prerender 대상이고 sitemap 에도 있다 |

⚠️ Notion 「서비스 정책」 은 선수 백과사전도 같은 상태라고 적고 있으나, 기준 커밋에서 선수 백과사전의 플래그는 이미 빠져 있다. 남은 것은 확률 공시 두 곳이다 → [OPS-01](../ops/OPS-01-docs-drift.md).

## 영향
- 광고 심사 · 검색 입장에서는 공개 페이지인데, 사용자는 로그인 모달을 본다. 신뢰와 유입 모두 손해다.
- 이관 때 이 플래그를 그대로 옮기면 정책 불일치도 같이 옮겨진다.

## 해결 방향
정책에 코드를 맞춘다: 두 줄에서 `loginRequired: true` 를 지운다. `loginRequired` 기능 자체(모달 표시)는 퀴즈 참여처럼 실제 로그인이 필요한 곳을 위해 남긴다.

## 완료 기준
- [ ] `grep -rn "loginRequired: true" web/src` 결과에 `/probability` 없음
- [ ] 비로그인 상태로 메뉴 → 확률 공시 진입 시 모달 없이 열린다
- [ ] Notion 「서비스 정책」 화면별 공개 범위 표의 확률 공시 행을 「일치」 로 갱신
