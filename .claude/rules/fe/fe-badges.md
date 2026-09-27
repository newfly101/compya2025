---
paths:
  - "web/src/global/ui/badge/**"
  - "web/src/domains/**/mobile/**"
---
# 공용 Badge — 코드 기준으로 재작성 필요 ❓

> `docs/convention/badge-components.md`(2026-08) 는 낡았다 — variant 표 3개가 전부 현재 코드와 다르다. 이 파일은 `web/src/global/ui/badge/*.jsx|.module.scss` 를 읽고 다시 쓴다. 아래는 2026-09-28 기록에서 확인된 것만.

## 확인된 현재 상태 (cat-palette-apply · design.json)

| 컴포넌트 | 살아있는 variant | 비고 |
|---|---|---|
| `StatusBadge` | `active`(진행중) `ended`/`expired`(종료) | 신규·인기·추천·한정·이벤트·보상 6종 삭제(`914623a9`). 불투명 채움 + 흰 글자 |
| `LabelBadge` | **파일 없음** | `LabelBadge.module.scss` 삭제됨 — 문서에서 지운다 |
| `PinnedBadge` | `catNew`(NEW, `--color-cat-new` 불투명) · `mark`(중요, `-cat-mark` 18%) · `neutral`/`cafe`(BETA·준비중·공식·태그명, `-cat-neutral` 18%) · community 전용 `new` `important` `mustread` `hot`(동결 — 값·호출부 그대로) | 분류 축 팔레트. `hot` 은 폐기 확정, 코드 제거는 동결 해제 후 |

## 판단 기준 (유지)

```
상태 (진행중/종료)                → StatusBadge
분류 (NEW/중요/BETA/공식/태그)     → PinnedBadge + cat-* 토큰
```

새 variant 는 `fe-design.md` § 4 분류 4색 안에서만. 등급 표시는 뱃지가 아니라 등급 축 토큰.

## 재작성 시 채울 것

- [ ] 각 컴포넌트 props (`variant` · `label` 덮어쓰기) 를 코드에서 확인
- [ ] variant ↔ 토큰 ↔ 채움 방식 표
- [ ] 사용처는 표로 적지 않는다 — `grep -rn "Badge" web/src --include=*.jsx`
