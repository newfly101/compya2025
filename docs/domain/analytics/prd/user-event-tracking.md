# 사용자 행동 추적 설계

구글 애널리틱스만으로는 "어떤 콘텐츠를 얼마나 봤고, 어디로 나갔는지"를 우리 DB 안에서
집계·조합할 수 없다. 이 문서는 GA4 는 그대로 둔 채, 같은 시점에 우리 서버에도
핵심 행동을 함께 쌓는 구조를 설계한다. **이번 단계는 설계와 DB 뿐이다. 차트·집계
배치·수집 API 구현은 다음 단계에서 한다.**

---

## 1. 지금 상태

절반은 이미 깔려 있다 — 값은 다 뽑아놓고 파일에만 흘려보내고 있을 뿐이다.

| 항목 | 현재 상태 | 비고 |
|---|---|---|
| 서버 접속 로그 | `AccessLogFilter` 가 모든 요청에서 IP·국가·UA·페이지 URL·referer 를 뽑아 `log.info` 로 남김 | **DB 저장이 없다.** 로그 파일에만 있어 집계 불가, 서버 재시작/로테이션에 취약 |
| 클라이언트 → 서버 헤더 | 모든 axios 요청에 `X-Page-Path`, `X-Referrer`, `X-Page-Url` 헤더가 이미 붙음 (`web/src/infra/http/client.js`) | 서버는 받기만 하고 안 씀. 새 수집 API 도 이 헤더를 그대로 활용 가능 |
| GA4 | `pushEvent` 단일 진입점으로 `page_view`(자동), `coupon_clicked`, `event_clicked`, 로그인/로그아웃 이벤트 전송 중. ADMIN 의 `page_view` 는 제외, localhost 는 GA 로 안 보냄 | 이번 설계는 이 호출 지점들 옆에 서버 전송을 "추가"하는 방식 — GA 코드는 건드리지 않는다 |
| 회원 식별 | `site_users.id` (BIGINT, OAuth 기반) | **비회원을 구분할 수단이 없다** — 지금 구조로는 게스트 흐름을 전혀 못 본다 |
| 외부 이동 | 쿠폰 바로가기, 이벤트 상세, 배당표 출처, 커뮤니티 구버전 글 등에서 `target="_blank"` / `window.open` 사용 | 클릭 시점만 GA 로 감. 서버 DB 에는 전혀 안 남음 — § 5 참고 |

---

## 2. 무엇을 남길 것인가

사용자가 정한 4가지를 기준으로 한다. 세부 조작(필터·탭 전환)은 행이 10배로 늘고
보관 정리 부담이 커져 **이번 범위 밖**으로 뺀다.

| event_type | 발생 시점 | 무엇을 알 수 있나 |
|---|---|---|
| `PAGE_VIEW` | 라우트 진입 시 (기존 `useGA4PageView` 훅 지점과 동일) | 어느 화면을 얼마나 보는지, 화면 간 이동 흐름 |
| `CONTENT_CLICK` | 쿠폰 "바로가기" 클릭, 이벤트 카드 클릭 (`trackCouponGo`, `trackEventClick` 지점과 동일) | 어떤 쿠폰/이벤트가 실제로 클릭·전환되는지 — 콘텐츠 식별자(쿠폰코드/이벤트ID)가 붙는다 |
| `OUTBOUND_CLICK` | 그 외 외부 링크 클릭 (배당표 출처, 커뮤니티 구버전 외부글, 소개/문의 페이지의 외부 링크 등) | 콘텐츠 식별자 없이 "어느 화면에서 어떤 URL 로 나갔는지" |
| `SEARCH` | 검색창 입력 (현재는 선수 백과사전 등에서 클라이언트 필터링 방식 — 서버 호출 없음) | 무엇을 찾는데 결과가 없는지, 검색어 트렌드 |

**이번 범위 밖 제안 (아까운 것들 — 다음 단계 후보)**

| 후보 | 이유로 뺌 |
|---|---|
| 체류 시간 / 스크롤 깊이 | 이벤트 빈도가 매우 높아지고 설계가 복잡해짐 |
| 필터·탭 전환 | 사용자가 명시적으로 이번 범위 제외 |
| 레전드 재료 등 카드 상세 열람 | `CONTENT_CLICK` 과 유사하지만 대상이 매우 많아(선수 수천 명) 별도 설계 필요 |

---

## 3. 게스트를 어떻게 셀 것인가

