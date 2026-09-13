-- ============================================================================
-- compyafun-v3_fun.sql
--
-- fun_ prefix V3 통합 SQL.
-- 도메인별 PRD 확정 결정에 따라 fun_quiz 부터 점차 통합. 다른 fun_ 테이블은
-- 각 도메인 PRD Part B 확정 후 본 파일로 이전.
-- ============================================================================


-- ============================================================================
-- fun_quiz
--
-- PRD: docs/prd/domains/quiz.md (Part B v2 — 2026-05-09 IA-CONFIRM)
--
-- 변경 사항 (V2 → V3):
--   - is_visible 컬럼 DROP
--       Owner 결정 (a): visible 운영 정책 폐기. 모든 row 노출 대상.
--       admin 운영자가 row 덮어쓰기로 노출 갱신.
--   - title 컬럼 추가하지 않음
--       Owner 결정 (b): server-side 동적 생성.
--       BE 응답 직전 합성: "🎉컴프야 퀴즈 이벤트 {round}회 정답"
--   - UNIQUE KEY uq_round 유지
--       T5 admin upload-driven 회차 자동 +1 정책 — 중복 방지 BE validation 근거.
--
-- 운영 정책:
--   - admin form initial 회차 = (DB 최신 round + 1) — admin 검토 후 저장 또는 jump 가능
--   - admin 입력 필드: image (필수) + round (필수). title input 제거됨.
--   - 모바일: HomeScreen QuizSection 이 최신 1건 fetch (`GET /api/quiz/latest`)
--
-- 기존 데이터: 운영 row 0건 (사용자 진술 — fun_quiz 미사용) → DROP & CREATE 안전.
-- ============================================================================
DROP TABLE IF EXISTS fun_quiz;

CREATE TABLE fun_quiz
(
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    round      INT          NOT NULL                                      COMMENT '퀴즈 회차 (예: 877). admin upload-driven 자동 +1, UNIQUE 보장.',
    image_url  VARCHAR(500) NOT NULL                                      COMMENT '정답 이미지 (S3 URL).',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_round (round)
)
