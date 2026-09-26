# 공용 Badge 컴포넌트 가이드

> 위치: `web/src/global/ui/badge/`
> 총 3종류. 목적과 색상 팔레트에 따라 구분해서 사용한다.

---

## 1. StatusBadge

**파일**: `StatusBadge.jsx` / `StatusBadge.module.scss`  
**목적**: 콘텐츠의 **상태**를 나타냄 (진행 중, 신규, 종료 등)  
**스타일**: 단색(solid) 배경 + 흰색 텍스트, border 없음  
**높이**: 20px

```jsx
import StatusBadge from "@/global/ui/badge/StatusBadge.jsx";

<StatusBadge variant="active" />
<StatusBadge variant="new" />
<StatusBadge variant="hot" label="HOT" />  // label로 텍스트 덮어쓰기 가능
```

| variant     | 기본 레이블 | 배경색                      |
|-------------|------------|----------------------------|
| `active`    | 진행중      | `var(--color-brand-violet)` |
| `new`       | 신규        | `#16a34a` (green)          |
| `hot`       | 인기        | `#ff3b3b` (red)            |
| `ended`     | 종료        | `#2a2e3a` (dark gray)      |
| `pick`      | 추천        | `#2563eb` (blue)           |
| `limited`   | 한정        | `#f59e0b` (amber)          |
| `event`     | 이벤트      | `#ec4899` (pink)           |
| `reward`    | 보상        | `#14b8a6` (teal)           |

**주 사용처**: 이벤트 카드, 쿠폰 카드, 목록 아이템의 상태 표시

---

## 2. LabelBadge

**파일**: `LabelBadge.jsx` / `LabelBadge.module.scss`  
**목적**: 카드/목록에서 **콘텐츠 유형(카테고리)** 분류  
**스타일**: alpha 0.15 채우기 + border 없음, 텍스트는 배경과 동일 계열 색  
**높이**: 20px, border-radius: 3px

```jsx
import LabelBadge from "@/global/ui/badge/LabelBadge.jsx";

<LabelBadge variant="update" />
<LabelBadge variant="patch" />
<LabelBadge variant="update" label={notice.category} />  // 동적 텍스트
```

| variant     | 기본 레이블 | 색상 계열  |
|-------------|------------|-----------|
| `update`    | 업데이트    | purple    |
| `patch`     | 패치노트    | blue      |
| `cafe`      | 공식카페    | gray      |
| `tip`       | 팁          | emerald   |
| `important` | 중요        | yellow    |
| `mustread`  | 필독        | red       |

**주 사용처**: 공지 카드 카테고리, 게시글 목록 분류 태그

---

## 3. PinnedBadge

**파일**: `PinnedBadge.jsx` / `PinnedBadge.module.scss`  
**목적**: **강조/이벤트성** 삽입 — 고정 공지, 중요 표시 등에서 시각적 강조  
**스타일**: alpha 0.18 채우기 + 0.5px solid border, 텍스트 = border 색과 동일  
**border-radius**: 4px (`$radius-sm`)

```jsx
import PinnedBadge from "@/global/ui/badge/PinnedBadge.jsx";

<PinnedBadge variant="important" />
<PinnedBadge variant="cafe" />      // 공식 공지카드 출처 표시
<PinnedBadge variant="mustread" />
```

| variant     | 기본 레이블 | 색상 계열  |
|-------------|------------|-----------|
| `update`    | 업데이트    | purple    |
| `patch`     | 패치노트    | blue      |
| `cafe`      | 공식        | gray      |
| `tip`       | TIP         | emerald   |
| `important` | 중요        | yellow    |
| `mustread`  | 필독        | red       |

> LabelBadge와 동일한 color 팔레트지만 border가 추가되어 더 강한 강조 효과.

**주 사용처**: 공식 공지카드 출처 태그, 고정 공지 강조, 이벤트 삽입 배지

---

## 공통 Props

모든 badge는 동일한 prop 인터페이스를 가진다.

| prop      | 타입     | 기본값          | 설명                              |
|-----------|---------|----------------|----------------------------------|
| `variant` | string  | 각 배지별 상이  | 색상 및 스타일 결정               |
| `label`   | string  | `undefined`    | 설정 시 DEFAULT_LABELS 텍스트 덮어쓰기 |

---

## 사용 판단 기준

```
상태 표시 (진행중/종료/신규...)   → StatusBadge
카드 카테고리 분류 (조용한 태그)  → LabelBadge
강조 / 이벤트성 삽입 (눈에 띄게) → PinnedBadge
```

---

## 현재 사용 현황

| 파일                                                    | 사용 badge         | variant          |
|---------------------------------------------------------|--------------------|-----------------|
| `notices/mobile/components/noticeCard/NoticeCard.jsx`   | `LabelBadge`       | `update`        |
| `notices/mobile/components/officialNoticeCard/OfficialNoticeCard.jsx` | `PinnedBadge` | `cafe`  |
| `notices/mobile/NoticeDetailScreen.jsx`                 | `LabelBadge`       | `update`        |
