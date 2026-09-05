-- ============================================================
-- site_notices 테이블에 slug(제목 기반 주소) 컬럼 추가
-- 작성 2026-09-05 · 수정 2026-09-05 (백필을 실제 제목 기반으로 변경 + published_at 보정 추가)
-- 실행 전 반드시 아래 내용을 읽을 것
--
-- ⚠️ 이 스크립트는 아직 실행되지 않았다. 운영 DB 적용은 사용자가 직접 한다.
--
-- 목적: /notice/7 같은 번호 주소 → /notice/{slug} 같은 제목 기반 주소로 전환.
--       한글 슬러그를 그대로 쓴다 (로마자 변환 X).
--
-- ⚠️ 콜레이션 주의
--   site_notices 는 CREATE_TABLE_SITE.sql 기준 테이블 기본 charset 만 utf8mb4 로
--   지정되어 있고 컬럼별 명시 COLLATE 는 없다 (테이블 기본 collation 을 따름).
--   한글 정규식(가-힣 / ㄱ-ㅎ / ㅏ-ㅣ 범위 매칭)은 세션 charset 이 utf8mb4 가 아니면
--   깨질 수 있으므로 아래 SET NAMES 를 반드시 먼저 실행한다.
--   실행 전 `SHOW CREATE TABLE site_notices;` 로 실제 콜레이션을 한 번 확인해 둘 것.
--
-- 실행 순서
--   1) SET NAMES
--   2) 컬럼 추가
--   3) (권장) 미리보기 SELECT 로 변환 결과 육안 확인
--   4) 백필 UPDATE (slug)
--   5) 중복 slug 확인용 SELECT
--   6) published_at 이 비어있는 기존 행 보정 (created_at 으로 채움)
-- ============================================================

-- 0) 세션 charset 고정 — 한글 정규식 매칭이 세션 charset 에 영향을 받는다
SET NAMES utf8mb4;

-- 1) 컬럼 추가
ALTER TABLE site_notices
    ADD COLUMN slug VARCHAR(200) NULL UNIQUE
        COMMENT '제목 기반 URL 슬러그. SlugUtils.slugify() 규칙과 동일하게 백필'
        AFTER image_url;

-- ══════════════════════════════════════════════════
-- 2) 백필 — Java SlugUtils.slugify() 와 결과가 같도록 REGEXP_REPLACE 로 재현
--    규칙: trim → 소문자화(영문만) → 한글/영문/숫자 외 전부 '-' →
--          연속 '-' 접기 → 앞뒤 '-' 제거 → 180자 컷 → 컷 후 남은 '-' 제거 →
--          결과가 비면 notice-{id}
-- ══════════════════════════════════════════════════

-- 2-1) (실행 전 확인용 — 미리보기) 주석 해제 후 먼저 돌려서 변환 결과를 눈으로 확인할 것
-- SELECT
--     id,
--     title,
--     TRIM(BOTH '-' FROM
--         LEFT(
--             TRIM(BOTH '-' FROM
--                 REGEXP_REPLACE(
--                     REGEXP_REPLACE(
--                         LOWER(TRIM(title)),
--                         '[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ]+', '-'
--                     ),
--                     '-{2,}', '-'
--                 )
--             ),
--             180
--         )
--     ) AS slug_preview_before_fallback,
--     CASE
--         WHEN TRIM(BOTH '-' FROM
--                 LEFT(
--                     TRIM(BOTH '-' FROM
--                         REGEXP_REPLACE(
--                             REGEXP_REPLACE(
--                                 LOWER(TRIM(title)),
--                                 '[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ]+', '-'
--                             ),
--                             '-{2,}', '-'
--                         )
--                     ),
--                     180
--                 )
--             ) = ''
--             THEN CONCAT('notice-', id)
--         ELSE TRIM(BOTH '-' FROM
--                 LEFT(
--                     TRIM(BOTH '-' FROM
--                         REGEXP_REPLACE(
--                             REGEXP_REPLACE(
--                                 LOWER(TRIM(title)),
--                                 '[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ]+', '-'
--                             ),
--                             '-{2,}', '-'
--                         )
--                     ),
--                     180
--                 )
--             )
--     END AS slug_final_preview
-- FROM site_notices
-- WHERE slug IS NULL
-- ORDER BY id;

-- 2-2) 실제 백필 UPDATE
UPDATE site_notices
SET slug =
    CASE
        WHEN TRIM(BOTH '-' FROM
                LEFT(
                    TRIM(BOTH '-' FROM
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(
                                LOWER(TRIM(title)),
                                '[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ]+', '-'
                            ),
                            '-{2,}', '-'
                        )
                    ),
                    180
                )
            ) = ''
            THEN CONCAT('notice-', id)
        ELSE TRIM(BOTH '-' FROM
                LEFT(
                    TRIM(BOTH '-' FROM
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(
                                LOWER(TRIM(title)),
                                '[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ]+', '-'
                            ),
                            '-{2,}', '-'
                        )
                    ),
                    180
                )
            )
    END
WHERE slug IS NULL;

-- 2-3) 중복 slug 확인용 (컬럼이 UNIQUE 라 중복 있으면 위 UPDATE 자체가 실패한다.
--      실패 시 아래로 어떤 제목들이 충돌하는지 찾아 수동으로 -2 등을 붙여줄 것)
-- SELECT slug, COUNT(*) AS cnt, GROUP_CONCAT(id) AS notice_ids
-- FROM site_notices
-- GROUP BY slug
-- HAVING COUNT(*) > 1;

-- ══════════════════════════════════════════════════
-- 3) published_at 보정 — 어드민 글쓰기 화면에 발행일 입력이 없어
--    등록 시 NULL 로 저장된 기존 행(예: id=7)을 created_at 값으로 채운다.
--    신규 등록분은 서비스 코드(AdminNoticeServiceImpl)가 등록 시점에
--    현재 시각으로 채우도록 이미 수정되어 있어, 이 UPDATE 는 과거 데이터 보정용이다.
-- ══════════════════════════════════════════════════
UPDATE site_notices
SET published_at = created_at
WHERE published_at IS NULL;

-- ============================================================
-- prod DB 적용 안내
-- ⚠️ 운영 DB 는 release 절차를 통해 사용자가 직접 적용 필요
--    (접근 권한 부재 / 안전장치 절차)
-- ============================================================
