# developer-analyze 부록 — 산출물 예시

> 본문: `.claude/agents/developer-analyze.md` § 5, § 10. 규칙 문장(경로·한도·형식 설명)은 본문에 있다 — 여기는 표본 포맷만.

## § 5.1 `analysis.md` 예시 (본문 § 5.1 대응)

```markdown
# {feature} 개발 분석문서

> 입력: docs/features/{feature}/spec.md
> screen-spec: docs/features/{feature}/design.md (있으면)
> 모드: mobile-first
> 작성일: YYYY-MM-DD by developer-analyze

## § 1. 기능 분해

| FN ID | 기능명 (한글) | 기획 ID | 화면 ID | BE | FE | 우선순위 |
|-------|------------|--------|--------|----|----|---------|
| FN-1 | 일정 목록 조회 | SCH-1 | SC-1 | ✓ | ✓ | P0 |
| FN-2 | 일정 상세 조회 | SCH-2 | SC-2 | ✓ | ✓ | P0 |
| FN-3 | 일정 신규 등록 | SCH-3 | SC-3 | ✓ | ✓ | P1 |

## § 2. 의존성 그래프

| FN | 선행 FN | 사유 |
|----|--------|------|
| FN-2 | FN-1 | 목록에서 진입 |
| FN-3 | FN-1 | 목록 화면에 진입 버튼 |

## § 3. BE 작업 명세 (backend-developer 전용)

### FN-1: 일정 목록 조회

| 항목 | 내용 |
|------|------|
| Endpoint | `GET /api/schedule` |
| Query | `status`, `sort` |
| Response | `List<ScheduleResponse>` |
| Mapper | `ScheduleMapper.selectList` |
| 비즈니스 규칙 | is_deleted=false 필터링 |
| 예외 | (없음) |
| DB 권고 | 추가 인덱스 불필요 (기존 schedule_status_idx 사용) |

### FN-2: 일정 상세 조회
...

## § 4. FE 작업 명세 (frontend-developer 전용)

### FN-1: 일정 목록 조회

| 항목 | 내용 |
|------|------|
| Screen | `domains/schedule/mobile/ScheduleScreen.jsx` |
| Route | `/schedule` (PublicRoutes — lazy import) |
| routeMeta | `{ title: "일정", variant: "page" }` |
| routePath | `schedule: "/schedule"` |
| TopBar | `useSetTopBar({ variant: "page", title: "일정" })` |
| Store | `domains/schedule/store/public/{api,endpoints,thunks}.js` + `slices.js` |
| Slice 처리 | `applyAsyncHandlers(builder, fetchSchedules, ...)` |
| API 호출 | `scheduleApi.list(filters)` |
| 상태 분기 | loading / error / empty / normal |
| 컴포넌트 | inline (단일 페이지 상태분기형) |
| store.js | reducer key 추가: `schedule` |

### FN-2: 일정 상세 조회
...

## § 5. cross-domain 정합

| 항목 | BE | FE | 정합 확인 |
|------|-----|-----|---------|
| Endpoint path | `/api/schedule` | `scheduleApi.list` 호출 | path 일치 |
| DTO 필드 | ScheduleResponse | ScheduleCard props | 필드명 일치 |
| 에러 코드 | ScheduleErrorCode | 에러 메시지 매핑 | enum 일치 |
| Route path | `/api/schedule` | `/schedule` | (BE/FE 경로 컨벤션 — 다름 정상) |

## § 6. 자체 평가 결과

| 평가 항목 | 점수/상태 | 비고 |
|----------|---------|------|
| 기획 부합도 | ✓ | 모든 기획 ID 매핑 완료 |
| UI 일관성 | ⚠️ | screen-spec 미존재 — FE 명세 일부 가정 |
| 누락 항목 | 0 | 없음 |
| 위험·가정값 | 5 | decisions.log 참조 |

## § 7. 가정값 / 위험 항목 요약

> 상세: .claude/.progress/<branch>/decisions.log

| 마커 | 항목 | 적용값 |
|------|------|--------|
| 🟨 | 페이지네이션 | 1페이지 20건 |
| 🟨 | 정렬 default | 등록일 내림차순 |
| ❓ | 일정 상태 enum 값 | 기획서 누락 — 임의 3종 정의 |
```

## § 5.2 `spec-delta.md` 예시 (본문 § 5.2 대응)

```markdown
# {feature} spec/design 델타

| 대상 | § | 바뀐 뒤 본문 |
|------|---|------------|
| spec.md | § 3 요구사항 | REQ-SCH-04 일정 상태 enum 3종(예정/진행/완료) 추가 |
| design.md | § 2 화면 목록 | SC-04 일정 상세 화면 추가 |
```

## § 5.3 `decisions.log` 예시 (본문 § 5.3 대응)

```markdown
# {feature} 개발 결정 로그

| 시각 | FN | 마커 | 항목 | 적용값 | 사유 |
|------|-----|------|------|--------|------|
| 2026-05-29 10:30 | FN-1 | 🟨 | 페이지네이션 size | 20 | 일반 default |
| 2026-05-29 10:30 | FN-1 | 🟨 | 정렬 default | 등록일 내림차순 | 일반 default |
| 2026-05-29 10:30 | FN-1 | ❓ | 일정 상태 enum | 3종 (예정/진행/완료) | 기획서 누락 — 임의 정의 |
```

## § 10 보고 템플릿 예시 (본문 § 10 대응)

```
✅ developer-analyze 완료

📂 산출:
- .claude/.progress/<branch>/analysis.md ({N}줄)
- .claude/.progress/<branch>/spec-delta.md ({N}건 또는 변경 없음)
- .claude/.progress/<branch>/decisions.log ({N}건 기록)

🔢 기능 분해: FN-1 ~ FN-{N}
📊 자체 평가:
- 기획 부합도: ✓ / ⚠️ ({사유})
- UI 일관성: ✓ / ⚠️ ({사유})
- 누락 항목: {N}
- 위험·가정값 적용: {N} (default)

다음 단계:
- backend-developer 호출 (input: analysis.md)
- frontend-developer 호출 (input: analysis.md)
- 양쪽 완료 후 developer-integrate 호출
```
