---
created: 2026-09-28
updated: 2026-09-28
---

<!-- 생성 파일: python .claude/scripts/build-traceability.py — 손으로 고치지 말 것 -->

# 요구사항 추적표 — 정적·기타

> [overview/traceability.md](./traceability.md) 에서 분리(150줄 상한). § 1 읽는 법·§ 2 약어표·§ 4 집계·§ 5 빈 자리는 그 문서에 있다.

| REQ | 기능 | 규칙 요지 | 화면(SC) | API | 테이블 | 근거·이력 |
|---|---|---|---|---|---|---|
| REQ-ODD-01 | odds | 목차·상세 조회 | SC-10-01, SC-10-02 | - | - | [spec §3](../features/odds/spec.md) · 2026-09-28 |
| REQ-ODD-02 | odds | 원문 그대로 표시 | SC-10-01, SC-10-02 | - | - | [spec §3](../features/odds/spec.md) · 2026-09-28 |
| REQ-ODD-03 | odds | 비로그인 공개 | SC-10-01, SC-10-02 | - | - | [spec §3](../features/odds/spec.md) · 2026-09-28 |
| REQ-ODD-04 | odds | 잘못된 섹션 접근 | SC-10-01, SC-10-02 | - | - | [spec §3](../features/odds/spec.md) · 2026-09-28 |
| REQ-ODD-05 | odds | 검색 색인 | SC-10-01, SC-10-02 | - | - | [spec §3](../features/odds/spec.md) · 2026-09-28 |
| REQ-GD-01 | guides | 목록·상세 조회 | SC-18-01, SC-18-02 | - | - | [spec §3](../features/guides/spec.md) · 2026-09-28 |
| REQ-GD-02 | guides | 도메인 접힌 가이드 | SC-18-01, SC-18-02 | - | - | [spec §3](../features/guides/spec.md) · 2026-09-28 |
| REQ-GD-03 | guides | 안내 문구와 실제 정책 일치 | SC-18-01, SC-18-02 | - | - | [spec §3](../features/guides/spec.md) · 2026-09-28 |
| REQ-GD-04 | guides | 구조화 콘텐츠 | SC-18-01, SC-18-02 | - | - | [spec §3](../features/guides/spec.md) · 2026-09-28 |
| REQ-GD-05 | guides | 완성편만 노출 | SC-18-01, SC-18-02 | - | - | [spec §3](../features/guides/spec.md) · 2026-09-28 |
| REQ-GD-06 | guides | 노출 순서 | SC-18-01, SC-18-02 | - | - | [spec §3](../features/guides/spec.md) · 2026-09-28 |
| REQ-PLC-01 | policy | 4화면 제공 | SC-13-01, SC-13-02, SC-13-03, SC-13-04 | - | - | [spec §3](../features/policy/spec.md) · 2026-09-28 |
| REQ-PLC-02 | policy | 시행일 사전 역산 | SC-13-01, SC-13-02, SC-13-03, SC-13-04 | - | - | [spec §3](../features/policy/spec.md) · 2026-09-28 |
| REQ-PLC-03 | policy | 조 단위 데이터 구조 | SC-13-01, SC-13-02, SC-13-03, SC-13-04 | - | - | [spec §3](../features/policy/spec.md) · 2026-09-28 |
| REQ-PLC-04 | policy | 문의 채널 분리 | SC-13-01, SC-13-02, SC-13-03, SC-13-04 | - | - | [spec §3](../features/policy/spec.md) · 2026-09-28 |
| REQ-PLC-05 | policy | 수집 스위치 꺼짐 | SC-13-01, SC-13-02, SC-13-03, SC-13-04 | - | - | [spec §3](../features/policy/spec.md) · 2026-09-28 |
| REQ-ERR-01 | error | 404 안내 | SC-12-01 | - | - | [spec §3](../features/error/spec.md) · 2026-09-28 |
| REQ-ERR-02 | error | 렌더 예외 격리 | SC-12-01 | - | - | [spec §3](../features/error/spec.md) · 2026-09-28 |
| REQ-ERR-03 | error | 경로별 리셋 | SC-12-01 | - | - | [spec §3](../features/error/spec.md) · 2026-09-28 |
| REQ-ERR-04 | error | 원문 비노출 | SC-12-01 | - | - | [spec §3](../features/error/spec.md) · 2026-09-28 |
| REQ-ERR-05 | error | 전체 새로고침 이동 | SC-12-01 | - | - | [spec §3](../features/error/spec.md) · 2026-09-28 |
| REQ-ERR-06 | error | 서버 404 | SC-12-01 | - | - | [spec §3](../features/error/spec.md) · 2026-09-28 |
