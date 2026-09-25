# FE-03 prerender 파이프라인 취약성

> 상태: 열림
> 심각도: 🟠 이관 중 해결
> 닫히는 단계: 6단계 — [`phase-6`](../../03-roadmap/phase-6-cutover.md) (스크립트 삭제)
> 관련: BE-05, BE-06

## 현상
스냅샷이 "데이터까지 렌더된 상태" 인지를 CSS 셀렉터로 추측한다. 추측이 틀리면 **빈 표가 담긴 스냅샷이 조용히 배포**된다. 같은 목록이 여러 파일에 손으로 적혀 있어 하나를 빠뜨리기 쉽다.

## 근거
| 위치 | 내용 |
|---|---|
| `web/scripts/prerender.mjs` `DATA_ROUTES` | 경로별 셀렉터를 최대 20초 대기. 못 찾으면 경고만 출력(`235-241`) |
| `web/scripts/prerender.mjs` | `vite preview` 를 `localhost:3000` `strictPort` 로 띄움 — BE CORS 허용 목록과 맞추기 위한 고정 |
| `web/scripts/verify-prerender.mjs` | 파일 존재 + 홈과 크기 차이만 확인. 공지 상세는 검사 안 함 |
| 가이드 슬러그 12개 | `web/src/domains/guides/content/*.js` · `prerender.mjs` `STATIC_ROUTES` · `web/public/sitemap.xml` 세 곳에 중복 |
| 공지 슬러그 함수 | `web/src/domains/notices/mobile/noticeSlug.js` 와 `web/scripts/notice-source.mjs` 에 같은 로직을 복사 |
| `prerender.mjs:68` 주석 | 존재하지 않는 `/mode/history` 리다이렉트를 언급(낡은 주석) |

## 영향
- 셀렉터 이름을 바꾸는 평범한 리팩터가 SEO 를 깨뜨린다. 빌드는 성공한다.
- 빌드 시간의 대부분(약 54초)이 헤드리스 브라우저 순회다.
- BE 의 CORS 설정을 바꾸면 FE 빌드가 조용히 빈 스냅샷을 만든다.

## 해결 방향
Next 이관 후에는 이 스크립트 네 개(`prerender` · `verify-prerender` · `generate-sitemap` · `notice-source`)가 **모두 필요 없어진다.**

| 지금 | 이관 후 |
|---|---|
| 셀렉터로 렌더 완료 추측 | 서버 컴포넌트가 `await fetch()` — 데이터가 없으면 **빌드가 실패** |
| 공지 목록을 스크립트가 따로 받음 | `generateStaticParams()` 가 같은 API 클라이언트로 받음 |
| sitemap 을 파일 + 스크립트로 병합 | `app/sitemap.ts` 한 곳 |
| 가이드 슬러그 3중 기록 | 콘텐츠 파일 하나에서 `generateStaticParams` · sitemap 이 모두 파생 |

이관 전(0~5단계)에는 스크립트를 그대로 두되, 6단계 전까지 새 경로를 추가할 때 세 곳을 함께 고친다는 체크리스트를 PR 템플릿에 둔다.

## 완료 기준
- [ ] `web/scripts/{prerender,verify-prerender,generate-sitemap,notice-source}.mjs` 삭제 (6단계)
- [ ] API 가 비정상 응답을 주면 FE 빌드가 실패한다 (의도적으로 API URL 을 틀리게 해 확인)
- [ ] 가이드 슬러그가 저장소에서 한 파일에만 정의된다 (`grep -r "legend-material-priority"` 결과가 콘텐츠 파일 1곳)
