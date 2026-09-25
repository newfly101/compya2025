# FE-04 메타 태그를 브라우저에서 조작

> 상태: 열림
> 심각도: 🟠 이관 중 해결
> 닫히는 단계: 5단계 — [`phase-5`](../../03-roadmap/phase-5-seo-parity.md)
> 관련: FE-02

## 현상
페이지별 title · description · canonical · og 태그를 React 훅이 `document.head` 를 직접 고쳐 만든다. 스냅샷에는 퍼피티어가 실행한 결과가 들어가지만, 스냅샷이 없는 주소에서는 홈 메타가 그대로 남는다. 누락 · 불일치도 몇 군데 있다.

## 근거
| 위치 | 내용 |
|---|---|
| `web/src/infra/seo/useDocumentMeta.js` | `document.head` 의 title · meta · link 를 직접 추가/수정 (브라우저 API 17줄) |
| `web/src/infra/seo/usePageSeo.js` | 데이터 로드 후 덮어쓰기. 공지 상세 · 가이드 상세 2곳에서만 사용 |
| `web/src/infra/seo/routeSeo.js:16` `ROUTE_SEO` | `/legend-stats` 항목 없음 → 기본 설명으로 대체 |
| `web/src/infra/seo/routeSeo.js:47` `NOINDEX_PATHS` | `/community`, `/probability/:sectionId`, `/auth/callback` 만. **`/mypage`, `/admin/*` 누락** → `index, follow` + canonical 이 붙는다 |
| `web/public/robots.txt` | `Allow: /` + sitemap 한 줄. `/admin`, `/mypage` Disallow 없음 |
| `web/index.html` | 구조화 데이터(JSON-LD) 없음. GTM `<script>` 는 주석인데 `<noscript>` iframe 은 살아 있음(108-109) |

## 영향
- 메타가 JS 실행 결과에 의존한다 — CSR 의 원래 문제가 메타에서 반복된다.
- 개인 · 관리 화면이 색인 대상으로 신호를 보낸다.

## 해결 방향
| 지금 | 이관 후 |
|---|---|
| `useDocumentMeta` · `routeSeo.js` | 각 `page.tsx` 의 `export const metadata` 또는 `generateMetadata()` |
| canonical 계산 함수 | 루트 `layout.tsx` 의 `metadataBase` + 페이지별 `alternates.canonical` |
| `NOINDEX_PATHS` 배열 | 해당 페이지의 `robots: { index: false }` — 페이지 파일 옆에 붙어 있어 빠뜨리기 어렵다 |
| `robots.txt` 정적 파일 | `app/robots.ts` (`/admin`, `/mypage`, `/auth` disallow) |
| JSON-LD 없음 | 공지 · 가이드 상세에 `Article`, 사이트 루트에 `WebSite` 추가(선택) |

이관 전 1단계에서 먼저 할 수 있는 것: `NOINDEX_PATHS` 에 `/mypage`, `/admin` 추가, `robots.txt` Disallow 추가, `/legend-stats` 설명 추가. 한 줄씩이라 이관을 기다릴 이유가 없다.

## 완료 기준
- [ ] 이관된 모든 공개 페이지의 HTML 원문(JS 없이)에 고유한 `<title>` · description · canonical 이 있다
- [ ] `/mypage`, `/admin` HTML 에 `<meta name="robots" content="noindex">`
- [ ] `https://compyafun.com/robots.txt` 에 `/admin`, `/mypage` Disallow