- **익명 방문자 쿠키 `anon_id`** (UUID v4, 만료 1년) — 쿠키가 없는 요청이 오면 서버가
  발급해 `Set-Cookie` 로 내려준다. 발급 위치는 `AccessLogFilter` 나 그 옆의 전용 필터가
  자연스럽다 (이미 모든 요청을 가로채고 있음).
- 로그인하면 이벤트 행에 `site_users.id` 를 **함께** 기록한다. `anon_id` 는 로그인해도
  그대로 유지 — 로그인 전후 같은 쿠키값이므로 "게스트로 둘러보다 가입까지 이어진 흐름"이
  `anon_id` 하나로 연결된다.
- 로그인 여부와 무관하게 클라이언트 JS 가 이 쿠키를 직접 읽을 필요는 없다 — axios 가
  이미 `withCredentials: true` 라 브라우저가 자동으로 실어 보낸다. 그래서 **HttpOnly 로
  발급해도 무방** (오히려 탈취 방지에 유리, `ACCESS_TOKEN` 과 동일 패턴).

### ⚠️ 개인정보 관점 — `web/src/domains/policy/mobile/PrivacyPolicyScreen.jsx` 대조 결과

| 조항 | 현재 방침 내용 | 이 설계와의 관계 |
|---|---|---|
| 제1조 (수집 항목) | "접속 IP, 쿠키, 방문 일시, 서비스 이용 기록, 브라우저 및 기기 정보"를 자동수집 항목으로 이미 명시 | IP·UA·이용기록 저장 자체는 고지 범위 안에 있다고 볼 여지가 있음 |
| 제2조 (이용 목적) | "서비스 이용 통계 분석 및 품질 개선" 이 이미 목적에 포함 | 행동 이벤트 수집 목적과 부합 |
| 제5조 (쿠키의 사용) | 인증 쿠키 / GA4 분석 쿠키 / AdSense 광고 쿠키 **3종만** 열거 | **자사가 새로 발급하는 `anon_id` 쿠키가 빠져 있다.** 이 쿠키를 심는 순간 제5조에 "자체 분석 쿠키(anon_id, 1년, 방문자 흐름 구분용)" 항목을 추가하는 **방침 개정이 필요하다** |
| 제3조 (보유 기간) | 회원 탈퇴 후 개인정보 보유기간(1개월)만 규정, 행동 로그 자체의 보관기간 규정 없음 | § 4 에서 정하는 보관 정책(예: 원본 N개월)을 제3조 또는 별도 조항에 반영해야 함 |

→ **결론: 어긋난다.** 최소한 제5조에 한 줄, 필요하면 제3조에도 보관기간을 추가해야
방침과 실제 수집이 일치한다. 방침 개정은 이 프로젝트 범위가 아니므로 **별도 작업으로
분리하되, `anon_id` 쿠키를 실제로 심기 전에 선행되어야 한다.**

---

## 4. 테이블 설계

### 4.1 조회 질문을 먼저 정한다 (인덱스는 여기서 역산)

| # | 질문 | 필요한 조건 |
|---|---|---|
| Q1 | 이 쿠폰/이벤트가 몇 번 눌렸나 (기간별) | `event_type='CONTENT_CLICK'`, `content_type`, `content_id`, 기간 |
| Q2 | 어느 화면에서 외부로 가장 많이 나가나(이탈) | `event_type`, `page_path`, 기간 → **집계 비용이 커서 원본 직접 조회는 피함** (§ 4.3) |
| Q3 | 가입 전후 행동이 어떻게 다른가 | 특정 `anon_id` 의 시계열, `user_id` NULL→NOT NULL 전환 시점 |
| Q4 | 일별 순 방문자 수 | `DATE(created_at)`, `COUNT(DISTINCT anon_id)` |
| Q5 | 특정 화면의 조회수 추이 | `page_path`, `event_type='PAGE_VIEW'`, 기간 |
| Q6 | 검색했는데 결과 없는 검색어 | `event_type='SEARCH'`, 기간 (텍스트라 인덱스 효과 적음) |

### 4.2 원본 테이블 — `site_user_event`

이름 제안: `data_` 는 구단·선수 등 게임 콘텐츠 원천 데이터에 쓰는 접두어라(`data_player_card`
등) 여기엔 맞지 않는다. `site_users` 와 같은 결의 `site_` 접두어를 쓴다.
위치 제안: `sql/V3/analytics/CREATE_TABLE_USER_EVENT.sql` (신규 폴더 — 기존 `sql/V3/site/`
는 인증·회원 전용이라 성격이 다름).

