---
feature: gamification
version: 1.1.0
status: active
created: 2026-10-08
updated: 2026-10-08
---

# 등급·포인트·칭호

## 1. 무엇을 하는 기능인가

방문과 저장 활동으로 경험치(XP)와 포인트를 쌓고, XP 로 10단계 등급이 오르며, 조건을 채우면 칭호를 받는다. 이용자는 마이페이지에서 등급·포인트·칭호·최근 내역을 보고 대표 칭호를 고른다. 상점·스킬 시뮬레이션·카드 키우기·커뮤니티 연동은 아직 없다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| SC-09-01 마이페이지 등급 요약·이동 행 | `/mypage` | 로그인 사용자가 앱을 열면 하루 첫 방문이 자동 기록된다 (현재 관리자만 노출) |
| SC-09-02 등급 모달 · 칭호 등록 모달 | `/mypage` 위 | 마이페이지 이동 행에서 연다 |
| SC-09-03 출석 토스트 | 전 화면 | 하루 첫 방문 때 잠깐 뜬다 |
| SC-09-04 활동 내역 | `/mypage/history` | 마이페이지 "XP·포인트 내역" 행 |
| 가이드 | `/guides/gamification` | 등급 모달의 "전체 안내 보기"로만 들어온다(가이드 목록에는 없음) |

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-GM-01 | 하루 첫 방문 | 10XP + 100P, 한국 시간 자정 기준 하루 1회 | `GamificationService` |
| REQ-GM-02 | 저장 | 컬렉션 변경 저장·레전드 스킬 저장 1회당 2XP, 하루 5회까지. 계정 첫 저장은 20XP 1회 | `GamificationEventListener` |
| REQ-GM-03 | 연속 출석 | 7일 연속마다 100P | `RewardService` |
| REQ-GM-04 | 등급 | 누적 XP 50·150·400·800·1,500·2,500·4,000·6,000·9,000 에서 Lv.2~10 (연습생~명예의 전당). 오를 때 보너스 포인트 100·150·250·400·600·750·1,000·1,250·1,500 | `sql/draft/gamification/02_gamification_seed.sql` |
| REQ-GM-05 | 칭호 | 4종: 얼리어답터(1,000P), 개근상(7일 연속 30P), 철인(30일 연속 150P), 버그 헌터(운영자 지급 100P). 별도로 GM — 운영자 전용, 수동 지급(1,000,000P, 이용자 안내 제외). 대표 칭호 1개 장착·해제 | 위 시드 |
| REQ-GM-06 | 얼리어답터 | 2026-01-28~06-01 에 가입하고 10-01 이후 로그인 또는 방문 기록이 있으면 받는다(1,000P). 가입 시기별 세분 칭호는 없다 | 사용자 결정 |
| REQ-GM-07 | 원장 | 모든 증감은 원장에 한 줄씩 남고 같은 보상은 두 번 지급되지 않는다. 회수는 음수 행 | `site_reward_ledger` |
| REQ-GM-08 | 운영 | 지급·회수는 `/api/admin/gamification` 에서만. 일괄 지급은 시험 실행(dryRun)이 기본 | `AdminGamificationController` |
| REQ-GM-09 | 등급·칭호 조회 | 이용자는 등급 10단계 표, 모든 칭호(받은 것·잠긴 것과 받는 조건), XP·포인트 내역을 따로 볼 수 있다. 내역은 20건씩 "더 보기" | `GamificationService` |
| REQ-GM-10 | 출석 알림 | 하루 첫 방문이 기록되면 "+10 XP · +100P" 를 잠깐 보여주고, 등급이 오르면 "Lv.N 등급명로 올랐어요" 로 바꾼다 | `GamificationService.checkIn` |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 설정 | `site_reward_rules` · `site_reward_levels` · `site_titles` | 초안만 있음(미적용) |
| 기록 | `site_reward_ledger` · `site_reward_activity` · `site_user_titles` | 초안만 있음(미적용) |
| 이용자 API | POST `/api/gamification/check-in` · GET `/api/gamification/me` · PUT `/api/gamification/me/title` · GET `/api/gamification/titles` · GET `/api/gamification/levels` · GET `/api/gamification/me/history?type=XP\|POINT&page=` | 로그인 필요. 새 테이블 없음 |
| 운영자 API | POST `/api/admin/gamification/early-adopters/grant` · POST `/adjust` · GET `/users/{publicId}/ledger` | ADMIN |

## 5. 하지 않는 것

- 상점·스킬 시뮬레이션·카드 키우기·커뮤니티 XP — 기획서 11-2 3단계 이후.
- 포인트 소급 지급·프로필 설정 보상·기능 스위치 — 기준 미정.
- 운영자 화면 — 일회성이라 API 만.
- 등급 색은 5단계(루키~레전드)로 정했고 야구공 그림은 직접 그린 것만 쓴다. 상점은 "준비 중" 안내만 있다.

## 6. 확인 필요

- 🔴 테이블 생성(DDL)과 운영 일괄 지급 실행은 사용자 재승인 후.
- ❓ 저장 XP 하루 횟수(5 가정) · 설정 캐시 반영 방식.
- 🟨 2차 화면은 현재 관리자(id 1)에게만 보인다. 전체 공개는 별도 결정.
