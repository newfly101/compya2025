# 0단계 — 기준선: 현황을 고정한다

> 목표: "옮긴 뒤가 옮기기 전과 같다" 를 판단할 기준과, 믿을 수 있는 문서를 만든다
> 닫는 결함: [OPS-01](../02-diagnosis/ops/OPS-01-docs-drift.md), [OPS-05](../02-diagnosis/ops/OPS-05-done-definition.md), [OPS-02](../02-diagnosis/ops/OPS-02-deploy-pipeline.md)(PR 검사), [OPS-04](../02-diagnosis/ops/OPS-04-test-gap.md)(기준선)
> 운영 영향: 없음

---

## 1. 할 일

| # | 작업 | 산출물 |
|---|---|---|
| 0-1 | OPS-01 표의 불일치 14건 정정 | 커밋 + OPS-01 표에 링크 |
| 0-2 | 문서 원천 규칙 확정 | [`05-project-management/README.md`](../05-project-management/README.md) §2 |
| 0-3 | Notion 작업 보드 「확인」 28건 정리(건당 10분) | 「완료」 또는 「진행중」 으로 이동 |
| 0-4 | 작업 보드에 「완료 기준」 칸 추가, 이관 결함 22건을 행으로 등록 | Notion 작업 보드 |
| 0-5 | **SEO 기준선 스크립트** — 공개 경로를 돌며 HTML 원문(JS 끔)과 렌더 후 DOM 에서 `title` · description · canonical · robots · `h1` · 주요 목록 항목 수 · 상태 코드를 JSON 으로 저장 | `docs/migration/baseline/2026-MM-DD.json` + 스크립트 |
| 0-6 | 외부 지표 기록 — Search Console 색인 수, 소프트 404 수, PageSpeed(모바일) LCP · CLS 3개 대표 페이지 | `docs/migration/baseline/metrics.md` |
| 0-7 | PR 검사 워크플로 — FE `lint` + `build:fast`, BE `test`(DB 불필요분) | `.github/workflows/pr-check.yml` |

---

## 2. 기준선 대상 경로

`web/scripts/prerender.mjs` `STATIC_ROUTES` 29개 + 공지 상세 3건(최신 · 고정 · 오래된 것) + 스냅샷이 없는 경로 4개(`/mypage`, `/admin`, `/probability/1`, `/없는-주소`). 마지막 4개는 **지금의 잘못된 동작(200 + 홈 메타)을 기록**해 두기 위함이다 → 5단계에서 달라져야 정상.

---

## 3. 완료 기준

- [ ] OPS-01 표 14행 전부 처리 기록
- [ ] 기준선 JSON 이 커밋되고, 스크립트를 다시 돌리면 같은 결과(날짜 필드 제외)
- [ ] PR 을 열면 검사가 돈다
- [ ] Notion 작업 보드에 이관 결함 22행 + 「완료 기준」 칸
