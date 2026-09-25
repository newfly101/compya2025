# OPS-01 문서끼리, 문서와 코드가 어긋남

> 상태: 열림
> 심각도: 🟠 이관 중 해결
> 닫히는 단계: 0단계 — [`phase-0`](../../03-roadmap/phase-0-baseline.md)
> 관련: OPS-05, `05-project-management/README.md`

## 현상
문서가 여러 곳(저장소 `CLAUDE.md` · `docs/` · `PRODUCT.md`, Notion 로드맵)에 있고 **기준일이 서로 다르다.** 두 달 공백 뒤 복귀했을 때 "문서를 믿을 수 없어 코드를 다시 셌다" 는 경험(Notion 「작업 히스토리」 2장)이 그 뒤에도 반복되고 있다.

## 근거 — 기준 커밋 `566cf3b` 과 대조한 불일치

| # | 문서의 서술 | 실제(코드 · 다른 문서) | 어느 쪽을 고치나 |
|---|---|---|---|
| 1 | `CLAUDE.md` §10 "`skill`(스킬 백과사전) … 2026-08-20 에 전부 제거" | `/skills` 스킬 백과사전이 2026-09-09 재신설되어 운영 중 | CLAUDE.md |
| 2 | `CLAUDE.md` §10 살아있는 도메인 목록 | `mileage` · `players` · `odds` · `guides` · `policy` · `legendStats` · `historyLegend` 누락 | CLAUDE.md |
| 3 | `CLAUDE.md` §10 "ops 가이드 ⏳ 미작성" | `docs/global-guide/develop/be-deploy-setup.md` 등 존재 | CLAUDE.md |
| 4 | Notion 「서비스 정책」 3장 · 「기술 기록」 4-(a): 스냅샷 · sitemap **13개** | `prerender.mjs` `STATIC_ROUTES` **29개** + 공지 상세, `public/sitemap.xml` **27개**(09-13 가이드 12편 추가) | Notion |
| 5 | Notion 「서비스 정책」 2장: 선수 백과사전 · 확률 공시 메뉴에 로그인 표시 | 선수 백과사전 표시는 이미 제거, 확률 공시만 남음 | Notion (+ 코드 [FE-07](../frontend/FE-07-login-flag-policy-mismatch.md)) |
| 6 | Notion 「기술 기록」 2.1 · 2.5: Caffeine 캐시 | `spring.cache.type=simple` | 코드 또는 Notion ([BE-08](../backend/BE-08-cache-config-drift.md)) |
| 7 | Notion 「기술 기록」: 기준 브랜치 `v2.0.0-refactor-mobile` | 원격에는 `master` · `dev` 만 있고 둘 다 `566cf3b`(병합 완료로 추정) | Notion |
| 8 | `docs/global-guide/develop/scripts-cleanup-plan.md`: "master 가 405커밋 뒤처져 배포 불가" | `master` = `dev` = `566cf3b` — 해소된 것으로 보임(추정, 배포 로그 미확인) | 문서 |
| 9 | `docs/convention/backend.md` 인증: `ACCESS_TOKEN` 쿠키만 서술 | `REFRESH_TOKEN` 쿠키 · `site_refresh_tokens` · 회전 방식 존재 | 문서 |
| 10 | `docs/convention/frontend.md`: historyMode 는 정적 데이터, players 데이터는 `data/` | 둘 다 서버 API 로 전환됨. `infra/ads` · `infra/seo` 서술 없음 | 문서 |
| 11 | `PRODUCT.md`: 수익화 미확정, 쿠폰 28 · 이벤트 21 | 애드센스 신청 진행 중, `decisions-2026-08-31.md` 는 쿠폰 50 · 이벤트 33 | PRODUCT.md |
| 12 | `sql/README.md`: V3 `CREATE_01~07` | `CREATE_08` 존재(`sql/V3/README.md` 는 반영) | sql/README.md |
| 13 | Notion 「서비스 정책」 8장: 옛 게시글 **242건** | `sql/community_README.md`: 이관 대상 **237건** | 실측 후 한쪽 |
| 14 | `docs/convention/adsense.md`: 상세 이력은 `test-docs/adsense/README.md` | `test-docs/` 는 gitignore — 저장소에 없음 | adsense.md |

## 영향
- 신규 기여자(또는 두 달 뒤의 나)가 틀린 문서를 기준으로 작업한다.
- AI 도구(`CLAUDE.md` 자동 로드)가 "스킬 도메인은 삭제됨" 을 전제로 코드를 고친다 — 문서 오류가 코드 오류로 번진다.
- 포트폴리오 검토자가 수치 불일치를 발견하면 전체 신뢰가 떨어진다.

## 해결 방향
1. **원천 규칙**을 정한다 → [`05-project-management/README.md`](../../05-project-management/README.md) §2. 요지: 기획 · 운영 결정은 Notion, 코드에 대한 사실 · 기술 결정은 저장소 `docs/`. 같은 수치를 두 곳에 쓰지 않고 링크한다.
2. 위 14건을 0단계에서 한 번에 정정한다(이 문서의 표를 체크리스트로 사용).
3. 수치(라우트 수 · sitemap 수 · 테이블 수)는 문서에 쓰지 말고 **명령을 쓴다**. 예: "sitemap 주소 수 = `grep -c '<loc>' web/public/sitemap.xml`".

## 완료 기준
- [ ] 위 표 14행 각각 "고친 곳" 링크 또는 커밋 해시 기록
- [ ] `CLAUDE.md` 의 도메인 목록이 `ls web/src/domains` 결과와 일치
