# CHANGELOG

> 형식: [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 변형 — **기능 버전 + 플랫폼 버전** 두 축을 함께 기록한다.
> 버전 규칙: [`docs/convention/versioning.md`](./convention/versioning.md)

## 작성 규칙

- 섹션 제목: `## [vX.Y.Z] (platform-A.B) — YYYY-MM-DD` · 플랫폼만 바뀐 경우 `## [platform-A.B] — YYYY-MM-DD`
- 새 항목은 먼저 `[Unreleased]` 에 쌓고, 릴리스 때 버전 섹션으로 옮긴다
- 이용자 관점 문장으로 쓴다. 커밋 해시는 대표 1~3개만 괄호로
- 분류 (해당 없는 분류는 생략)

| 분류 | 축 | 내용 |
|---|---|---|
| `Added` | 기능 | 새 화면·기능 |
| `Changed` | 기능 | 기존 기능 개선·동작 변경 |
| `Fixed` | 기능 | 버그 수정 |
| `Removed` | 기능 | 없어진 기능·화면 |
| `Admin` | 기능 | 운영자 전용 변경 |
| `Platform` | 플랫폼 | 언어·프레임워크·상태관리·스키마 세대·모듈 구조 변경 |
| `Internal` | — | 버전에 영향 없는 리팩터·문서·배포·SQL 정리 |

---

## [Unreleased]

> 기능 버전 bump 없음 / `platform-2.0` 유지 — 아래는 모두 작업환경·문서 정비

### Added
### Changed
### Fixed
### Admin
### Platform
### Internal
- Claude 작업환경 재정비 — `.claude` 구조 개편·라우팅 규칙(tool-routing) 신설·무료 도구 5종 연결 (`a5919bd8`)
- 버저닝 컨벤션 도입 — 기능 버전(vX.Y.Z)·플랫폼 버전(platform-X.Y) 2축 정의 + 본 CHANGELOG 기준선 작성 (`5eeac364`)

---

## [v2.0.0] (platform-2.0) — 기준선

> 버저닝 도입 시점의 운영 상태를 기준선으로 선언. 근거: `docs/domain/_roadmap/prd/2026-09-release-log.md`, `docs/domain/_roadmap/prd/v1-mobile-gap.md`, git log.

### Changed
- v1(PC) 화면을 모바일 우선 리뉴얼(v2)로 전환 — v1 PC 화면 코드는 2026-05-09 삭제
- 레전드 재료(평점표)·히스토리 재료 탐색기(`/history-mode/legend`)를 v2 신규판으로 교체
- 공지사항: 제목 기반 주소(슬러그)·이미지 크게보기·배너형 목록 추가

### Added
- 마일리지 저격 경로(`/mileage`) 신규 오픈 — 계산기 탭은 서버 미연동(beta)
- 선수 백과사전(`/players`, 로그인·BETA) 실데이터 전환
- 홈 카카오페이 후원 섹션 (`1c2d76a`)

### Admin
- 어드민을 단일 셸(`/admin/:tab`) + 상단 탭 구조로 재설계, 컨텐츠 동기화 탭 신설

### Platform
- 기준 세대: Spring Boot 3.3.2 + Java 21 + MyBatis/MariaDB · React 19 + Redux Toolkit 2 + Vite 7 (JavaScript) · 현행 스키마 `sql/V3`

### Known
- 서비스 안 됨: 커뮤니티 쓰기·댓글·좋아요 (읽기 전용 유지)
