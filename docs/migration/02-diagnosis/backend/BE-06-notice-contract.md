# BE-06 공지 API 계약 — 슬러그 · 목록 크기

> 상태: 열림
> 심각도: 🔴 이관 차단
> 닫히는 단계: 1단계(계약) + 5단계(재빌드 트리거) — [`phase-1`](../../03-roadmap/phase-1-blockers.md), [`phase-5`](../../03-roadmap/phase-5-seo-parity.md)
> 관련: FE-02, FE-03

## 현상
공지 상세 주소는 `/notice/{슬러그}` 인데, 슬러그는 **FE 가 제목으로 만든다.** 서버는 숫자 id 로만 조회한다. 그래서 상세 화면은 공지 **전체 목록**을 받아 제목을 다시 슬러그로 바꿔 가며 일치하는 것을 찾는다.

## 근거
| 위치 | 내용 |
|---|---|
| `web/src/domains/notices/mobile/noticeSlug.js:3-17` | 제목 → 슬러그 단방향 변환. 머리 주석: "조회는 목록을 훑어 title 을 다시 slugify 해서 대조" |
| `web/src/domains/notices/mobile/hooks/useNoticeDetail.js:32` | `siteNotices.find(n => noticeTitleToSlug(n.title, n.id) === param)` |
| `web/scripts/notice-source.mjs` | 같은 함수를 복사해 prerender 대상 목록 생성 |
| `src/main/java/com/dawne/com2usbaseball/domain/notice/controller/NoticeController.java:21` | `GET /api/notices` — 페이지네이션 없음 |
| `src/main/resources/mapper/site/notice/NoticeMapper.xml:12-31` | 목록 조회가 **본문 HTML 전체**를 포함 |
| `src/main/java/com/dawne/com2usbaseball/domain/notice/dto/response/NoticeSummaryResponse.java` | 요약 DTO 가 있으나 사용처 없음 |

## 영향
| 문제 | 결과 |
|---|---|
| 제목이 같은 공지 2건 | 같은 슬러그 → 뒤의 공지는 영영 열리지 않음 |
| 제목 수정 | 기존 주소가 404 — 검색에 잡힌 주소가 깨짐 |
| 목록이 본문 포함 · 무제한 | 상세 한 건을 보려고 전체 본문을 받음. 공지가 늘수록 선형으로 느려짐 |
| 슬러그 규칙이 FE 두 곳에 | 한쪽만 고치면 prerender 주소와 앱 주소가 어긋남 |
| **이관** | `generateStaticParams` 가 "어떤 슬러그들이 존재하는가" 를 서버에게 물을 수 없음 |

## 해결 방향
**슬러그를 서버 데이터로 만든다.** 기존 주소를 깨지 않도록 지금 알고리즘 그대로 채운다.

1. `site_notices.slug` 컬럼 추가(`VARCHAR(200)`, UNIQUE). 기존 행은 `noticeTitleToSlug` 와 같은 규칙으로 1회 백필 — 충돌 시 `-{id}` 접미사. ops 트랙 SQL(`sql/V3/ALTER_*`)로 수동 적용
2. 공지 생성 시 서버가 슬러그 생성, **제목을 바꿔도 슬러그는 유지**(필요하면 어드민에서 명시적으로 변경)
3. 엔드포인트
   | 메서드 | 경로 | 응답 |
   |---|---|---|
   | GET | `/api/notices/summaries` | `[{id, slug, title, source, pinned, publishedAt, updatedAt}]` — 본문 없음. 목록 화면 · `generateStaticParams` · sitemap 공용 |
   | GET | `/api/notices/slug/{slug}` | 상세 1건. 없으면 404(`NOTICE_NOT_FOUND`) |
   | GET | `/api/notices` | 기존 유지(호환), 이관 완료 후 페이지네이션 추가 또는 폐기 |
4. FE 는 `noticeSlug.js` · `notice-source.mjs` 의 슬러그 생성 로직을 지우고 서버 값을 쓴다.
5. (5단계) 어드민이 공지를 발행 · 수정 · 삭제하면 FE 배포 워크플로를 트리거 → 정적 상세가 갱신된다.

## 완료 기준
- [ ] 백필 후 기존 공지 전체의 서버 슬러그가 FE 함수 결과와 일치(스크립트로 대조, 불일치 목록 0건 또는 리다이렉트 표 작성)
- [ ] 제목이 같은 공지 2건을 만들어도 둘 다 열린다
- [ ] 공지 상세 화면이 목록 API 를 부르지 않는다
- [ ] `web/src` · `web/scripts` 에서 `noticeTitleToSlug` 0건
