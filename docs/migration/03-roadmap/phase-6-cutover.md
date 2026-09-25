# 6단계 — 컷오버

> 목표: 운영 배포를 Next 산출물로 바꾸고, prerender 와 `web/` 을 걷어낸다
> 닫는 결함: [FE-03](../02-diagnosis/frontend/FE-03-prerender-fragility.md), [OPS-02](../02-diagnosis/ops/OPS-02-deploy-pipeline.md)(FE 빌드), [FE-02](../02-diagnosis/frontend/FE-02-soft-404.md)(CloudFront 적용)
> 운영 영향: **있음** — 배포 창을 잡고 진행, 되돌리기 준비 필수

---

## 1. 사전 조건

- [ ] 5단계 완료 기준 전부 통과
- [ ] 애드센스 재신청과 **같은 주에 하지 않는다**(색인이 안정된 뒤 재신청 — Notion 「서비스 정책」 6장 순서)
- [ ] 되돌리기 절차를 한 번 연습(아래 §3)

---

## 2. 전환 절차

| # | 작업 | 확인 |
|---|---|---|
| 6-1 | `deploy-fe.yml`: 작업 폴더 `frontend`, `npm ci && npm run build`, 동기화 대상 `out/`. 업로드 이미지 제외 규칙(`--exclude uploads/* portfolio/*`) 유지 | 워크플로 성공 |
| 6-2 | 배포 | 기존 라이브 검사(`ads.txt` content-type, 홈 문구) 통과 |
| 6-3 | CloudFront 오류 응답: 404 · 403 → `/404.html`, **응답 코드 404** | `curl -sI /없는-주소` → 404 |
| 6-4 | CloudFront Function 은 그대로(`trailingSlash: true` 산출물과 규칙 일치). www → apex 301 유지 | `/skills` · `/notice/{slug}` 200 |
| 6-5 | 기준선 스크립트를 **운영 주소**로 실행 | 전 경로 통과 |
| 6-6 | Search Console 에 sitemap 재제출 | 제출 성공 |

---

## 3. 되돌리기

`web/` 과 기존 워크플로는 **2주간 지우지 않는다.** 문제가 생기면:

1. `deploy-fe.yml` 을 컷오버 직전 커밋으로 되돌려 수동 실행(`web/` 빌드 재배포)
2. CloudFront 오류 응답을 404 → `/index.html`(200)로 복원 — SPA fallback 이 다시 필요하므로

---

## 4. 2주 관찰 후 정리

| 작업 | |
|---|---|
| `web/` 폴더 삭제, `web/scripts/*` 삭제 | FE-03 닫힘 |
| `docs/convention/frontend.md` 를 Next 기준으로 재작성(서버/클라이언트 경계 규칙 포함) | |
| `CLAUDE.md` §3 · §4 · §9 경로와 빌드 설명 갱신 | |
| Notion 「기술 기록」 에 이관 결과 절 추가(수치: 빌드 시간, 소프트 404, LCP · CLS 전후) | 포트폴리오 근거 |

---

## 5. 완료 기준

- [ ] 운영에서 없는 주소 → 404, 공개 경로 → 200 + 고유 메타
- [ ] Search Console 소프트 404 · 색인 오류가 컷오버 전 대비 증가 없음(2주)
- [ ] 대표 3개 페이지 PageSpeed 모바일 CLS 가 기준선보다 낮거나 같다
- [ ] 저장소에 `web/` 없음
