package com.dawne.com2usbaseball.domain.legendCollectionSkill.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.BatchEventRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.SaveSkillsRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.SkillEventRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.response.LegendSkillResponse;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.response.LegendSkillResponse.SlotItem;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.SkillLogEntity;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.SkillMasterEntity;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.UserLegendSkillEntity;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.LegendCollectionSkillMessages;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillAction;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillKind;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillTier;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.repository.LegendCollectionSkillRepository;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.service.support.SkillRules;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.LegendCollectionSkillMessages.*;
import static com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillAction.*;
import static com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillTier.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LegendCollectionSkillRulesTest {

    private static final Long U = 1L;
    private static final String L = "legend-1";

    // 위압감 D(레전드 스킬) · 캡틴 E(레전드 스킬) · 배팅머신 C(플래티넘)
    private static final List<SkillKind> KINDS = List.of(SkillKind.LEGEND, SkillKind.LEGEND, SkillKind.PLATINUM);

    private static SlotItem slot(String id, SkillTier base, SkillTier cur) {
        return new SlotItem(id, base, cur);
    }

    private static List<SlotItem> registered() {
        return List.of(slot("a", D, D), slot("b", E, E), slot("c", C, C));
    }

    private static SkillRules.Progress progress(SkillAction... a) {
        return SkillRules.progress(List.of(a));
    }

    private static List<SlotItem> up(List<SlotItem> s, SkillAction a, int slot, SkillRules.Progress p) {
        return SkillRules.apply(a, slot, s, KINDS, p);
    }

    private static void assertRejected(Runnable r) {
        BaseException e = assertThrows(BaseException.class, r::run);
        assertEquals(LEGEND_COLLECTION_SKILL_ACTION_NOT_ALLOWED, e.getCode());
    }

    @Test
    @DisplayName("위압감 D·캡틴 E·배팅머신 C 풀업 — 기본 7 + 고추강 3 + 고고각 2")
    void 풀업_시나리오() {
        List<SlotItem> s = registered();
        List<SkillAction> log = new ArrayList<>();
        // 기본 강화 7회: 위압감 D→A(3), 캡틴 E→A(4)
        for (int i = 0; i < 3; i++) {
            s = up(s, BASE_UP, 1, SkillRules.progress(log));
            log.add(BASE_UP);
        }
        for (int i = 0; i < 4; i++) {
            s = up(s, BASE_UP, 2, SkillRules.progress(log));
            log.add(BASE_UP);
        }
        assertEquals(7, SkillRules.progress(log).usage().base());
        // 8번째 기본 강화는 거부
        List<SlotItem> cur = s;
        List<SkillAction> snap = List.copyOf(log);
        assertRejected(() -> up(cur, BASE_UP, 3, SkillRules.progress(snap)));
        // 고추강 3회: 배팅머신 C→S
        for (int i = 0; i < 3; i++) {
            s = up(s, GCG_UP, 3, SkillRules.progress(log));
            log.add(GCG_UP);
        }
        assertEquals(S, s.get(2).currentGrade());
        // 레전드 스킬은 고추강으로 A 를 못 넘는다
        List<SlotItem> cur2 = s;
        List<SkillAction> snap2 = List.copyOf(log);
        assertRejected(() -> up(cur2, GCG_UP, 1, SkillRules.progress(snap2)));
        // 고고각 2회
        for (int i = 0; i < 2; i++) {
            s = up(s, GGG_UP, i + 1, SkillRules.progress(log));
            log.add(GGG_UP);
        }
        assertEquals(List.of(S, S, S), s.stream().map(SlotItem::currentGrade).toList());
        SkillRules.Progress p = SkillRules.progress(log);
        assertEquals(12, p.enhanceCount());
        assertEquals(3, p.usage().gcg());
        assertEquals(2, p.usage().ggg());
        // 더 올릴 스킬이 없으면 전부 거부
        List<SlotItem> full = s;
        for (SkillAction a : List.of(BASE_UP, GCG_UP, GGG_UP)) {
            assertRejected(() -> up(full, a, 1, p));
        }
    }

    @Test
    @DisplayName("기본 강화 상한 = 스킬 등급 최대 — 플래티넘 C→B→A→S 허용·S 거부, 레전드는 A 에서 거부")
    void 기본강화_상한() {
        List<SlotItem> s = List.of(slot("a", E, E), slot("b", E, E), slot("c", C, C));
        for (SkillTier expect : List.of(B, A, S)) {
            s = up(s, BASE_UP, 3, progress());
            assertEquals(expect, s.get(2).currentGrade());
        }
        List<SlotItem> full = s;
        assertRejected(() -> up(full, BASE_UP, 3, progress()));
        assertRejected(() -> up(List.of(slot("a", E, A), slot("b", E, E), slot("c", C, C)), BASE_UP, 1, progress()));
    }

    @Test
    @DisplayName("고고각은 레전드 스킬이 A 일 때만, 플래티넘은 불가")
    void 고고각_조건() {
        assertRejected(() -> up(registered(), GGG_UP, 1, progress()));
        assertRejected(() -> up(List.of(slot("a", D, A), slot("b", E, E), slot("c", C, S)), GGG_UP, 3, progress()));
        assertEquals(S, up(List.of(slot("a", D, A), slot("b", E, E), slot("c", C, C)), GGG_UP, 1, progress())
                .get(0).currentGrade());
    }

    @Test
    @DisplayName("되돌리기는 현재 등급을 등록 등급으로, 초기화는 슬롯 비움 + 사용량 0")
    void 되돌리기_초기화() {
        List<SlotItem> enhanced = List.of(slot("a", D, A), slot("b", E, C), slot("c", C, C));
        assertEquals(List.of(D, E, C), SkillRules.apply(UNDO, null, enhanced, KINDS, progress(BASE_UP))
                .stream().map(SlotItem::currentGrade).toList());
        assertEquals(0, progress(BASE_UP, BASE_UP, UNDO).enhanceCount());
        assertEquals(List.of(SkillRules.EMPTY, SkillRules.EMPTY, SkillRules.EMPTY),
                SkillRules.apply(RESET, null, enhanced, KINDS, progress(BASE_UP)));
    }

    @Test
    @DisplayName("일괄 적용 — S 일괄은 레전드 S, 고고각 제외는 레전드 A, 등록 등급은 유지")
    void 일괄_적용() {
        List<SlotItem> s = SkillRules.apply(BULK_S, null, registered(), KINDS, progress());
        assertEquals(List.of(S, S, S), s.stream().map(SlotItem::currentGrade).toList());
        assertEquals(List.of(D, E, C), s.stream().map(SlotItem::baseGrade).toList());
        s = SkillRules.apply(BULK_NO_GGG, null, registered(), KINDS, progress());
        assertEquals(List.of(A, A, S), s.stream().map(SlotItem::currentGrade).toList());
    }

    @Test
    @DisplayName("일괄 — 이미 목표 도달이면 거부 (레전드S·플랫S 둘 다 / A·S 는 고고각 제외만 / E·E·D 허용)")
    void 일괄_목표도달_거부() {
        List<SlotItem> allS = List.of(slot("a", E, S), slot("b", E, S), slot("c", E, S));
        assertRejected(() -> SkillRules.apply(BULK_NO_GGG, null, allS, KINDS, progress()));
        assertRejected(() -> SkillRules.apply(BULK_S, null, allS, KINDS, progress()));
        List<SlotItem> aSa = List.of(slot("a", E, A), slot("b", E, S), slot("c", E, A));
        List<SkillKind> k = List.of(SkillKind.LEGEND, SkillKind.PLATINUM, SkillKind.LEGEND);
        assertRejected(() -> SkillRules.apply(BULK_NO_GGG, null, aSa, k, progress()));
        assertEquals(S, SkillRules.apply(BULK_S, null, aSa, k, progress()).get(0).currentGrade());
        List<SlotItem> eed = List.of(slot("a", E, E), slot("b", E, E), slot("c", E, D));
        assertDoesNotThrow(() -> SkillRules.apply(BULK_NO_GGG, null, eed, KINDS, progress()));
        assertDoesNotThrow(() -> SkillRules.apply(BULK_S, null, eed, KINDS, progress()));
    }

    @Test
    @DisplayName("일괄 상태 — 고고각만 허용, 표식은 되돌리기·초기화에서 해제")
    void 일괄_표식() {
        SkillRules.Progress noGgg = progress(BULK_NO_GGG);
        assertEquals("NO_GGG", noGgg.bulkMode());
        List<SlotItem> bulked = List.of(slot("a", E, A), slot("b", E, A), slot("c", E, S));
        assertRejected(() -> up(bulked, BASE_UP, 1, noGgg));
        assertRejected(() -> up(bulked, GCG_UP, 1, noGgg));
        assertEquals(S, up(bulked, GGG_UP, 1, noGgg).get(0).currentGrade());
        assertNull(progress(BULK_NO_GGG, UNDO).bulkMode());
        assertNull(progress(BULK_NO_GGG, GGG_UP, UNDO).bulkMode());
        assertNull(progress(BULK_NO_GGG, RESET).bulkMode());
        assertEquals("S", progress(BULK_NO_GGG, RESET, BULK_S).bulkMode());
        // 일괄 적용 자체는 강화 횟수가 아니다
        assertEquals(0, progress(BULK_S).enhanceCount());
    }

    @Test
    @DisplayName("미등록 상태에서 강화는 거부")
    void 미등록() {
        BaseException e = assertThrows(BaseException.class, () -> SkillRules.apply(BASE_UP, 1,
                List.of(SkillRules.EMPTY, SkillRules.EMPTY, SkillRules.EMPTY), KINDS, progress()));
        assertEquals(LEGEND_COLLECTION_SKILL_NOT_REGISTERED, e.getCode());
    }

    // ── 서비스 (mock 저장소) ──
    private LegendCollectionSkillRepository repo;
    private LegendCollectionSkillServiceImpl service;

    @BeforeEach
    void setUp() {
        repo = Mockito.mock(LegendCollectionSkillRepository.class);
        service = new LegendCollectionSkillServiceImpl(repo);
        when(repo.findTargetStatus(U, L)).thenReturn(Optional.of("OWNED"));
        when(repo.findLegendRole(L)).thenReturn(Optional.of("HITTER"));
        when(repo.findLogs(U, L)).thenReturn(List.of());
    }

    private static SkillMasterEntity master(String id, String role, SkillKind kind) {
        return new SkillMasterEntity(id, role, kind);
    }

    private static SaveSkillsRequest req(String a, SkillTier ta, String b, SkillTier tb, String c, SkillTier tc) {
        return new SaveSkillsRequest(List.of(new SaveSkillsRequest.Slot(a, ta),
                new SaveSkillsRequest.Slot(b, tb), new SaveSkillsRequest.Slot(c, tc)));
    }

    private LegendCollectionSkillMessages saveFail(SaveSkillsRequest r) {
        BaseException e = assertThrows(BaseException.class, () -> service.saveSkills(U, L, r));
        return (LegendCollectionSkillMessages) e.getCode();
    }

    @Test
    @DisplayName("등록 — 현재 등급=등록 등급으로 저장하고 SAVE 로그 1줄")
    void 등록_성공() {
        when(repo.findSkills(any())).thenReturn(List.of(master("a", "HITTER", SkillKind.LEGEND),
                master("b", "HITTER", SkillKind.NORMAL), master("c", "HITTER", SkillKind.PLATINUM)));
        LegendSkillResponse r = service.saveSkills(U, L, req("a", D, "b", E, "c", C));
        assertEquals(D, r.slots().get(0).currentGrade());
        assertEquals(0, r.enhanceCount());
        ArgumentCaptor<UserLegendSkillEntity> cap = ArgumentCaptor.forClass(UserLegendSkillEntity.class);
        verify(repo).upsertState(cap.capture());
        assertEquals(C, cap.getValue().getSkill3Current());
        verify(repo).insertLog(eq(U), eq(L), eq(SAVE), isNull(), contains("\"base\":\"D\""));
    }

    @Test
    @DisplayName("등록 — 중복 스킬 · B 이상 등급 · 타자/투수 불일치 · 비대상 레전드는 거부")
    void 등록_검증() {
        when(repo.findSkills(any())).thenReturn(List.of(master("a", "HITTER", SkillKind.LEGEND),
                master("b", "PITCHER", SkillKind.NORMAL), master("c", "HITTER", SkillKind.PLATINUM)));
        assertEquals(LEGEND_COLLECTION_SKILL_INVALID_SLOTS, saveFail(req("a", E, "a", E, "c", E)));
        assertEquals(LEGEND_COLLECTION_SKILL_INVALID_GRADE, saveFail(req("a", B, "c", E, "x", E)));
        assertEquals(LEGEND_COLLECTION_SKILL_INVALID_SLOTS, saveFail(req("a", E, "b", E, "c", E)));
        verify(repo, never()).upsertState(any());
        when(repo.findTargetStatus(U, L)).thenReturn(Optional.empty());
        assertEquals(LEGEND_COLLECTION_SKILL_NOT_TARGET, saveFail(req("a", E, "b", E, "c", E)));
    }

    @Test
    @DisplayName("이벤트 — 기본 강화는 해당 슬롯만 한 단계 올리고 로그에 슬롯 번호를 남긴다")
    void 이벤트_기본강화() {
        when(repo.findState(U, L)).thenReturn(Optional.of(UserLegendSkillEntity.builder()
                .skill1Id("a").skill1Base(D).skill1Current(D).skill2Id("b").skill2Base(E).skill2Current(E)
                .skill3Id("c").skill3Base(C).skill3Current(C).build()));
        when(repo.findSkills(any())).thenReturn(List.of(master("a", "HITTER", SkillKind.LEGEND),
                master("b", "HITTER", SkillKind.LEGEND), master("c", "HITTER", SkillKind.PLATINUM)));
        LegendSkillResponse r = service.applyEvent(U, L, new SkillEventRequest(BASE_UP, 2));
        assertEquals(D, r.slots().get(1).currentGrade());
        assertEquals(E, r.slots().get(1).baseGrade());
        verify(repo).insertLog(eq(U), eq(L), eq(BASE_UP), eq(2), anyString());
        assertThrows(BaseException.class, () -> service.applyEvent(U, L, new SkillEventRequest(SAVE, null)));
    }

    @Test
    @DisplayName("보유 해제 훅 — 스킬 행만 삭제, 로그 삽입·삭제 없음")
    void 보유해제_삭제() {
        service.deleteByLegends(U, List.of(L));
        verify(repo).deleteStates(U, List.of(L));
        verify(repo, never()).insertLog(any(), any(), any(), any(), any());
    }

    private void assertUndoReleasesBulk(List<SkillAction> before, SkillTier c1, SkillTier c2, SkillTier c3) {
        when(repo.findState(U, L)).thenReturn(Optional.of(UserLegendSkillEntity.builder()
                .skill1Id("a").skill1Base(E).skill1Current(c1).skill2Id("b").skill2Base(E).skill2Current(c2)
                .skill3Id("c").skill3Base(E).skill3Current(c3).build()));
        when(repo.findSkills(any())).thenReturn(List.of(master("a", "HITTER", SkillKind.LEGEND),
                master("b", "HITTER", SkillKind.LEGEND), master("c", "HITTER", SkillKind.PLATINUM)));
        List<SkillLogEntity> logs = new ArrayList<>();
        before.forEach(a -> logs.add(new SkillLogEntity(L, a)));
        when(repo.findLogs(U, L)).thenReturn(logs);

        LegendSkillResponse r = service.applyEvent(U, L, new SkillEventRequest(UNDO, null));
        assertEquals(List.of(E, E, E), r.slots().stream().map(SlotItem::currentGrade).toList());
        assertNull(r.bulkMode());
        assertEquals(0, r.enhanceCount());

        // 되돌리기 로그는 남기지 않고, SAVE 이후 로그를 정리한다
        verify(repo).deleteLogsAfterLastSave(U, L);
        verify(repo, never()).insertLog(any(), any(), eq(UNDO), any(), any());
        // 되돌린 뒤에는 다시 등록(PUT) 가능
        when(repo.findLogs(U, L)).thenReturn(List.of(new SkillLogEntity(L, SAVE)));
        when(repo.findSkills(any())).thenReturn(List.of(master("a", "HITTER", SkillKind.LEGEND),
                master("b", "HITTER", SkillKind.NORMAL), master("c", "HITTER", SkillKind.PLATINUM)));
        assertDoesNotThrow(() -> service.saveSkills(U, L, req("a", E, "b", E, "c", E)));
    }

    @Test
    @DisplayName("S 일괄 → 되돌리기 — 일괄 해제, 현재 등급 E, 재등록 가능")
    void 일괄S_되돌리기() {
        assertUndoReleasesBulk(List.of(BULK_S), S, S, S);
    }

    @Test
    @DisplayName("고고각 제외 일괄 → 고고각 → 되돌리기 — 일괄 해제, 현재 등급 E, 재등록 가능")
    void 고고각제외_일괄_되돌리기() {
        assertUndoReleasesBulk(List.of(BULK_NO_GGG, GGG_UP), S, A, S);
    }

    @Test
    @DisplayName("강화 후에는 등록(PUT) 잠금")
    void 등록_잠금() {
        when(repo.findLogs(U, L)).thenReturn(List.of(new SkillLogEntity(L, BASE_UP)));
        assertEquals(LEGEND_COLLECTION_SKILL_LOCKED, saveFail(req("a", E, "b", E, "c", E)));
    }

    @Test
    @DisplayName("액자 — 강화 이벤트 거부, 등록(PUT)·초기화(RESET)는 허용")
    void 액자_강화_거부() {
        when(repo.findTargetStatus(U, L)).thenReturn(Optional.of("FRAME"));
        for (SkillAction a : List.of(BASE_UP, BULK_S)) {
            BaseException e = assertThrows(BaseException.class,
                    () -> service.applyEvent(U, L, new SkillEventRequest(a, 1)));
            assertEquals(LEGEND_COLLECTION_SKILL_FRAME_NOT_ENHANCEABLE, e.getCode());
        }
        assertDoesNotThrow(() -> service.applyEvent(U, L, new SkillEventRequest(RESET, null)));
        when(repo.findSkills(any())).thenReturn(List.of(master("a", "HITTER", SkillKind.LEGEND),
                master("b", "HITTER", SkillKind.NORMAL), master("c", "HITTER", SkillKind.PLATINUM)));
        assertDoesNotThrow(() -> service.saveSkills(U, L, req("a", E, "b", E, "c", E)));
    }

    // ── 묶음 강화 · 로그 정리 · 일괄 등급 유지 ──
    private void stubState(SkillTier b1, SkillTier c1, SkillTier b2, SkillTier c2, SkillTier b3, SkillTier c3) {
        when(repo.findState(U, L)).thenReturn(Optional.of(UserLegendSkillEntity.builder()
                .skill1Id("a").skill1Base(b1).skill1Current(c1).skill2Id("b").skill2Base(b2).skill2Current(c2)
                .skill3Id("c").skill3Base(b3).skill3Current(c3).build()));
        when(repo.findSkills(any())).thenReturn(List.of(master("a", "HITTER", SkillKind.LEGEND),
                master("b", "HITTER", SkillKind.LEGEND), master("c", "HITTER", SkillKind.PLATINUM)));
    }

    private static BatchEventRequest batch(Object... pairs) {
        List<BatchEventRequest.Item> items = new ArrayList<>();
        for (int i = 0; i < pairs.length; i += 2) {
            items.add(new BatchEventRequest.Item((SkillAction) pairs[i], (Integer) pairs[i + 1]));
        }
        return new BatchEventRequest(items);
    }

    @Test
    @DisplayName("묶음 강화 — 순서대로 적용, 한 번에 저장, 로그는 액션마다 1줄")
    void 묶음강화_성공() {
        stubState(D, D, E, E, C, C);
        LegendSkillResponse r = service.applyBatch(U, L, batch(BASE_UP, 1, BASE_UP, 1, BASE_UP, 2));
        assertEquals(List.of(B, D, C), r.slots().stream().map(SlotItem::currentGrade).toList());
        assertEquals(3, r.enhanceCount());
        verify(repo, times(1)).upsertState(any());
        verify(repo, times(3)).insertLog(eq(U), eq(L), eq(BASE_UP), anyInt(), anyString());
    }

    @Test
    @DisplayName("묶음 강화 — 중간에 규칙 위반이면 아무것도 저장하지 않고 ACTION_NOT_ALLOWED")
    void 묶음강화_중간실패_롤백() {
        stubState(D, D, E, E, C, C);
        // 3번째는 고고각인데 슬롯 1 이 A 가 아니라 거부
        BaseException e = assertThrows(BaseException.class,
                () -> service.applyBatch(U, L, batch(BASE_UP, 1, BASE_UP, 2, GGG_UP, 1)));
        assertEquals(LEGEND_COLLECTION_SKILL_ACTION_NOT_ALLOWED, e.getCode());
        verify(repo, never()).upsertState(any());
        verify(repo, never()).insertLog(any(), any(), any(), any(), any());
        assertThrows(BaseException.class, () -> service.applyBatch(U, L, batch(BULK_S, 1)));
    }

    @Test
    @DisplayName("되돌리기 — SAVE 이후 로그 삭제·UNDO 로그 없음 / 초기화 — 로그 전부 삭제·RESET 로그 없음")
    void 되돌리기_초기화_로그정리() {
        stubState(D, A, E, A, C, C);
        service.applyEvent(U, L, new SkillEventRequest(UNDO, null));
        verify(repo).deleteLogsAfterLastSave(U, L);
        service.applyEvent(U, L, new SkillEventRequest(RESET, null));
        verify(repo).deleteLogs(U, L);
        verify(repo, never()).insertLog(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("일괄 — 등록 등급 D·E·C 유지, 사용량 자동 계산(기본 7 + 고추강 + 고고각)")
    void 일괄_등급유지_사용량() {
        stubState(D, D, E, E, C, C);
        when(repo.findLogs(U, L)).thenReturn(List.of(new SkillLogEntity(L, SAVE)),
                List.of(new SkillLogEntity(L, SAVE), new SkillLogEntity(L, BULK_S)));
        LegendSkillResponse r = service.applyEvent(U, L, new SkillEventRequest(BULK_S, null));
        assertEquals(List.of(D, E, C), r.slots().stream().map(SlotItem::baseGrade).toList());
        assertEquals(List.of(S, S, S), r.slots().stream().map(SlotItem::currentGrade).toList());
        // 위압감 D→A 3 + 캡틴 E→A 4 + 배팅머신 C→S 3 = 10 → 기본 7 + 고추강 3, 레전드 2칸 고고각
        assertEquals(new LegendSkillResponse.Usage(7, 3, 2), r.usage());
        assertEquals(12, r.enhanceCount());
    }

    @Test
    @DisplayName("등록 등급이 E·E·E 인 채 일괄 — 실제 값으로 보고 사용량 계산(E→A 4칸×3 = 12 → 기본 7 + 고추강 5)")
    void 일괄_등급EEE() {
        stubState(E, E, E, E, E, E);
        when(repo.findLogs(U, L)).thenReturn(List.of(new SkillLogEntity(L, SAVE)),
                List.of(new SkillLogEntity(L, SAVE), new SkillLogEntity(L, BULK_S)));
        LegendSkillResponse r = service.applyEvent(U, L, new SkillEventRequest(BULK_S, null));
        assertEquals("S", r.bulkMode());
        assertTrue(r.usage().base() > 0);
        assertTrue(r.enhanceCount() > 0);
    }
}
