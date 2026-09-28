# 도메인 이름 계약 · 버전 접미 금지 · legacy 일몰

> 항상 로드. 규칙 문서에는 도메인 이름을 적지 않는다 — 이름은 폴더가 원천이고, 목록은 `.claude/scripts/domain-map.sh` 로 뽑는다. 이름이 적힌 파일은 `*-map.md` 뿐이며 날짜가 붙는다.

## 1. 이름 계약 — 한 기능은 네 자리에서 이름이 다르다

| 자리 | 형태 | 예 (`{name}` = coupons) | 원천 |
|---|---|---|---|
| FE 폴더 | `web/src/domains/{name}` · camelCase · **복수** | `coupons` | **정본** |
| BE 패키지 | `domain/{singular}` · camelCase · 단수 | `coupon` | FE 이름의 단수형 |
| API 경로 | `/api/{kebab-plural}` | `/api/coupons` | FE 이름 kebab |
| `docs/features/{name}` | FE 이름 그대로 | `coupons` | FE |
| 테이블 접두 | `site_` `data_` `fun_` + 단수/복수 자유 | `site_coupons` | BE |
| Redux slice `name` · reducer key | FE 폴더명 | `coupons` | FE |

- 단수·복수 변환만 허용. **철자·어순·단어 자체가 다르면 미스매치** (`historyMode`↔`historyLegend` 사고)
- 이름을 바꿀 땐 네 자리를 **한 커밋**에서 바꾼다. 절반만 바꾸면 그날부터 지도가 거짓말이다
- 새 기능은 FE 폴더 이름을 먼저 정하고, `domain-map.sh` 로 BE 패키지·API 를 대조한 뒤 만든다

## 2. 검사

```bash
bash .claude/scripts/domain-map.sh          # FE ↔ BE ↔ API 대조표 출력, 짝 없는 것은 ❌
```

짝이 없어도 되는 것(정적 도메인 `error` `guides` `odds` `policy`, BE 전용 `oauth` `statistics`)은 스크립트 안 `ALLOW_UNPAIRED` 에 적는다 — 규칙 문서가 아니라 스크립트가 예외 목록을 갖는다.

## 3. 파일·식별자에 버전 토큰 금지

`V1` `V2` `New` `Old` `Legacy` `Mvp` `Tmp` 를 폴더·파일·컴포넌트·함수 이름에 넣지 않는다. 버전은 `docs/features/{name}/spec.md` frontmatter 의 `version` 한 곳에만 있다. 같은 기능의 새 판을 옆에 두고 싶으면 § 4.

## 4. legacy 일몰 (같은 기능 두 벌이 공존할 때)

| 단계 | 하는 일 |
|---|---|
| 1 공존 시작 | 옛 판을 `_legacy/` 폴더로 옮긴다 (라우트·import 는 유지). `spec.md` frontmatter 에 `legacy: { path, sunset: YYYY-MM-DD }` — **일몰일 없으면 금지** |
| 2 전환 | 새 판이 배포되면 라우트를 옮기고 `_legacy/` 는 import 0건 상태로 둔다 (`grep -rn "_legacy" web/src`) |
| 3 삭제 | 일몰일 도달 → 삭제 커밋 (`Removed`), history.md 1항목. 일몰 연장은 사유와 함께 frontmatter 갱신 |

한 도메인에 `_legacy/` 는 **하나만**. 둘째가 생기면 첫째를 먼저 지운다. 세션 시작 stale 검사에 "일몰 지난 `_legacy/`" 를 포함한다.

## 5. UI 탐색은 도메인 밖에서

화면을 여러 안으로 만들어 봐야 할 때 `domains/` 에 v1·v2 를 쌓지 않는다. 순서: Figma(`designer-render`) → 그래도 코드로 봐야 하면 `web/src/_lab/{name}/` (라우트 미등록, 빌드 제외, `.gitignore`) → 채택안만 `domains/{name}/` 으로 옮기고 `_lab/` 은 비운다. `_lab/` 에 있는 것은 리뷰·감사 대상이 아니다.
