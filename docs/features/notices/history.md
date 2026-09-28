---
feature: notices
created: 2026-09-28
updated: 2026-09-28
---

# notices — 변경 이력

> "고정 공지가 홈에서 빠지는 문제"는 notices 코드가 아니라 home 도메인의 조립 로직 문제로 확인돼 `features/home/history.md`에서 다룬다(회피 영역 — 본 문서에서는 다루지 않음).

## 2026-09-28 — 발행일이 비어 있던 옛 공지에 등록 시각을 채움 · 시각 컬럼 형식 통일

- 버전: 1.0.5 (patch)
- 커밋: 미커밋 (SQL 은 사용자가 직접 실행)

**고친 것**

- 어드민 글쓰기에 발행일 입력이 없던 시절에 등록된 공지는 `published_at` 이 비어 있어 목록에서 발행일이 안 보이고 정렬도 맨 뒤로 밀렸다. 비어 있던 행에 등록 시각(`created_at`)을 채웠다. 준비만 해 두었던 보정 SQL(`applied/small_fixes.sql` 1구획)을 사용자가 실행한 것으로, 공개 여부는 `is_visible` 이 정하므로 노출 범위는 바뀌지 않았다.
- `created_at`·`updated_at` 을 TIMESTAMP 에서 DATETIME 으로 바꿨다(coupons 와 같은 이유, [ADR 0007](../../decisions/0007-kst-timezone.md) 3단계).

**손대지 말 것**

- `published_at` 은 정렬·표시 전용이다. 공개 조건에 끼워 넣지 않는다 — 옛 데이터가 다시 비면 목록에서 사라지는 사고가 된다.

**미결**

- 없음

## 2026-09-28 — 업로드 주소 추출 로직을 공용 함수로 교체

- 버전: 유지 (refactor, 1.0.4 기준)
- 커밋: `a3612fc5` (여러 도메인 화면 공통 커밋, 이 문서는 `AdminNoticeWriteScreen.jsx` 부분만)

**고친 것**

- `AdminNoticeWriteScreen.jsx`가 갖고 있던 업로드 주소 추출(`extractUploadedUrl`) 지역 복사본을 지우고 공용 함수(`@/infra/api/uploads/index.js`) import로 바꿨다.

**손대지 말 것**

- 없음.

**미결**

- 없음.

## 2026-09-28 — 공개 목록 수동 분기를 공용 처리로 통일 + 쓰이지 않는 삭제·고정 요청 정리

- 버전: 유지 (refactor, 1.0.4 기준)
- 커밋: `a33ba6a7` (여러 도메인 store 정리 공통 커밋, 이 문서는 notices 부분만)

**고친 것**

- 공개 목록 조회만 손으로 쓴 `addCase` 분기였다 — 다른 요청과 같은 공용 처리 함수(`applyAsyncHandlers`)로 바꿨다. "필드명이 고정이라 공개 전용 칸을 못 쓴다"던 기존 주석은 확인해 보니 틀린 설명이었다(공용 처리에 `public` scope가 이미 있었다) — 주석도 고쳤다. 본문 조회 오류 칸(`contentError`)은 로딩 상태를 일부러 따로 다루므로 손대지 않고 그대로 뒀다.
- 부르는 곳이 없는 `requestAdminDeleteNotice`·`requestAdminUpdateNoticePinned` thunk와 그 API 함수(`fetchAdminDeleteNotice`·`fetchAdminUpdatePinned`)를 지웠다 — 단건 삭제는 일괄 API로, 고정(pinned)은 글쓰기 화면의 전체 수정 저장으로 이미 대체돼 있었다.

**손대지 말 것**

- 없음.

**미결**

- 없음.

## 2026-09-28 — 공지 없음 판단 위치를 저장소에서 서비스로 이동

- 버전: 유지 (refactor, 1.0.4 기준)
- 커밋: `5b76b8e7` (quiz 매퍼 경로 정리와 공통 커밋, 이 문서는 notices 부분만)

**고친 것**

- `NoticeRepository`/`AdminNoticeRepository`가 값이 없으면 직접 `BaseException`(404)을 던지던 것을 없애고, `Optional`만 반환하도록 바꿨다. "없음" 판단은 호출하는 `NoticeServiceImpl`/`AdminNoticeServiceImpl`로 옮겼다 — 쿠폰·이벤트 등 다른 도메인과 같은 구조로 맞춘 것이고, 응답 상태·사유 코드는 그대로다.

**손대지 말 것**

- 없음.

**미결**

- 없음.

## 2026-09-28 — 공지 등록·수정 직후 목록 날짜 오표시 + 본문 실패 무음 처리

- 버전: 1.0.4 (patch)
- 커밋: `f2d10b87` (notices·coupons 공통 커밋, 이 문서는 notices 부분만)

**고친 것**

- 공지 상세에서 본문만 못 불러오면 아무 안내 없이 제목·날짜만 있는 정상 화면처럼 보이던 것을, 본문 자리에 실패 안내(StateBox)를 표시하도록 고쳤다. `slices.js`에 `contentError` 칸을 신설하고 `pending`/`fulfilled`/`rejected` 세 케이스를 모두 처리하도록 리듀서를 확장했다.
- 공지 등록 직후 목록의 등록일이 빈 값, 수정 직후 수정일이 그대로 보이던 문제를 고쳤다. `admin/thunks.js`의 등록·수정 처리 함수가 서버 응답 대신 요청 때 보낸 폼 값을 그대로 되돌리고 있었는데, 서버 응답 전체를 반환하도록 바꿨다.

