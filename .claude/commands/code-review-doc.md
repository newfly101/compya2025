---
description: 도메인 단위 코드 리뷰 → 주니어 기준 해결방향 문서 생성. BE/FE 병렬 리뷰 후 통합 1편 산출
argument-hint: <domain>
---

# /code-review-doc $ARGUMENTS

도메인 코드를 BE/FE 병렬로 리뷰하고, 주니어가 배경 지식 없이 따라올 수 있는 통합 문서 1편을 만드는 표준 워크플로우.
타깃 도메인: **$ARGUMENTS** (예: authentication / coupons / events / notices)

전체 흐름: `0. 경로 실측` → `1. BE/FE 병렬 리뷰(중간 산출물 2개)` → `2. 메인 검증` → `3. 통합 문서 1개` → `4. git 상태 확인`.
17개 도메인에 반복 적용할 것을 전제로 만들었다 — 매번 brief 를 새로 쓰지 않고 `$ARGUMENTS` 만 바꿔 실행한다.

---

## 0. 사전 확인 (메인 세션이 직접)

FE 경로와 BE 패키지가 존재하는지 실측한다. 이름이 다를 수 있다 — 추측 금지.

```
Bash: ls web/src/domains/$ARGUMENTS 2>&1
Bash: find src/main/java -maxdepth 4 -type d -iname "*$ARGUMENTS*" 2>&1
```

BE 쪽이 바로 안 걸리면 도메인명 변형으로 재검색한다 (예: `coupons`→`coupon`, `events`→`event`, `notices`→`notice`, `authentication`→`oauth`). 둘 다 실제 경로를 찾을 때까지 1단계로 넘어가지 않는다.

---

## 1. BE/FE 병렬 리뷰 (agent 2개 동시 dispatch)

`subagent_type: general-purpose` × 2 — 한 메시지에 동시 호출.
왜 general-purpose: 이 리뷰는 "기획 부합도"(developer-analyze)나 "구현 사이클"(backend/frontend-developer) 이 아니라 자유 형식 버그 헌팅이라, 전용 agent 의 내장 구조와 안 맞는다. 대신 아래 brief 로 범위·금지·출력 형식을 촘촘히 박아 채운다.

**공통 brief (양쪽 다 반드시 포함)**
- **코드 Edit 금지** — 리뷰만, 산출물 파일만 Write
- **git checkout/switch/commit/push 금지**, 시작·종료 2회 `git branch --show-current` 확인 (`review-code` 유지)
- 상대 영역 Edit 금지 — BE agent 는 `web/**` 손대지 않음, FE agent 는 `src/main/**` 손대지 않음
- **⚠️ DB 접속·쿼리 실행 금지** — test DB = prod DB 동일 인스턴스
- **재현 시나리오를 못 쓰면 버그가 아니다** — 확신 없으면 `추정` 표시
- 의도한 구현을 버그로 오인 금지, 스타일·취향 지적 금지
- 프로젝트 전제 (오인 지적 방지): B2C 단일 권한 모델(Role 분기 없음) · MyBatis + MariaDB(JPA 아님) · React + Redux Toolkit + JSX(TypeScript 아님) · mobile-first 단일 모드(PC 부재는 결함 아님) · 도메인 Screen 자체 헤더 금지(글로벌 MobileLayout TopBar 사용) · 단일 페이지 상태분기형은 sub컴포넌트 분리 최소화가 규칙
- 컨벤션 대조: `docs/convention/backend.md`(BE) / `docs/convention/frontend.md`(FE)
- 찾을 것 우선순위: 인증·인가 결함 → 정확성 버그 → SQL 인젝션(MyBatis `${}`) → 리소스 누수 → 죽은 코드/과설계
- 보고 형식: 산출물 경로 / 읽은 파일 수 / 심각도별 건수 표 / **높음 항목만** 나열 / 확인 못 한 영역. **80줄 이하**

**BE agent 개별**
- 범위: 0단계에서 확인한 실제 BE 패키지(`src/main/java/**`), 관련 MyBatis XML, 관련 DDL
- 산출: `docs/code-review-v1/$ARGUMENTS/review-be.md`

**FE agent 개별**
- 범위: `web/src/domains/$ARGUMENTS/**` + 공유 코드(store, api client, 라우터 가드 — "알려진 함정" 참고)
- 산출: `docs/code-review-v1/$ARGUMENTS/review-fe.md`

---

## 2. 메인 세션 검증

- agent 보고를 그대로 믿지 않는다. **높음·보통 항목의 `파일:줄`을 직접 열어 확인**
- 심각도 재평가 — 보안 영향이 있으면 올린다
- 여기서 확정한 결과만 3단계 agent 에 넘긴다

---

## 3. 통합 문서 작성 (agent 1개)

`subagent_type: developer-integrate` (cross-validate + mismatch reasoning — opus, CLAUDE.md § 11)
왜 developer-integrate: BE 리뷰와 FE 리뷰는 같은 버그를 양쪽에서 다르게 설명하거나(예: state 미검증을 BE는 "대조 코드 없음", FE는 "저장소 없음"으로 각자 서술) 서로 참조하는 파일을 모른 채 쓰여 있다. 이 mismatch 를 맞춰 하나의 흐름으로 합치는 작업은 sonnet 보다 opus 가 맞는다는 게 기존 모델 정책의 근거다.

