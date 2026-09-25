# FE-09 죽은 코드 · 미사용 의존성 · 잘못된 설정

> 상태: 열림
> 심각도: 🟡 정리
> 닫히는 단계: 1단계 — [`phase-1`](../../03-roadmap/phase-1-blockers.md)

## 현상
이관 대상 코드에 **옮길 필요가 없는 것**이 섞여 있다. 먼저 걷어내야 이관 범위가 정확해진다.

## 근거
| 분류 | 위치 | 내용 |
|---|---|---|
| 미사용 의존성 | `web/package.json` | `crypto-js` · `redux` · `redux-thunk` · `swiper` — `src/` 어디서도 import 안 함 |
| 설치만 된 도구 | `babel-plugin-react-compiler` | `vite.config.js` 에 babel 플러그인 설정 없음 → 적용 안 됨 |
| 잘못된 설정 | `web/vite.config.js:11` | `server.historyApiFallback: true` — Vite 에 없는 옵션 |
| 미사용 런타임 설정 | `web/public/runtime-config.js` (`index.html:48` 에서 로드) | `window.__CONFIG__` 를 설정하지만 읽는 곳 없음 |
| 죽은 파일 | `web/src/data/community/*.js`, `global/ui/badge/LabelBadge.jsx`, `global/ui/guideModal/GuideModal.jsx`, `app/wrapper/mobile/hooks/useAdminTopBar.js`, `community/page/admin/AdminCommunityPage.jsx`, `home/config/MOCK_QUIZ.js` 외 | import 하는 곳 없음(읽기 전용 조사 기준) |
| 깨진 링크 | `community/feature/hooks/user/post/useUserPost.js:23` | `/community/posts/:id` 로 이동 — 라우트 없음 → 404 |
| 이름 없는 메뉴 경로 | `MENU_GROUPS.js` · `QUICK_MENUS.js` | 문자열 경로와 `ROUTE_PATHS` 상수 혼용. `/skill`(준비중)은 라우트 없음 |

## 영향
- 이관 범위가 부풀고, 죽은 파일 안의 브라우저 API 가 [FE-05](./FE-05-browser-only-code.md) 조사에 잡음을 만든다.
- 번들 크기와 `npm audit` 대상이 늘어난다.

## 해결 방향
1. 미사용 의존성 제거, `historyApiFallback` · `runtime-config.js` 제거.
2. React Compiler 는 **설정하거나 지우거나** 둘 중 하나로 정한다. 이관 후 Next 는 `reactCompiler` 옵션을 제공하므로, 지금은 지우고 이관 후 재평가를 권장.
3. 죽은 파일은 삭제 PR 을 따로 만든다(한 PR 에 한 도메인). 커뮤니티 목업 파일은 Notion 「기술 기록」 부채 표의 항목과 함께 닫는다.
4. 깨진 링크는 커뮤니티 상세 라우트가 생길 때까지 링크를 비활성화한다.
5. 메뉴 경로는 `ROUTE_PATHS` 로 통일한다(이관 때 타입으로 강제하기 쉬워진다).

## 완료 기준
- [ ] `npx depcheck`(또는 수동 grep)에서 미사용 의존성 0건
- [ ] `npm run build:fast` 성공, 주요 화면 수동 확인
- [ ] 커뮤니티 목록에서 글 클릭 시 404 로 가지 않는다
