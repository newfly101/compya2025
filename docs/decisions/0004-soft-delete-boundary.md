---
adr: 0004
title: 지움 표시(소프트 삭제)는 4개 테이블에만 적용한다
status: accepted
date: 2026-09-27
scope: src/main/java/**/domain/**, sql/V2, sql/V3
related: rules/be/be-convention.md § 7
created: 2026-09-27
updated: 2026-09-28
---

# 0004 지움 표시(소프트 삭제)는 컬럼이 있는 4개 테이블에만 적용한다

## 배경

"지움 표시"(소프트 삭제, `is_deleted` 같은 컬럼으로 삭제 여부만 표시하고 실제 행은 남기는 방식)는 흔히 "모든 테이블에 일관 적용해야 하는 규칙"으로 오해되기 쉽다. 실제로 이 프로젝트는 테이블마다 성격이 달라 일부는 소프트, 일부는 하드(`DELETE FROM` 실제 삭제)가 맞다. 2026-09-27 감사에서 규칙 문서(현재 `.claude/rules/be/be-convention.md` § 7)의 서술과 실제 스키마가 어긋나 있는 것이 확인돼 정정했다.

## 결정

`is_deleted` 컬럼을 실제로 가진 테이블은 4개뿐이고, 그 4개에 대해서만 소프트 삭제 규칙을 강제한다.

| 성격 | 방식 | 테이블 |
|---|---|---|
| 사용자에게 보이는 글·댓글·태그 | 소프트 — `UPDATE ... is_deleted = TRUE`, 조회는 `WHERE is_deleted = FALSE` 필수 | `site_board` `site_post` `site_comment` `site_tag` |
| 토큰·매핑·반응·처리 끝난 신고 | 하드 `DELETE` | `site_refresh_tokens` `site_post_tag` `site_*_reaction` `site_report` |
| 관리자 콘텐츠 (컬럼 없음) | 하드 (컬럼이 없어 다른 수단이 없다) | `site_notices` `site_events` `fun_quiz` |
| 쿠폰 / 회원 | 다른 컬럼으로 대체 (`is_visible = false` / `user_status` + `withdrawn_at`) | `site_coupons` / `site_users` |

- 위 4개 밖에서 `DELETE FROM` 을 쓰는 것은 규칙 위반이 **아니다** — 컬럼이 없으니 다른 수단이 없다
- 새 테이블은 이 표에서 성격을 먼저 고르고, 소프트가 맞을 때만 `is_deleted` 컬럼을 추가한다

## 왜 (대안과 비교)

| 대안 | 문제 | 판정 |
|---|---|---|
| 모든 테이블에 `is_deleted` 를 일괄 추가한다 | 컬럼 추가는 DDL(테이블 구조를 바꾸는 작업)이고, **이 프로젝트는 test DB 와 운영 DB 가 같은 인스턴스**라 실행 즉시 운영에 반영된다. 토큰·반응처럼 "삭제돼야 마땅한" 데이터까지 남기면 오히려 개인정보·보안 관점에서 위험하다 | 기각 |
| 테이블 성격과 무관하게 전부 하드 삭제로 통일한다 | 게시글·댓글처럼 "복구 가능해야 하는" 데이터까지 즉시 사라져, 관리자 실수 복구가 안 된다 | 기각 |

## 함정 — 실제로 걸렸던 것

- **UNIQUE 제약이 걸린 컬럼은 재등록이 막힌다.** 삭제 표시만 한 행이 여전히 그 값을 점유하므로 같은 코드·이름으로 다시 만들 수 없다 — `site_tag.code`, `site_coupons.coupon_code`(공개여부 끄기 방식)에서 실제로 확인된 문제다. 재등록이 필요한 데이터라면 소프트 삭제를 고르기 전에 이 점을 먼저 따진다
- **조회 쿼리에서 `is_deleted = FALSE` 조건을 한 곳이라도 빼먹으면 삭제된 데이터가 화면에 노출된다.** 집계·카운트 쿼리도 예외 없이 조건이 필요하다

## 영향받는 곳

- `rules/be/be-convention.md` § 7 — 삭제 경계 표의 단일 원천
- 새 도메인 체크리스트(`be-convention.md` § 9) — Entity 작성 시 `isDeleted` 는 이 표에서 소프트로 분류될 때만 추가

## 아직 미정인 것 (❓)

- 없음 — 4개 테이블 경계는 실측으로 확정됐다. 새 테이블이 추가될 때마다 이 표에서 성격을 재분류하는 절차만 남아 있다
