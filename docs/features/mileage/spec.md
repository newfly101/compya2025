---
feature: mileage
version: 1.0.1
status: active
created: 2026-09-05
updated: 2026-09-28
---

# 마일리지

## 1. 무엇을 하는 기능인가

이름은 "마일리지 계산기"지만 실제로는 마일리지 뽑기로 목표 레전드 재료 카드에 도달하는 최적 경로를 추천하는 도구다. 다음에 구단을 돌릴지 연도를 돌릴지, 그리고 후보가 뜰 순서를 알려준다. 최종 기대 비용 숫자는 의도적으로 화면에 내지 않는다. 별도 탭에서는 구단×연도×포지션 조합이 유일해서 "저격 가능한" 레전드 재료 카드 목록을 검색·정렬해 볼 수 있다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| SC-16-01 마일리지 저격 경로 — 시뮬레이션 탭 | `/mileage` (`?tab=calc`, 기본값) | 홈 퀵메뉴·서랍, 저격 선수 리스트 탭 행 클릭, 레전드 평점표의 저격 링크 |
| SC-16-01 마일리지 저격 경로 — 저격 선수 리스트 탭 | `/mileage?tab=list` | 화면 안 탭 전환 |
| SC-16-01 내부 서브뷰 — 구단×연도 표 | `/mileage` 내부 상태(`view==='table'`, URL 분리 없음) | 시뮬레이션 탭의 "구단 × 연도 표 보기" 버튼 |

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-MLG-01 | 뽑기 비용 | 구단 200 / 연도 400, 매번 후보 7개(`SHOWN`) 중 최선 하나를 뽑는다 | `web/src/domains/mileage/config/mileage.js:43-45` |
| REQ-MLG-02 | 다음 수 추천 | 값 반복(Gauss-Seidel, 60회)으로 상태공간(구단×연도)의 기대비용을 풀어, 매 상태에서 구단/연도 중 싼 쪽을 추천한다 | `mileage.js:160-190` |
| REQ-MLG-03 | 기대비용 비노출 | 계산은 하지만 기대비용 수치 자체는 화면에 내지 않는다 — 마일리지는 개인화·추적이 필요한 영역이라 일반화된 수치 노출이 부적절하다는 확정 설계다 | `mileage.js`의 `buildHeroData` export에 비용 필드 없음, `MileageScreen.jsx:454-474` |
| REQ-MLG-04 | 알고리즘 변경 금지 | `weightsFor`/`solve`/`ePick`는 손계산·몬테카를로로 검증된 것으로, 리팩터·최적화 금지 | `mileage.js:8-10` |
| REQ-MLG-05 | 포지션 선택 미반영 | 포지션 선택 UI는 있으나 DP 계산에는 반영되지 않는다(안내용). 화면에 "데이터 연결 전"으로 이미 라벨링돼 있다 | `MileageScreen.jsx:398-399` |
| REQ-MLG-06 | 저격 대상 판정 | 구단×연도×포지션 칸에 `data_player_card`가 `COUNT(DISTINCT player_name) = 1`이면 저격 가능(주포지션 OR 부포지션) | `MileageMapper.xml:22-51` `findSniperTargets` |
| REQ-MLG-07 | 리스트→시뮬레이션 자동 채움 | 부포지션만 유일하면 그 칸으로 좁히고, 그 외(주만 유일/이론상 둘 다 유일)는 주포지션으로 좁힌다. "둘 다 유일"은 실측 0건이라 사용자가 고르게 하는 화면은 만들지 않는다 | `MileageScreen.jsx:61-91` `resolveSniperTarget` |
| REQ-MLG-08 | 레전드 미정 카운터 미표시 | 저격 대상 API가 레전드-재료를 INNER JOIN으로 조회해 `legendName`이 항상 non-null이다. 존재할 수 없는 "레전드 미정" 카운터 UI는 만들지 않는다 | `TargetListTab.jsx:1-7`, `MileageMapper.xml`(INNER JOIN) |
| REQ-MLG-09 | 캐시 갱신 | 저격 대상 목록은 서버 메모리 캐시(TTL 없음)로 응답한다. DB를 직접 고쳐도 자동 반영되지 않고, 관리자가 캐시 동기화 버튼을 눌러야 반영된다 | `MileageServiceImpl`, `POST /api/admin/cache-sync/mileageSniperTarget/sync` |
| REQ-MLG-10 | 중복 요청 방지 | 저격 대상 목록 조회는 "이미 불러왔는지"와 "지금 불러오는 중인지"를 모두 검사해 같은 순간 중복 요청을 막는다 | `store/public/thunks.js`, `history.md` 2026-09-28 |
| REQ-MLG-11 | 초기화 없음 | 시뮬레이션에 "리셋" 행동을 추천하지 않는다 — 리셋 비용이 모든 목표 대비 항상 손해라는 계산 결과다 | `MileageScreen.jsx:349-354` |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 구단 목록·계보(20개) | FE 상수 `TEAMS_RAW` (`config/mileage.js`) | DB `teams` 테이블 없음 — 이 배열이 유일한 원본 |
| 저격 선수 리스트 | `GET /api/mileage/sniper-targets` (인증 불필요, 서버 캐시 1시간 + ETag) | 조회 전용 1개. 원천은 `data_player_card`/`data_player_legend_material`/`data_player_legend` (players/legend 도메인 소유, mileage는 조회만) |
| 다음 수 추천 계산 | 서버 호출 없음 — `mileage.js`의 `solve`/`ePick`/`weightsFor`가 FE에서 순수 함수로 실행 | beta, DB 연동은 다음 라운드 |

## 5. 하지 않는 것

- 목표 카드를 선수 백과사전 등에서 골라 시뮬레이션에 바로 연결하는 흐름 — 현재는 저격 선수 리스트 탭을 거치거나 구단/연도를 직접 선택해야 한다
- 포지션 선택을 DP 계산에 반영 — 서버 연동 전까지는 라벨 표시용
- 계산기 탭의 서버 API·DB 연동 — 확정(2026-09-30) 하지 않는다. 예상 마일리지 계산 기능도 만들지 않는다

## 6. 확인 필요

- ❓ 카드 한 장이 주포지션·부포지션 모두에서 유일한 경우가 실제 운영 데이터에 있는지 FE 주석(0건)과 BE DTO 주석(있음)이 서로 다르다 — DB 접속 제약으로 미확인
- 🟨 이 기능은 README 기준 "개발중"이지만 저격 선수 리스트는 이미 서버 연동돼 운영 중이라 `status: active`로 둔다. 계산기 탭의 beta 상태는 § 5 참조
