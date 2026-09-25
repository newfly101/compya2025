# FE-02 없는 주소가 홈 HTML(200)로 응답 — 소프트 404

> 상태: 열림
> 심각도: 🟠 이관 중 해결
> 닫히는 단계: 5~6단계 — [`phase-5`](../../03-roadmap/phase-5-seo-parity.md), [`phase-6`](../../03-roadmap/phase-6-cutover.md)
> 관련: FE-04

## 현상
`/없는-주소`, `/mypage`, `/admin`, `/probability/3` 처럼 스냅샷이 없는 주소로 들어오면 CloudFront 가 **홈 스냅샷을 상태 코드 200 으로** 돌려준다. JS 가 돌기 전까지 그 HTML 의 title · description · canonical 은 홈의 것이다.

## 근거
| 위치 | 내용 |
|---|---|
| `infra/cloudfront/rewrite-index.js` 머리 주석 | "prerender 대상이 아닌 경로는 SPA fallback 으로 넘어간다. 커스텀 오류 응답(404/403 → /index.html, 200) 설정은 그대로 둬야 한다" |
| CloudFront 배포 설정 | 404 · 403 → `/index.html`, 응답 코드 200 |
| `web/src/app/router/index.jsx:20-25` | 404 화면은 클라이언트 라우터의 `*` 경로에서만 그려진다 |

## 영향
- 검색엔진 입장에서 **없는 주소가 홈과 같은 페이지로 존재**한다(소프트 404). 색인 품질 평가가 떨어지고, canonical 이 홈을 가리키는 중복 페이지가 생긴다.
- 삭제된 공지 주소도 영원히 200 이다.

## 해결 방향
1. Next 정적 export 는 `app/not-found.tsx` 로 `404.html` 을 만든다.
2. CloudFront 오류 응답을 **404 → `/404.html`, 응답 코드 404** 로 바꾼다.
3. 단, 클라이언트 전용 경로(`/mypage`, `/admin/*`, `/auth/callback`)는 스냅샷이 없어도 앱이 떠야 한다. 이 경로들은 Next 에서 **정적 셸 페이지**(빈 레이아웃 + 클라이언트 컴포넌트)로 export 해 실제 파일이 존재하게 만든다. 그러면 "파일 없음 = 진짜 404" 가 성립한다.
4. 동적 경로 중 빌드 때 모르는 것(새 공지)은 `dynamicParams = false` 로 두고, 공지 발행 시 재빌드를 트리거한다([BE-06](../backend/BE-06-notice-contract.md), 5단계).

## 완료 기준
- [ ] `curl -sI https://compyafun.com/없는-주소` → `HTTP/2 404`
- [ ] `curl -sI https://compyafun.com/mypage` → 200, 본문에 홈 canonical 없음 · `noindex`
- [ ] Search Console 「소프트 404」 보고 0건(컷오버 2주 후)