**brief**
- 입력: `docs/code-review-v1/$ARGUMENTS/review-be.md`, `review-fe.md` + 2단계에서 메인이 재평가한 심각도
- 산출: `docs/code-review-v1/$ARGUMENTS/README.md`
- frontmatter: `id: CR-<도메인약칭>-001` / `type: code-review` / `phase: dev` / `domain: $ARGUMENTS` / `status: draft` / `portfolio: true` / `updated: <오늘>`
- 구조 고정: 이 문서 읽는 법 → 한 줄 요약 → 점검 범위(+ 도메인 흐름·주요 파일 역할 배경 서브섹션) → 발견 요약 표 → 항목별 상세 → 낮은 심각도 → 적용 순서 → 이 작업에서 얻은 것
- 항목별 상세는 **증상 / 공격·사용자 시나리오 / 원인(파일:줄) / 제약 / 해결 방향 / 선택 근거 / 정리(전→후)** 로 고정
- **주니어 기준 풀어쓰기 5원칙** (핵심 — 반드시 지킬 것):
  1. 용어는 처음 쓸 때 한 줄로 푼다 — 독자가 모른다고 가정한다
  2. 위험은 "누가 무엇을 하면 무슨 일이 생기나" 단계 시나리오로 쓴다. 추상적 서술 금지
  3. 해결은 흐름으로 쓴다 — 어느 파일에서 무엇을 하고 다음 어디로. **완성 코드는 쓰지 않는다** (수정은 별도 라운드)
  4. **대안을 왜 안 골랐는지 반드시 적는다** — 주니어가 배우는 건 결론이 아니라 비교 과정이다
  5. 제약 조건도 설명한다 (예: `STATELESS` 가 왜 특정 해법을 막는지까지)
- 분량 250~350줄. 코드 조각은 3~5줄짜리만, 합계 20줄 이내
- 금지: `Phase`/`P0` 같은 코드형 식별자, 과장·홍보 문구, 사실 변경
- **⚠️ 공개 주의**: 미수정 취약점의 공격 시나리오에 실제 운영 도메인·엔드포인트를 쓰지 않는다. `example.com` 등 예시로 대체 (포트폴리오 공개 대상 문서)
- git checkout/switch/commit/push 금지

---

## 4. 마무리 (메인 세션)

```
Bash: git branch --show-current   (review-code 확인)
Bash: git status --short          (코드 파일 변경 0건 — docs/** 만 있어야 함)
```

커밋은 **메인 세션이** 한다. 브랜치 → PR 경유 (CLAUDE.md § 2-9). agent 에게 커밋을 맡기지 않는다.

---

## 알려진 함정

- **BE/FE 도메인명 불일치** — 예: FE `authentication` ↔ BE `oauth`, FE `coupons` ↔ BE `coupon`, FE `events` ↔ BE `event`, FE `notices` ↔ BE `notice`. 0단계에서 실측 없이 넘어가면 BE agent 가 빈 폴더를 본다
- **공유 코드 누락** — store·api client(`web/src/infra/http/client.js`)·라우터 가드(`AuthGuard.jsx` 등)는 FE agent 범위에 반드시 포함시켜야 한다. 도메인 폴더만 보면 로그인 실패 처리 같은 결함을 놓친다
- **같은 파일 동시 Edit 없음** — 리뷰는 read-only라 충돌 자체가 없지만, 산출물 경로(`review-be.md`/`review-fe.md`)는 분리해서 겹치지 않게 유지한다
- **BE 가 별도 패키지 없이 다른 패키지에 얹힌 경우** — 예: FE `users` 는 BE 전용 패키지가 없고 관련 로직이 `oauth` 패키지(`UserController` 등) 안에 있다. 0단계에서 못 찾으면 "관련 BE 는 인접 도메인 리뷰에 포함됨" 으로 판단하고 진행한다

---

## 작업 룰

- agent brief 부풀리지 말 것 — 위 최소 brief로 충분 (memory: feedback_agent_brief_minimal.md)
- 메인 세션 보고는 단계마다 200자 내 (CLAUDE.md § 7)
- 산출물 위치 절대: 모두 `docs/code-review-v1/{domain}/` 아래. 중간 리뷰는 `review-{be,fe}.md`, 최종 통합 문서는 `README.md`
- 트랙 외 작업(DB 마이그레이션·CI 등) 끼워넣기 금지

| 산출물 | 위치 | 성격 |
|---|---|---|
| BE 리뷰 | `docs/code-review-v1/{domain}/review-be.md` | 중간, 비공개, 80줄 |
| FE 리뷰 | `docs/code-review-v1/{domain}/review-fe.md` | 중간, 비공개, 80줄 |
| 통합 문서 | `docs/code-review-v1/{domain}/README.md` | 최종, **포트폴리오 공개 대상**, 250~350줄 |

다음 도메인부터는 이 파일을 고치지 않고 `/code-review-doc {domain}` 만 다시 실행한다.
