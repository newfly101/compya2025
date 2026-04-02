-- ============================================================
-- skill_score_config INSERT
-- PITCHER + HITTER 전체
-- condition_type: NONE / WITH_SKILL
-- effect_type: ADD / SUB
-- ============================================================

-- ============================================================
-- [PITCHER]
-- ============================================================

INSERT INTO skill_score_config (skill_code, target, point, condition_type, condition_value, effect_type, effect_point, is_active)
VALUES

-- -------------------------------------------------------
-- LEGEND
-- -------------------------------------------------------

-- 슈퍼스타 (L1): 기본 10점
('L1', 'PITCHER', 10, 'NONE', NULL, 'ADD', NULL, true),

-- 팔색조 (L2): 기본 10점
('L2', 'PITCHER', 10, 'NONE', NULL, 'ADD', NULL, true),

-- 라이징패스트볼 (L3): 기본 9점
('L3', 'PITCHER', 9, 'NONE', NULL, 'ADD', NULL, true),

-- 베테랑 (L4): 기본 10점
('L4', 'PITCHER', 10, 'NONE', NULL, 'ADD', NULL, true),

-- 베테랑 (L4): 자이언트킬러(P4)와 공존 시 -1점
('L4', 'PITCHER', 10, 'WITH_SKILL', 'P4', 'SUB', 1, true),

-- 캡틴 (L5): 기본 4점 (중계 기준 - 포지션 예외는 FE 상수)
('L5', 'PITCHER', 4, 'NONE', NULL, 'ADD', NULL, true),

-- 캡틴 (L5): 중복(다른 카드에 캡틴) 시 -1점 → FE 처리
-- (DB에서는 관리 안 함)

-- 투혼 (L6): 기본 9점
('L6', 'PITCHER', 9, 'NONE', NULL, 'ADD', NULL, true),

-- 닥터K (L7): 기본 8점
('L7', 'PITCHER', 8, 'NONE', NULL, 'ADD', NULL, true),

-- -------------------------------------------------------
-- PLATINUM
-- -------------------------------------------------------

-- 각성 (P1): 기본 3점
('P1', 'PITCHER', 3, 'NONE', NULL, 'ADD', NULL, true),

-- 뒷심 (P2): 기본 3점
('P2', 'PITCHER', 3, 'NONE', NULL, 'ADD', NULL, true),

-- 끝판왕 (P3): 기본 7점
('P3', 'PITCHER', 7, 'NONE', NULL, 'ADD', NULL, true),

-- 끝판왕 (P3): 자이언트킬러(P4)와 공존 시 -1점
('P3', 'PITCHER', 7, 'WITH_SKILL', 'P4', 'SUB', 1, true),

-- 자이언트킬러 (P4): 기본 6점
('P4', 'PITCHER', 6, 'NONE', NULL, 'ADD', NULL, true),

-- 자이언트킬러 (P4): 끝판왕(P3)과 공존 시 -1점
('P4', 'PITCHER', 6, 'WITH_SKILL', 'P3', 'SUB', 1, true),

-- 자이언트킬러 (P4): 베테랑(L4)과 공존 시 -1점
('P4', 'PITCHER', 6, 'WITH_SKILL', 'L4', 'SUB', 1, true),

-- 이닝이터 (P5): 기본 5점
('P5', 'PITCHER', 5, 'NONE', NULL, 'ADD', NULL, true),

-- 이닝이터 (P5): 베테랑(L4)과 공존 시 +5점
('P5', 'PITCHER', 5, 'WITH_SKILL', 'L4', 'ADD', 5, true),

-- 언터처블 (P6): 기본 6점
('P6', 'PITCHER', 6, 'NONE', NULL, 'ADD', NULL, true),

-- 결정구 (P7): 기본 2점
('P7', 'PITCHER', 2, 'NONE', NULL, 'ADD', NULL, true),

-- 수호신 (P8): 기본 8점 (마무리 기준 - 포지션 예외는 FE 상수)
('P8', 'PITCHER', 8, 'NONE', NULL, 'ADD', NULL, true),

-- 버닝 (P9): 기본 4점 (중계 기준 - 포지션 예외는 FE 상수)
('P9', 'PITCHER', 4, 'NONE', NULL, 'ADD', NULL, true),

-- 에이스 (P10): 기본 5점 (중계 기준 - 포지션 예외는 FE 상수)
('P10', 'PITCHER', 5, 'NONE', NULL, 'ADD', NULL, true),

-- 벌떼야구 (P11): 기본 6점 (마무리 기준 - 포지션 예외는 FE 상수)
('P11', 'PITCHER', 6, 'NONE', NULL, 'ADD', NULL, true),

