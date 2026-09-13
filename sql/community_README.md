# 커뮤니티 DB 현황 (2026-09-13)

**한 줄 요약**: 실제 데이터(게시판 4개, 글 237개)는 아직 구버전 테이블에만 있다. 신버전 테이블 8개는 코드는 다 붙어 있지만 전부 0건이다. 둘을 잇는 이관 스크립트는 작성만 돼 있고 아직 실행 전이다.

---

## 구버전 (v1)

| 테이블 | 행수 | 대응 신버전 | 코드 참조 | CREATE 파일 |
|---|---:|---|---|---|
| `boards` | 4 | `site_board` | 없음 (0건) | `sql/V2/CREATE_01_TABLE_V1.sql` |
| `posts` | 237 | `site_post` | 없음 (0건) | 〃 |
| `tags` | 6 | `site_tag` | 없음 (0건) | 〃 |
| `posts_tags` | 0 | `site_post_tag` | 없음 (0건) | 〃 |

코드(mapper XML·Java) 전체를 뒤져도 이 4개 테이블을 읽거나 쓰는 곳은 없다. 지금 서비스 코드는 전부 신버전(`site_*`)만 본다.

## 신버전 (v2, `site_` 접두사)

| 테이블 | 행수 | 역할 | 코드 참조 | CREATE 파일 |
|---|---:|---|---|---|
| `site_board` | 0 | 게시판 정의 | `BoardMapper.xml` | `sql/V2/CREATE_04_TABLE_SITE.sql` |
| `site_post` | 0 | 게시글 | `PostMapper.xml` | 〃 |
| `site_tag` | 0 | 태그 정의 | `TagMapper.xml` | 〃 |
| `site_post_tag` | 0 | 게시글-태그 연결 | `PostTagMapper.xml` | 〃 |
| `site_comment` | 0 | 댓글 (v1 에는 없던 기능) | `CommentMapper.xml` | 〃 |
| `site_comment_reaction` | 0 | 댓글 반응 | `CommentReactionMapper.xml` | 〃 |
| `site_post_reaction` | 0 | 게시글 반응(좋아요 등) | `PostReactionMapper.xml` | 〃 |
| `site_report` | 0 | 신고 | `ReportMapper.xml` | 〃 |

8개 전부 전용 mapper XML(`src/main/resources/mapper/site/community/`)이 살아있다. 즉 코드는 완성돼 있고, 실제로 쓰일 데이터만 아직 없는 상태다. 화면은 2026-08-31부터 동결(읽기 전용)이라 사용자가 직접 글을 쓰지도 않는다.

---

## 이관 스크립트

- 위치: `sql/V2/MIGRATE_community_v1_to_v2.sql`
- **아직 실행되지 않았다.** 운영자 승인 후 실행하도록 스크립트 맨 위에 명시돼 있다.
- 무엇을 옮기나:
  - 게시판: `boards` 중 `TIP`·`CLUB`(id 1, 2)만 `site_board`로. `" TEST"`(공백 포함 이름, id 5, 글 0건)와 `DPRIAN`(id 6, 글 5건)은 테스트 게시판으로 보고 제외
  - 게시글: 위 두 게시판에 속하고 `is_visible=1`인 글만 `site_post`로. 실질적으로 `TIP` 237건 (`DPRIAN`·`CLUB`은 0건이라 옮길 게 없음)
  - id 를 그대로 유지 (`site_post`가 비어 있어 충돌 없음)
  - 카운터 컬럼(댓글수·좋아요·신고수)은 v1에 대응 데이터가 없어 전부 0으로 시작
- **주의사항 (스크립트에 적힌 경고)**:
  - 옮길 글들은 본문이 없다 — 전부 `link_type=EXTERNAL`, `content` 0자. 실제 내용은 네이버 카페·블로그에 있고 여기엔 제목과 링크만 있다
  - 검색엔진이 "가치 없는 콘텐츠"로 볼 위험이 있다. 2026-08-30 애드센스 심사 반려 사유가 이것이었다 → **이관 후 화면에 노출할 때 noindex 처리를 권고**
  - 실행 순서: 백업(`mysqldump` boards·posts·posts_tags·tags·site_board·site_post) → 게시판 이관 → 게시글 이관 → 건수 대조 검증
  - 되돌리기는 간단하다 — `site_post`/`site_board`에서 옮겨진 id만 지우면 원본(`boards`/`posts`)은 손대지 않았으므로 원상복구

## `tags` / `posts_tags` 판정

**이관 스크립트는 `tags`와 `posts_tags`를 전혀 읽지 않는다.** 스크립트 맨 아래 "이관하지 않은 것" 항목에 "`tags`(6)·`posts_tags`(0) — 연결이 0건이라 옮길 것이 없다"고 명시돼 있고, 실제로 스크립트 안에 이 두 테이블을 대상으로 한 `SELECT`/`INSERT`가 없다.

**결론: 지금 지워도 이관 작업에 아무 영향이 없다.** `posts_tags`가 처음부터 0건이라 애초에 게시글-태그 연결이 존재한 적이 없다(태그를 쓰려면 이관과 무관하게 `site_tag`에 새로 정의해야 한다).

---

## 지금 지워도 되는 것 / 안 되는 것

| 대상 | 판정 | 근거 |
|---|---|---|
| `tags` (6행) | 지워도 됨 | 코드 참조 0, 이관 스크립트도 안 씀 |
| `posts_tags` (0행) | 지워도 됨 | 행 자체가 0, 연결된 적 없음 |
| `boards` (4행) | **안 됨** | 이관 스크립트가 원본으로 읽는다(아직 미실행) |
| `posts` (237행) | **안 됨** | 이관 스크립트가 원본으로 읽는다 — 이관 전에는 유일한 실제 데이터 |
| `site_*` 8종 (전부 0행) | 지울 데이터 자체가 없음 | 코드가 계속 참조 중이라 테이블·스키마는 유지 |

※ 이 문서는 판정만 정리한 것이고, 이번 작업에서 실제 삭제(DROP)는 하지 않았다.

## 결정이 필요한 것

1. **이관 스크립트를 실행할 것인가.** 실행하면 `boards`/`posts` 237건이 `site_board`/`site_post`로 옮겨지고, 그 뒤에야 v1 원본을 진짜 삭제 후보로 볼 수 있다. 다만 옮겨진 글이 "본문 없는 외부 링크 모음"이라 애드센스 재심사에 영향을 줄 수 있어 실행 여부는 운영 정책 판단이 필요하다
2. 실행하지 않기로 하면, `boards`/`posts` 원본(241행)을 계속 남겨둘지 별도 결정이 필요하다
3. `tags`/`posts_tags`는 이관 여부와 무관하게 지금 지워도 되므로, 이관과 별도로 지금 정리할지 이관 시점에 같이 정리할지 결정