```sql
-- =====================================================================
-- 사용자 행동 이벤트 원본 로그
--
-- 1행 = 1회 발생한 행동(페이지뷰 / 콘텐츠 클릭 / 외부 이동 / 검색).
-- 게스트도 anon_id 쿠키로 식별되며, 로그인하면 같은 행에 user_id 가 함께 채워진다
-- (게스트로 둘러보다 가입한 흐름을 anon_id 하나로 연결하기 위함).
--
-- append-only, 쓰기 매우 잦음 — 인덱스는 최소로 유지한다.
-- 무거운 집계(화면별 이탈 랭킹, 일별 방문자 수 등)는 이 테이블을 직접 긁지 않고
-- site_user_event_daily(§4.4) 를 배치로 채워 어드민이 그쪽을 보게 한다.
--
-- 보관 정책: § 4.5 참고. 원본은 영구 보관하지 않는다.
-- =====================================================================

CREATE TABLE site_user_event
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY   COMMENT '이벤트 식별자 (쓰기 성능 우선 — UUID 대신 순차 증가)',

    event_type     ENUM('PAGE_VIEW','CONTENT_CLICK','OUTBOUND_CLICK','SEARCH')
                                NOT NULL                COMMENT '이벤트 종류',

    anon_id        CHAR(36)    NOT NULL                COMMENT '익명 방문자 UUID (쿠키). 로그인 후에도 유지',
    user_id        BIGINT      NULL                     COMMENT 'site_users.id. 로그인 상태일 때만 채워짐. FK 제약은 걸지 않는다(쓰기 비용, 정합성은 앱 레벨 보장)',

    page_path      VARCHAR(255) NOT NULL                COMMENT '이벤트 발생 화면 경로 (X-Page-Path 헤더 재사용)',

    content_type   VARCHAR(20) NULL                     COMMENT 'COUPON / EVENT / ODDS / COMMUNITY 등. CONTENT_CLICK·OUTBOUND_CLICK 일 때만',
    content_id     VARCHAR(50) NULL                     COMMENT '쿠폰코드 / 이벤트ID 등. 콘텐츠 종류가 섞여 VARCHAR로 둠',
    target_url     VARCHAR(500) NULL                    COMMENT '이동한 외부 URL. 이벤트 카드처럼 링크가 없을 수도 있어 nullable',

    search_keyword VARCHAR(100) NULL                    COMMENT 'SEARCH 일 때만. 사용자가 입력한 원문 — 개인 식별 정보가 아닌 검색어만 저장',

    anon_ref       VARCHAR(500) NULL                    COMMENT 'document.referrer',
    country        VARCHAR(10) NULL                     COMMENT 'CloudFront-Viewer-Country 재사용',
    user_agent     VARCHAR(255) NULL                    COMMENT '봇 판별·통계용. 원문 전체가 아닌 앞부분만 잘라 저장',

    extra          JSON        NULL                     COMMENT '스키마에 없는 부가 정보 임시 보관용(예: 이벤트별 추가 파라미터). WHERE·인덱스 대상이 되는 값은 반드시 정규 컬럼으로 승격시킬 것 — JSON 컬럼엔 인덱스를 태우지 않는다',

    created_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '발생 일시. 파티션/정리 기준',

    -- Q1 · Q6 : 종류 + 기간
    INDEX idx_ue_type_created (event_type, created_at),
    -- Q3 : 특정 방문자의 시계열 (가입 전후 비교)
    INDEX idx_ue_anon_created (anon_id, created_at),
    -- Q1 : 콘텐츠별 랭킹
    INDEX idx_ue_content (content_type, content_id, created_at)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT = '사용자 행동 이벤트 원본 로그 — append-only, 정기 정리 대상(§4.5)';
```

> `page_path` 단독 인덱스는 일부러 안 둔다. 카디널리티가 낮고(화면 수가 적음) 이 값이
> 필요한 무거운 집계(Q2, Q5)는 아래 일별 집계 테이블에서 처리한다.

### 4.3 확장 여지 — `extra JSON`

지금 정해진 4가지 이벤트 종류엔 위 정규 컬럼만으로 충분하다. `extra` 는 "나중에 새
이벤트 종류가 생겼는데 컬럼을 또 추가하긴 애매한" 상황을 위한 여유분이다. 예: 쿠폰
클릭 시 정렬 순서, 검색 결과 건수 같은 부가 정보. **자주 필터링하게 되는 값이면 그때
정규 컬럼으로 옮긴다** — JSON 컬럼은 인덱스가 안 붙어 조회가 느리다.

