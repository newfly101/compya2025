# Admin Components v1 — 2단계 인수인계

> 1단계(부품 9종 + VisibleToggle Component 승격) 산출물. 2단계(화면 7장을 인스턴스로 조립)가 여기 이름을 그대로 써서 인스턴스를 뽑는다.
> 코드: `figma-plugin/domains/admin-components.ts` (신규) + `figma-plugin/shared/tokens.ts`, `helpers.ts` (확장)
> 빌드: `npm run build` 통과 확인 완료.

## 배치 위치

캔버스에서 `x: 10000, y: 0` 지점에 `✦ Admin Components v1` 이름의 섹션 프레임 하나로 정리돼 있다. 기존 admin 화면 7장(node `16:103` 등)·`Design System v3.0`(node `101:4951`)의 실제 좌표를 읽지 않고(범위 밖 — 읽지도 지우지도 말라는 지시 준수) 충분히 먼 좌표를 임의로 잡은 것이다. **실제 Figma에서 겹치는 게 확인되면 섹션 프레임(`✦ Admin Components v1`) 전체를 이동만 하면 된다 — 내부 컴포넌트 재생성 불필요.**

재실행 시 `Helpers.cleanupByName(['✦ Admin Components v1'])` 가 현재 페이지 직계 자식 중 동명 프레임을 지우고 다시 그린다. 페이지 직계 자식만 검사하므로 admin 화면 7장·DS v3.0 은 절대 건드리지 않는다.

## 컴포넌트 이름 · variant 표

Figma variant 표준 이름 규칙(`prop=value, prop=value`)을 그대로 썼다. 개별 variant 를 인스턴스화하려면 `Helpers.createInstance('variant=primary, size=md, state=default')` 처럼 **콤마+공백 포함 정확한 문자열**을 넘긴다.

| ComponentSet 이름 | variant 축 | 값 | 개수 |
|---|---|---|---|
| `C/Button` | variant × size × state | primary/secondary/danger × md/sm × default/pressed/disabled/loading | 24 |
| `C/Field` | type × state | text/number/date/select/checkbox × default/focus/error/disabled | 20 |
| `C/SearchField` | state | default/focus/disabled | 3 |
| `C/FilterChip` | state | default/selected/focus | 3 |
| `C/ConfirmDialog` | tone | default/danger | 2 |
| `C/Badge` | variant | filled/outline/subtle | 3 |
| `C/Card` | variant | default/media/highlight/compact | 4 |
| `C/ListItem` | variant | default/compact/with-meta/with-action | 4 |
| `C/VisibleToggle` | state | on/off/disabled | 3 |
| `C/FormPanel` | (없음 — 단일 Component) | — | 1 |

**variant 이름 예시** (그대로 복붙해서 `Helpers.createInstance()` 에 넘기면 된다):
- `variant=primary, size=md, state=default`
- `type=select, state=error`
- `state=selected` (FilterChip)
- `tone=danger` (ConfirmDialog)
- `variant=media` (Card)
- `state=on` (VisibleToggle)
- `C/FormPanel` (variant 없이 이름 그대로)

## 헬퍼 함수 시그니처 (`shared/helpers.ts` 신규 — namespace `Helpers`)

```ts
// 이름으로 Component 를 찾는다. ComponentSet 안 특정 variant 는 위 표의 variant 이름 문자열을 그대로 넘긴다.
Helpers.findComponent(name: string, root?: BaseNode & ChildrenMixin): ComponentNode | null

// 이름으로 인스턴스 1개 생성. 못 찾으면 즉시 throw (오탈자 방지 — try/catch 로 감싸서 써라).
Helpers.createInstance(name: string, root?: BaseNode & ChildrenMixin): InstanceNode

// 여러 ComponentNode 를 ComponentSet 으로 묶는다 (1단계에서 이미 다 씀 — 2단계는 보통 안 씀).
Helpers.combineVariants(components: ReadonlyArray<ComponentNode>, setName: string, parent?: BaseNode & ChildrenMixin): ComponentSetNode

// 이름이 같은 "현재 페이지 직계 자식" 을 지운다. 화면 7장을 다시 그릴 때 동일 패턴으로 재실행 정리에 써도 된다.
Helpers.cleanupByName(names: ReadonlyArray<string>): void
```

**사용 예시**:
```ts
const saveBtn = Helpers.createInstance('variant=primary, size=md, state=default');
saveBtn.resize(INNER_W, 44); // Auto Layout 부모에 넣을 때는 layoutAlign='STRETCH' 로 폭 맞추는 걸 권장
parentFrame.appendChild(saveBtn);
```

`root` 인자를 생략하면 `figma.currentPage` 전체에서 찾는다 — `✦ Admin Components v1` 섹션이 페이지에 남아있는 한 계속 찾아진다. **섹션 프레임을 지우면(예: 정리 스크립트 오작동) 인스턴스가 끊긴다** — 화면 조립 코드가 실행되는 동안은 섹션을 지우지 말 것.

## `tokens.ts` 변경 사항