-- 결자해지 (P12): 기본 1점 (__DEFAULT__)
('P12', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 투지 (P13): 기본 3점 (중계 기준 - 포지션 예외는 FE 상수)
('P13', 'PITCHER', 3, 'NONE', NULL, 'ADD', NULL, true),

-- -------------------------------------------------------
-- HERO
-- -------------------------------------------------------

-- 승승장구 (H1): 기본 1점 (__DEFAULT__)
('H1', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 컨트롤아티스트 (H2): 기본 1점 (__DEFAULT__)
('H2', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 피칭머신 (H3): 기본 2점
('H3', 'PITCHER', 2, 'NONE', NULL, 'ADD', NULL, true),

-- 마당쇠 (H4): 기본 1점 (__DEFAULT__)
('H4', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 저격수 (H5): 기본 1점 (__DEFAULT__)
('H5', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 전력투구 (H6): 기본 2점 (중계 기준 - 포지션 예외는 FE 상수)
('H6', 'PITCHER', 2, 'NONE', NULL, 'ADD', NULL, true),

-- 해결사 (H7): 기본 1점 (__DEFAULT__)
('H7', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 승부사 (H8): 기본 1점 (__DEFAULT__)
('H8', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 클린업킬러 (H9): 기본 1점 (__DEFAULT__)
('H9', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 파워피쳐 (H10): 기본 1점 (__DEFAULT__)
('H10', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 국보투수 (H11): 기본 1점 (__DEFAULT__)
('H11', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 셋업맨 (H12): 기본 1점 (__DEFAULT__)
('H12', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 야전지휘 (H13): 기본 1점 (__DEFAULT__)
('H13', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- -------------------------------------------------------
-- NORMAL
-- -------------------------------------------------------

-- 견제왕 (N1): 기본 1점 (__DEFAULT__)
('N1', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 위기극복 (N2): 기본 1점 (__DEFAULT__)
('N2', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 얼음장 (N3): 기본 1점 (__DEFAULT__)
('N3', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 돌부처 (N4): 기본 1점 (__DEFAULT__)
('N4', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 광속투구 (N5): 기본 1점 (__DEFAULT__)
('N5', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 평정심 (N6): 기본 1점 (__DEFAULT__)
('N6', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 완급조절 (N7): 기본 1점 (__DEFAULT__)
('N7', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 우타킬러 (N8): 기본 2점
('N8', 'PITCHER', 2, 'NONE', NULL, 'ADD', NULL, true),

-- 좌타킬러 (N9): 기본 1점 (__DEFAULT__)
('N9', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 마구연마 (N10): 기본 1점 (__DEFAULT__)
('N10', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 강심장 (N11): 기본 1점 (__DEFAULT__)
('N11', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 노련함 (N12): 기본 1점 (__DEFAULT__)
('N12', 'PITCHER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 강철체력 (N13): 기본 2점
('N13', 'PITCHER', 2, 'NONE', NULL, 'ADD', NULL, true);


-- ============================================================
-- [HITTER]
-- ============================================================

INSERT INTO skill_score_config (skill_code, target, point, condition_type, condition_value, effect_type, effect_point, is_active)
VALUES

-- -------------------------------------------------------
-- LEGEND
-- -------------------------------------------------------

-- 핵심타자 (L1): 기본 10점
('L1', 'HITTER', 10, 'NONE', NULL, 'ADD', NULL, true),

-- 위압감 (L2): 기본 10점
('L2', 'HITTER', 10, 'NONE', NULL, 'ADD', NULL, true),

-- 베테랑 (L3): 기본 10점
('L3', 'HITTER', 10, 'NONE', NULL, 'ADD', NULL, true),

-- 대포군단 (L4): 기본 9점
('L4', 'HITTER', 9, 'NONE', NULL, 'ADD', NULL, true),

-- 타격의달인 (L5): 기본 9점
('L5', 'HITTER', 9, 'NONE', NULL, 'ADD', NULL, true),

-- 슈퍼스타 (L6): 기본 4점
-- 3번째 옵션 시 +8점 → FE SLOT_ORDER 처리
('L6', 'HITTER', 4, 'NONE', NULL, 'ADD', NULL, true),

-- 캡틴 (L7): 기본 5점
-- 다른 카드 캡틴 중복 시 -4점 → FE 처리
('L7', 'HITTER', 5, 'NONE', NULL, 'ADD', NULL, true),

-- -------------------------------------------------------
-- PLATINUM
-- -------------------------------------------------------

-- 게스히터 (P1): 기본 6점
('P1', 'HITTER', 6, 'NONE', NULL, 'ADD', NULL, true),

-- 레전드 (P2): 기본 3점
('P2', 'HITTER', 3, 'NONE', NULL, 'ADD', NULL, true),

-- 리드오프 (P3): 기본 7점
-- 1번 타순일 때만 유효 → FE BAT_ORDER 처리
('P3', 'HITTER', 7, 'NONE', NULL, 'ADD', NULL, true),

-- 배팅머신 (P4): 기본 6점
('P4', 'HITTER', 6, 'NONE', NULL, 'ADD', NULL, true),

-- 스프레이히터 (P5): 기본 8점
('P5', 'HITTER', 8, 'NONE', NULL, 'ADD', NULL, true),

-- 슬러거 (P6): 기본 7점 (온라인 기준)
-- 온라인 7점 / 오프라인 4점 → FE ONLINE_MODE 처리
('P6', 'HITTER', 7, 'NONE', NULL, 'ADD', NULL, true),

-- 에이스킬러 (P7): 기본 3점
('P7', 'HITTER', 3, 'NONE', NULL, 'ADD', NULL, true),

-- 예지력 (P8): 기본 8점
('P8', 'HITTER', 8, 'NONE', NULL, 'ADD', NULL, true),

-- 주루도사 (P9): 기본 1점 (__DEFAULT__)
('P9', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 카리스마 (P10): 기본 1점 (__DEFAULT__)
('P10', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 클러치히터 (P11): 기본 5점
-- 5,6번 타순일 때만 유효 → FE BAT_ORDER 처리
('P11', 'HITTER', 5, 'NONE', NULL, 'ADD', NULL, true),

-- 파워히터 (P12): 기본 7점
-- 4번 타순일 때만 유효 → FE BAT_ORDER 처리
('P12', 'HITTER', 7, 'NONE', NULL, 'ADD', NULL, true),

-- 호타준족 (P13): 기본 1점 (__DEFAULT__)
('P13', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- -------------------------------------------------------
-- HERO
-- -------------------------------------------------------

-- 거포본능 (H1): 기본 1점 (__DEFAULT__)
('H1', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 블로킹 (H2): 기본 1점 (__DEFAULT__)
('H2', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 빅스윙 (H3): 기본 1점 (__DEFAULT__)
('H3', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 승부근성 (H4): 기본 1점 (__DEFAULT__)
('H4', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 어퍼스윙 (H5): 기본 1점 (__DEFAULT__)
('H5', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 역전의힘 (H6): 기본 1점 (__DEFAULT__)
('H6', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 정밀타격 (H7): 기본 1점 (__DEFAULT__)
('H7', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 참을성 (H8): 기본 2점
('H8', 'HITTER', 2, 'NONE', NULL, 'ADD', NULL, true),

-- 탈진 (H9): 기본 1점 (__DEFAULT__)
('H9', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 테이블세터 (H10): 기본 1점 (__DEFAULT__)
('H10', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 풀스윙히터 (H11): 기본 1점 (__DEFAULT__)
('H11', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 하체단련 (H12): 기본 1점 (__DEFAULT__)
('H12', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 훈련중독 (H13): 기본 1점 (__DEFAULT__)
('H13', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- -------------------------------------------------------
-- NORMAL
-- -------------------------------------------------------

-- 다운스윙 (N1): 기본 1점 (__DEFAULT__)
('N1', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 당겨치기 (N2): 기본 1점 (__DEFAULT__)
('N2', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 대타전문가 (N3): 기본 1점 (__DEFAULT__)
('N3', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 득점기계 (N4): 기본 1점 (__DEFAULT__)
('N4', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 매의눈 (N5): 기본 2점
('N5', 'HITTER', 2, 'NONE', NULL, 'ADD', NULL, true),

-- 밀어치기 (N6): 기본 1점 (__DEFAULT__)
('N6', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 수비대장 (N7): 기본 1점 (__DEFAULT__)
('N7', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 우완킬러 (N8): 기본 2점
('N8', 'HITTER', 2, 'NONE', NULL, 'ADD', NULL, true),

-- 정면승부 (N9): 기본 1점 (__DEFAULT__)
('N9', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 좌완킬러 (N10): 기본 1점 (__DEFAULT__)
('N10', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 직구킬러 (N11): 기본 1점 (__DEFAULT__)
('N11', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 집중력 (N12): 기본 1점 (__DEFAULT__)
('N12', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true),

-- 초구공략 (N13): 기본 1점 (__DEFAULT__)
('N13', 'HITTER', 1, 'NONE', NULL, 'ADD', NULL, true);


-- ============================================================
-- FE 상수로 처리되는 항목 정리 (주석)
-- ============================================================

-- [PITCHER - 포지션별 예외 (FE 상수)]
-- 캡틴   (L5):  선발점수미정 / 중계 4점 / 마무리점수미정
-- 수호신 (P8):  마무리 8점
-- 버닝   (P9):  중계 4점 / 선발 2점
-- 에이스 (P10): 중계 5점
-- 벌떼야구(P11): 마무리 6점 / 중계 5점
-- 투지   (P13): 중계 3점 / 선발 2점
-- 전력투구(H6):  중계 2점

-- [HITTER - FE 처리 항목]
-- 슈퍼스타 (L6): 3번째 슬롯이면 +8점 (SLOT_ORDER)
-- 캡틴     (L7): 다른 카드에 캡틴 중복 시 -4점 (5장 전체 기준)
-- 리드오프 (P3): 1번 타순일 때만 유효 (BAT_ORDER)
-- 슬러거   (P6): 온라인 7점 / 오프라인 4점 (ONLINE_MODE)
-- 클러치히터(P11): 5,6번 타순일 때만 유효 (BAT_ORDER)
-- 파워히터 (P12): 4번 타순일 때만 유효 (BAT_ORDER)