### 4.4 일별 집계 테이블 — `site_user_event_daily` (2단계에서 배치로 채움)

어드민 차트가 실제로 조회할 테이블. 이번 단계엔 스키마만 제안해두고 배치 작업은
다음 단계로 미룬다 (사용자가 "먼저 DB 만들고 데이터 쌓고, 차트는 나중" 이라 명시).

```sql
CREATE TABLE site_user_event_daily
(
    event_date        DATE         NOT NULL COMMENT '집계 일자',
    event_type        VARCHAR(20)  NOT NULL,
    page_path         VARCHAR(255) NULL      COMMENT 'PAGE_VIEW/OUTBOUND_CLICK 집계용, 콘텐츠 집계 행은 NULL',
    content_type      VARCHAR(20)  NULL,
    content_id        VARCHAR(50)  NULL,

    event_count       BIGINT NOT NULL COMMENT '해당 조합의 발생 건수',
    unique_anon_count BIGINT NOT NULL COMMENT '순 방문자 수 (그 날 그 조합을 겪은 anon_id 종류 수)',
    unique_user_count BIGINT NOT NULL COMMENT '그중 로그인 상태였던 건수',

    PRIMARY KEY (event_date, event_type, page_path, content_type, content_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT = '사용자 행동 일별 집계 — 원본 삭제 후에도 영구 보관';
```

### 4.5 보관 기간

- **하루 몇 행이 쌓일지 (가정)**: 현재 실 트래픽 규모를 알 수 없어 가정으로 잡는다.
  일일 순방문자(DAU) 500~2,000명, 방문당 평균 이벤트 5~10건(페이지뷰 위주) 가정 →
  **하루 5천~2만 행**, 월 15만~60만 행, 1년이면 약 200만~700만 행. 1행 평균 300바이트
  가정 시 1년 누적(인덱스 포함) 약 3~5GB — 운영 DB 인스턴스에 부담이 될 수 있는 규모.
- **정리 방침 (제안)**:
  - 원본 `site_user_event` 는 **최근 6개월**만 보관. 매일 새벽 배치가 전날 데이터를
    `site_user_event_daily` 에 반영한 뒤, 6개월 지난 원본은 삭제.
  - `site_user_event_daily` 는 **영구 보관** (행 수가 원본보다 훨씬 적고, 어드민이
    "작년 대비"를 물을 수도 있음).
  - 삭제는 `DELETE` 보다 `created_at` 기준 월별 `RANGE COLUMNS` 파티션 + `DROP PARTITION`
    이 훨씬 가볍다 — 대상 테이블이 append-only 라 파티션 전략과 잘 맞는다.
- ⚠️ **6개월은 가정값이다.** 실제 트래픽을 관측한 뒤 사용자가 확정해야 하는 항목.

---

## 5. 어드민에서 무엇을 볼 것인가

질문 → 쿼리 대상 → 필요 인덱스/테이블까지 역산해 §4 설계가 실제로 답을 낼 수 있는지
검증한다. 모든 질문이 §4.2/§4.4 로 커버된다.

| 질문 (Q) | 조회 대상 | 근거 |
|---|---|---|
| Q1. 이 쿠폰/이벤트 몇 번 눌렸나 | `site_user_event` (실시간성 필요) 또는 `..._daily` (일 단위면 충분) | `idx_ue_content` |
| Q2. 어느 화면에서 가장 많이 이탈하나 | `site_user_event_daily` | 원본에서 매번 `GROUP BY page_path` 는 풀스캔에 가까워 집계 테이블 필수 |
| Q3. 가입 전후 행동이 어떻게 다른가 | `site_user_event` (특정 `anon_id` 단건 조회라 원본으로도 가벼움) | `idx_ue_anon_created` |
| Q4. 일별 순 방문자 수 | `site_user_event_daily.unique_anon_count` | `COUNT(DISTINCT)` 는 원본에서 비싸 집계 시점에 미리 계산해 저장 |
| Q5. 화면별 조회수 추이 | `site_user_event_daily` | 위와 동일 이유 |
| Q6. 검색했는데 결과 없는 검색어 | `site_user_event` (`event_type='SEARCH'`) | 텍스트 집계는 인덱스 효과가 적어 주기적 스크립트로 별도 추출 권장 |

이 표가 성립하지 않으면(질문에 답할 인덱스/테이블이 없으면) §4 를 고쳐야 하는데,
현재는 전부 커버된다.

---

## 6. 성능·안정성