**손대지 말 것**

- 본문 실패를 화면 전체 오류로 처리하지 말 것 — 제목·날짜는 정상 조회된 상태이므로 본문 자리에만 지역적으로 안내하는 것이 맞는 설계다.

**미결**

- 없음(코드 관점). 공개 목록 LIMIT 200 고정(진짜 서버 페이징 아님)은 별도 미결 항목(아래) 참고.

## 2026-09-28 — 공지 일괄 처리 부분 실패 안내 신설

- 버전: 1.0.3 (patch)
- 커밋: `4eaa8287` (전 도메인 공통 커밋, notices 부분 실패 배너 포함)

**고친 것**

- 공지 일괄 삭제·노출변경이 일부만 실패해도 화면에 안내가 없던 것을 고쳤다. coupons·events·quiz에는 이미 있던 "몇 건 남았는지" 배너 패턴을 notices에도 이식했다.

**손대지 말 것**

- 없음(패턴 이식 — 다른 도메인과 규칙을 맞춘 것이라 notices만 다르게 되돌리지 말 것).

**미결**

- 없음.

## 2026-09-28 — 공지 새로고침 캐시 무효화 범위 축소

- 버전: 1.0.2 (patch)
- 커밋: `906c98e5`

**고친 것**

- 공지 목록을 새로고침(캐시 동기화)하면 실제로 쓰이는 키(`'public'`)만 비우면 되는데 `allEntries=true`로 전체를 비우던 것을, `key="'public'"`로 좁혔다.

**손대지 말 것**

- `noticeDetail` 캐시는 공지 번호별 동적 키라 전량을 알 수 없어 기존대로 `allEntries` 유지한다 — 이 캐시까지 좁히려 하지 말 것.
- `refreshNotices`가 `@CacheEvictAfterCommit`이 아닌 일반 `@CacheEvict`를 쓰는 것은 의도된 설계다(새로고침은 즉시 반영이 목적) — 고치지 말 것.

**미결**

- 없음.

## 2026-09-28 — 숨긴 공지 노출 차단 + slug 충돌 제거 + 접근성·검증순서 수정

- 버전: 1.0.1 (patch, canonical slug 형식 변경 포함)
- 커밋: `7606f82c`

**고친 것**

- 관리자·공개 화면이 같은 Redux 배열(`state.notices.siteNotices`)을 공유해 숨긴 공지나 어드민 오류 문구가 공개 화면에 섞일 수 있던 문제 — 관리자·공개 상태를 완전히 분리했다.
- 공개 목록 SQL이 본문(LONGTEXT)까지 통째로 내려주던 것 — 목록 SQL에서 본문 컬럼을 빼고 행 상한(LIMIT 200)을 추가, 본문은 기존에 있던 공개 상세 API로 채우도록 구조를 바꿨다.
- 제목이 숫자로만 된 공지의 주소(slug)가 공지 id로 오인돼 정상 주소가 틀린 주소로 리다이렉트되거나(심하면 무한 루프) 될 수 있던 문제 — slug에 id 접미어를 항상 붙여 순수 숫자만으로는 slug가 되지 않게 했다. 같은 방식으로 slug 180자 절단 충돌 문제도 함께 해소됐다.
- 외부 공지 카드가 마우스로만 열리고 키보드·스크린리더로는 열 수 없던 문제(필드명 `externalLink`→`externalUrl` 오류 포함) — `<article onClick>`을 `<a href={notice.externalUrl}>`로 교체.
- 살균(HTML 소독)보다 검증이 먼저 실행돼, 살균 후 완전히 빈 문자열이 되는 본문도 `NOT NULL` 제약을 통과해 저장될 수 있던 문제 — 살균을 검증보다 먼저 수행하도록 순서를 바꿨다.

**손대지 말 것**

- 어드민 목록 SQL(`getAdminNoticeList`)에 `is_visible` 필터가 없는 것은 정상 — 어드민은 숨긴 공지도 봐야 한다. 서버 쿼리를 필터링하게 바꾸지 말 것(프런트 상태 분리로 이미 해결됨).
- `AdminNoticeScreen.jsx`의 `.sort()`, `admin/thunks.js`의 `.reverse()`는 관리자가 직접 정렬하는 UI라 결함이 아니다.
- `ALLOWED_TAGS`가 `style` 속성을 막지 못하는 것은 사실이지만, BE `Jsoup.clean(Safelist.relaxed())`가 저장 시점에 이미 막고 있어 결함이 아니다. 단, 살균 대상은 `content` 하나뿐이고 `summary`·`title`은 살균 안 됨 — 지금은 텍스트 노드로만 쓰여 안전하지만 나중에 리치 텍스트 컴포넌트로 넘기면 위험해진다.

**미결**

- 공개 목록이 여전히 LIMIT 200 고정 — 진짜 서버 페이징이 아니다. 공지 수가 200건을 넘어설 시점에 페이징 UI 도입 여부는 기획 결정 사안.
- 캐시 만료 시간(TTL) 미적용은 전역 문제 — notices에도 영향을 주지만 도메인 문제는 아니다.
