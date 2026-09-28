---
feature: odds
version: 1.0.1
status: active
created: 2026-08-22
updated: 2026-09-28
---

# 확률 공시

## 1. 무엇을 하는 기능인가

게임 확률형 아이템 공시(법정 의무 공시)를 목차→상세 2단 구조로 옮겨 보여준다. 값은 전부 정적 JSON이며 화면에 반올림·재계산 로직이 없다 — 게임사 공시 원문 텍스트를 그대로 보여준다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| SC-10-01 확률 공시 목차 | `/probability` | 홈 퀵메뉴·서랍(코드 식별자는 `odds`, 노출 주소는 `probability`) |
| SC-10-02 확률 공시 상세 | `/probability/:sectionId` | 목차 항목 클릭, 상세 화면 하단 이전/다음 섹션 이동 |

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-ODD-01 | 목차·상세 조회 | 8개 카테고리 61개 섹션을 비로그인으로 조회할 수 있다 | `data/odds/cpb2015_1_3.json`, `OddsSectionScreen.jsx` |
| REQ-ODD-02 | 원문 그대로 표시 | 확률값은 게임사 공시 원문 텍스트 그대로 노출한다(반올림·재계산 없음). 소수점 최대 8자리까지 표시돼 개별 확률 합이 100%가 안 되는 것처럼 보일 수 있다는 고지가 이미 포함돼 있다 | `OddsTable.jsx`/`OddsNote.jsx`, JSON `intro.notes[0]` |
| REQ-ODD-03 | 비로그인 공개 | `/probability`는 로그인 여부와 무관하게 누구나 볼 수 있다 — 법정 공시 데이터라는 성격상 최종 확정된 정책이며, 인증 가드를 추가하는 방향은 채택되지 않았다 | `PublicRoutes.jsx`(무가드), `docs/features/odds/history.md` 2026-09-28(`e40f7bb0`) |
| REQ-ODD-04 | 잘못된 섹션 접근 | 존재하지 않는 `sectionId`로 접근하면 서버 404가 아니라 FE가 목차로 리다이렉트한다 | `OddsSectionScreen.jsx:41-43` |
| REQ-ODD-05 | 검색 색인 | 목차(`/probability`)는 색인 대상이지만, 섹션 상세(`/probability/:sectionId`)는 원본성이 낮은 공시 표라 검색 색인에서 제외한다 | `infra/seo/routeSeo.js`(`NOINDEX_PATHS`) |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 확률 공시 문서 | 정적 JSON(`web/src/data/odds/cpb2015_1_3.json`, `{docId, title, intro, categories[], sections[]}`) | 서버 없음, FE 전용. BE에 대응 패키지 없음 |
| 갱신 방법 | 연동 시트 카탈로그(원천) → 코드 수정·재배포. 자동 파싱 스크립트는 저장소에 실재하지 않는다 | 시트 URL 자체는 이 문서에 적지 않는다 |

## 5. 하지 않는 것

- 확률값의 반올림·소수점 재계산 — 원문 텍스트 그대로만 보여준다
- `/probability`에 로그인 가드 추가 — 법정 공시 데이터의 비로그인 공개가 최종 정책이다(REQ-ODD-03)

## 6. 확인 필요

- ❓ 확률 공시 JSON을 앞으로 어떤 방법으로 갱신할지 — 과거 주석이 가리키던 파싱 스크립트가 저장소에 없다. 갱신 절차 대체안 미정