| 항목 | 방법 |
|---|---|
| 수집 실패가 화면에 영향 주면 안 됨 | FE 는 fire-and-forget — 응답을 기다리지 않고 catch 는 콘솔 로그만, throw 금지. 특히 외부 이동 직전(`CONTENT_CLICK`)은 `window.open` 을 막지 않도록 `navigator.sendBeacon` 사용을 우선 검토 — 페이지 언로드 중에도 살아남고 응답 대기가 없음 |
| BE 도 요청 흐름을 막으면 안 됨 | 수집 엔드포인트는 요청을 받자마자 즉시 202 응답, 실제 INSERT 는 `@Async` 로 위임. DB 에러가 나도 이미 응답이 나간 뒤라 사용자 요청엔 영향 없음 |
| 배치 전송 | 이번 단계는 이벤트 1건당 1회 전송(단순함 우선). 트래픽이 커지면 클라이언트에서 짧게 버퍼링 후 배열로 묶어 보내는 방식을 2단계 이후 후보로 남김 |
| 쓰기 ↔ 조회 충돌 | InnoDB row-level lock 이라 insert 끼리는 거의 안 부딪힘. 진짜 문제는 어드민이 원본에 무거운 집계를 매번 날리는 경우인데, §4.4 집계 테이블 분리로 애초에 원본에 무거운 조회를 안 보낸다. 트래픽이 더 커지면 읽기 replica 분리도 후보(이번 규모엔 과함 — 미결) |
| 봇·크롤러 걸러내기 | UA 문자열 1차 필터 (`googlebot`, `bingbot`, `ahrefsbot`, `semrushbot`, `curl`, `python-requests` 등 패턴) — `ClientInfoExtractor` 가 이미 UA 를 뽑고 있어 붙이기 쉬움. 100% 걸러지진 않는다(휴리스틱 한계). 다만 수집 API 는 JS 가 fetch/XHR 로 호출해야만 찍히므로, HTML 만 긁는 단순 크롤러는 애초에 이벤트를 안 쏜다 — 모든 요청을 잡는 `AccessLogFilter` 보다 행동 이벤트 쪽이 봇에 원천적으로 덜 오염된다 |

---

## 7. 단계 나누기

| 단계 | 내용 |
|---|---|
| **1단계 (이번 목표)** | `site_user_event` 테이블 생성 · 수집 API 1개(`POST /api/analytics/events`, 비동기 처리) · 기존 `pushEvent` 호출 지점(4곳: `useGA4PageView`, `couponEvents`, `eventEvents`, 검색 입력)에 서버 전송 추가 · `anon_id` 쿠키 발급 필터 · 개인정보처리방침 제5조 문구 추가(선행 필요, § 3). **차트·집계 배치 없음 — 데이터만 쌓는다** |
| **2단계** | `site_user_event_daily` 배치 집계(스케줄러) · 원본 정리 배치(파티션 `DROP PARTITION`) |
| **3단계** | 어드민 통계 화면 — § 5 질문에 대응하는 조회 API + 차트 UI |

---

## 사용자 판단이 필요한 항목 (요약)

1. **개인정보처리방침 개정** — `anon_id` 쿠키를 제5조에 추가, 보관기간을 제3조 또는
   신설 조항에 반영. `anon_id` 쿠키를 실제로 심기 **전에** 선행돼야 함 (§ 3)
2. **원본 보관 기간 6개월** — 실 트래픽을 모르는 상태의 가정값. 확정 필요 (§ 4.5)
3. **IP 저장 여부** — 이번 설계는 `site_user_event` 에 IP 원문 컬럼을 넣지 않고
   `country` 코드만 남겼다(최소수집 원칙). IP 원문이 꼭 필요하면(예: 어뷰징 추적)
   별도 컬럼 추가 필요 — 방침 제1조엔 이미 IP 가 고지돼 있어 저장 자체는 가능
4. **회원 탈퇴 시 이벤트 행 처리** — `user_id` 를 NULL 로 되돌릴지, 그대로 둘지
   (탈퇴해도 `anon_id` 로는 여전히 식별 가능한 상태로 남는 점을 고려해야 함)
5. **수집 API 경로/이름** — `POST /api/analytics/events` 로 임시 제안. 기존 API 네이밍
   컨벤션(`docs/convention/backend.md`) 과 맞는지 다음 단계에서 확인 필요

---

**history**: 2026-09-10 최초 작성 — 현황 조사(AccessLogFilter/ga.js/client.js) + 4이벤트 설계 + `site_user_event`/`site_user_event_daily` 테이블 + 보관정책 + 개인정보처리방침 대조