- **새 색 8개 추가**(DESIGN.md 이름 그대로): `alertRed` `#e84141`, `cautionAmber` `#e8d541`, `actionIndigo` `#6c5ce7`, `textCode` `#d9d3e0`, `textPlaceholder` `#7c6f8f`, `violetPale` `#ede0ff`, `violetLight` `#c9a5f8`, `dugoutPlum` `#3c1e50`, `surfaceCommunity` `#19284b`
- **레거시 별칭 값 정정** (이름은 유지 — admin-*.ts 4개·applayout.ts 가 참조 중이라 이름 변경 안 함): `modalBtn` raw indigo `#6366f1` → `#6c5ce7`(action-indigo), `iconSuccess` raw green `#4ade80` → `#03c75a`(naverGreen), `iconFail` raw red `#f87171` → `#e84141`(alertRed), `modalText` raw `#e5e7eb` → `#d9d3e0`(textCode). **판단 필요**: modalText → textCode 매핑은 DESIGN.md에 정확히 대응하는 색이 없어 가장 가까운 값으로 흡수한 것 — 정밀 매칭은 아님.
- **신규 토큰**: `RADIUS.xs = 2`, `ALPHA.borderStrong`(흰색 12%), `LAYOUT.screenW = 375`(admin/home 대표 렌더 폭, 기존 각 파일이 `const W = 375` 로 각자 선언하던 것을 대체 가능), `LAYOUT.screenMax = 480`(DESIGN.md 상한, 지금은 안 씀), `BADGE_STATUS`(신규/인기/종료/추천/한정/이벤트/보상 7색 — `Tokens.BADGE_STATUS.new` 형식으로 접근)
- `FS`(글자 9단계)·`SPACE`(간격 9단계)는 **변경 없음** (이미 DESIGN.md와 일치 확인됨)
- `LAYOUT.mobileLg`(428, applayout 전용)는 **그대로 유지** — `LAYOUT.screenW`(375)와 다른 값이니 혼동 주의. admin 화면은 375(`screenW`) 기준.

## 2단계에서 주의할 점

1. **`C/FormPanel`은 variant가 없다** — `Helpers.createInstance('C/FormPanel')`로 바로 인스턴스화. 내부에 `.Slot (children)` 이라는 이름의 자리표시 프레임이 있는데, 실제 화면에서는 이 자리에 `Field` 인스턴스들을 다시 append 하거나, `.Slot` 을 지우고 그 위치에 직접 넣어야 한다 (컴포넌트 인스턴스 내부 자식은 오버라이드는 가능하나 구조 변경은 제한적 — 상황에 따라 `.Slot` 프레임을 숨김 처리하고 그 옆에 실제 필드를 별도로 쌓는 방식이 더 안전할 수 있다).
2. **`C/FormPanel`은 뒤 막(스크림 55%)을 포함하지 않는다.** 컴포넌트 자체는 시트 카드만 담당 — 화면 조립 시 별도로 전체화면 크기의 `rgba(0,0,0,0.55)` 오버레이 프레임을 시트 뒤에 만들어야 한다 (critique.md 공통문제 1·7번 — 모달 배경에 탭바가 비치는 문제의 원인이 정확히 이 스크림 누락이었다).
3. **`C/ConfirmDialog`의 폭은 고정값(311px)으로 만들어져 있다** — admin-components.md 명세는 "화면 틀 기준 좌우 32px 여백의 상대 폭"이라 진짜로는 반응형이어야 한다. 인스턴스를 부모에 넣을 때 `layoutAlign='STRETCH'` + 부모 padding 32 조합으로 재현하거나, 폭이 다른 화면이면 인스턴스 `.resize()`로 조정해야 한다.
4. **`C/Badge`는 색이 전부 `brand`(터미널 바이올렛) 대표색 1개로만 그려져 있다.** 실제 화면(신규/인기/종료 등 상태 배지)에 쓰려면 인스턴스의 fill/text color를 `Tokens.BADGE_STATUS` 7색 중 해당 값으로 오버라이드해야 한다 — 이 파일은 컴포넌트 "구조"(filled/outline/subtle)만 승격했다.
5. **버튼 라벨이 의미별로 고정돼 있다** (`primary`="저장", `secondary`="취소", `danger`="삭제"). 다른 문구가 필요하면 인스턴스의 텍스트 노드를 오버라이드해야 한다.
6. 겹침 확인이 필요하면 섹션 프레임(`✦ Admin Components v1`) 하나만 옮기면 된다 — 내부 10개 컴포넌트가 전부 그 안에 있다.

## 화면에서 반드시 반영해야 할 것 (critique.md 요약 재확인)

이 부품들을 조립할 때 critique.md가 지적한 아래 사항을 다시 어기지 않도록:
- 노출 토글은 `C/VisibleToggle state=on` (시그널 딥) 사용 — 초록 금지
- 등록/수정 폼은 `C/FormPanel`(바텀시트)만 사용 — 중앙 팝업 금지
- 목록 행 버튼은 `C/Button variant=secondary size=sm` 위주로, `primary`는 화면당 1~2곳만(조명 규칙 10%)
- 삭제 확인은 `C/ConfirmDialog tone=danger` — `window.confirm` 대체
