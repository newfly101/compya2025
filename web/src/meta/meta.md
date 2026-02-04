# 📘 Meta 정보 작성 가이드

이 문서는 컴프야펀 프로젝트에서 사용하는 **Meta 정보의 목적과 작성 방법**을 정의한다.  
Meta는 단순한 UI 표시용 데이터가 아니라, **운영·버전·변경 이력의 기준(Source of Truth)** 으로 사용된다.

---

## 1. Meta의 목적

Meta는 다음을 위해 존재한다.

- 페이지/컨텐츠 단위의 **버전 관리**
- 마지막 사용자 체감 변경 시점 기록
- 공지사항 및 변경 로그 생성 기준
- 컨텐츠의 운영 상태(STABLE, DRAFT 등) 명시
- GitHub 커밋 및 PR과 연결되는 릴리즈 선언 지점

Meta는 **기능 로직이나 런타임 제어를 하지 않는다.**  
오직 “운영 정보”만을 담당한다.

---

## 2. Meta 파일 위치 규칙

모든 Meta 파일은 아래 경로에서 중앙 관리한다.

```markdown
src/meta/
├─ pages/
│ ├─ dictionary.meta.js
│ ├─ dictionaryPitcher.meta.js
│ └─ ...
├─ index.js
└─ types.js
```

- `pages/` : 페이지(라우트) 단위 Meta
- `index.js` : 전체 Meta Registry
- `types.js` : 공통 enum 및 상수

---

## 3. Meta 기본 구조

아래는 표준 Meta 구조이다.

```js
import { META_STATUS } from "@/meta/types";

export const SAMPLE_META = {
  id: "unique_page_id",
  route: "/route/path",

  title: "페이지 제목",
  version: "1.0.0",
  lastUpdated: "YYYY-MM-DD",

  status: META_STATUS.STABLE,

  notify: true,
  summary: "이번 버전에서 사용자에게 보이는 변경 요약",

  changelog: [
    {
      version: "1.0.0",
      date: "YYYY-MM-DD",
      type: "release",
      description: "최초 공개",
    },
  ],
};
```

## 4. 필드별 설명

### 4.1 id

```js
id: "dictionary_home"
```

- Meta를 식별하기 위한 고유 ID
- snake_case 사용 권장
- 절대 변경하지 않는다

### 4.2 route

```js
route: "/dictionary"
```

- 해당 Meta가 대응하는 페이지의 URL 경로
- 라우트 기반 Meta 조회 시 사용됨

### 4.3 title

```js
title: "조합 추천 백과사전"
```

- 페이지 헤더 및 공지에 사용되는 공식 제목

### 4.4 version

```js
version: "1.0.0"
```

- 사용자 체감 변경 기준 버전
- 기능 추가, UX 변경, 컨텐츠 확정 시 증가
- 내부 리팩토링만 있을 경우 증가시키지 않음

### 4.5 lastUpdated

```js
lastUpdated: "2026-02-04"
```

- 해당 version이 릴리즈된 날짜
- YYYY-MM-DD 형식 고정

### 4.6 status

```js
status: META_STATUS.STABLE
```

- 컨텐츠의 운영 상태를 나타낸다.

상태 의미

| 상태         | 설명            |
|------------|---------------|
| DRAFT      | 작업 중 / 구조 미확정 |
| STABLE     | v1.x 안정화 상태   |
| LEGACY     | 유지보수만 진행      |
| DEPRECATED | 향후 제거 예정      |

### 4.7 notify

```js
notify: true
```

- true일 경우 공지사항 및 업데이트 목록에 포함
- 내부 테스트용 페이지는 false로 설정 가능

### 4.8 summary

```js
summary: "백과사전 진입 카드(투수/타자/코치/구단) 구성"
```

- 이번 버전의 변경 내용을 한 문장으로 요약
- 공지 및 릴리즈 노트의 기본 문구로 사용됨

## 5. changelog 작성 규칙

### 5.1 changelog의 역할

- Meta의 과거 변경 이력을 기록
- GitHub Release Note 및 Notion 문서와 1:1 대응
- 최신 항목이 항상 배열의 맨 위에 위치

### 5.2 changelog 구조

```js
changelog: [
  {
    version: "1.0.1",
    date: "2026-02-10",
    type: "feature",
    description: "간편/상세 보기 토글 UI 추가",
  },
];
```

### 5.3 type 값 정의

| 상태       | 설명        |
|----------|-----------|
| type     | 	의미       |
| release  | 	최초 공개    |
| feature  | 	기능 추가    |
| ui	      | UI/UX 개선  |
| fix	     | 버그 수정     |
| refactor | 	내부 구조 개선 |
