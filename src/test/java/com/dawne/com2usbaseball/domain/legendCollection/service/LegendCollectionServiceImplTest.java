package com.dawne.com2usbaseball.domain.legendCollection.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SaveAcquiredAtRequest;
import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SaveChangesRequest;
import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SaveChangesRequest.LegendChange;
import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SaveChangesRequest.MaterialChange;
import com.dawne.com2usbaseball.domain.legendCollection.entity.*;
import com.dawne.com2usbaseball.domain.legendCollection.enums.LegendCollectionMessages;
import com.dawne.com2usbaseball.domain.legendCollection.enums.LegendStatus;
import com.dawne.com2usbaseball.domain.legendCollection.enums.MaterialState;
import com.dawne.com2usbaseball.domain.legendCollection.repository.LegendCollectionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class LegendCollectionServiceImplTest {

    private LegendCollectionRepository repo;
    private LegendCollectionServiceImpl service;
    private com.dawne.com2usbaseball.domain.legendCollectionSkill.service.LegendCollectionSkillService skillService;
    private static final Long U = 1L;

    @BeforeEach
    void setUp() {
        repo = Mockito.mock(LegendCollectionRepository.class);
        skillService = Mockito.mock(com.dawne.com2usbaseball.domain.legendCollectionSkill.service.LegendCollectionSkillService.class);
        service = new LegendCollectionServiceImpl(repo, skillService);
        when(repo.findAllLegendIds()).thenReturn(List.of("L1", "L2"));
        when(repo.findAllMaterialRefs()).thenReturn(List.of(
                new MaterialRefEntity("M1", "L1"), new MaterialRefEntity("M2", "L1"),
                new MaterialRefEntity("M3", "L2")));
        when(repo.findLegendStates(U)).thenReturn(List.of());
        when(repo.findMaterialStates(U)).thenReturn(List.of());
        when(repo.findPreferences(U)).thenReturn(List.of());
    }

    private SaveChangesRequest req(List<MaterialChange> m, List<LegendChange> l, List<String> reset) {
        return new SaveChangesRequest(null, m, l, reset);
    }

    private BaseException fail(SaveChangesRequest r) {
        return assertThrows(BaseException.class, () -> service.saveChanges(U, r));
    }

    @Test
    @DisplayName("일차 계산 — 기준일은 1일차, 14일 뒤 다시 1일차, 기준일 전 날짜도 1~14")
    void 일차_계산() {
        assertEquals(1, LegendCollectionServiceImpl.dayNoOf(LocalDate.of(2026, 9, 28)));
        assertEquals(2, LegendCollectionServiceImpl.dayNoOf(LocalDate.of(2026, 9, 29)));
        assertEquals(14, LegendCollectionServiceImpl.dayNoOf(LocalDate.of(2026, 10, 11)));
        assertEquals(1, LegendCollectionServiceImpl.dayNoOf(LocalDate.of(2026, 10, 12)));
        assertEquals(14, LegendCollectionServiceImpl.dayNoOf(LocalDate.of(2026, 9, 27)));
    }

    @Test
    @DisplayName("없는 재료 id 는 거절한다")
    void 없는_재료_거절() {
        var e = fail(req(List.of(new MaterialChange("XX", MaterialState.HAVE)), null, null));
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_MATERIAL_NOT_FOUND, e.getCode());
    }

    @Test
    @DisplayName("저장된 삽입은 다른 상태로 바꿀 수 없다")
    void 저장된_삽입_되돌리기_거절() {
        when(repo.findMaterialStates(U)).thenReturn(List.of(new MaterialStateEntity("M1", MaterialState.INSERTED)));
        var e = fail(req(List.of(new MaterialChange("M1", MaterialState.HAVE)), null, null));
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_INVALID_MATERIAL_TRANSITION, e.getCode());
    }

    @Test
    @DisplayName("전체 초기화 목록의 레전드는 저장된 삽입도 지운다")
    void 전체_초기화는_삽입도_지운다() {
        when(repo.findMaterialStates(U)).thenReturn(List.of(new MaterialStateEntity("M1", MaterialState.INSERTED)));
        service.saveChanges(U, req(null, null, List.of("L1")));
        verify(repo).deleteMaterialStatesByLegendIds(U, List.of("L1"));
    }

    @Test
    @DisplayName("보유중 레전드의 재료 변경은 거절한다")
    void 보유중_레전드_재료_잠금() {
        when(repo.findLegendStates(U)).thenReturn(List.of(new LegendStateEntity("L1", LegendStatus.OWNED, null, null)));
        var e = fail(req(List.of(new MaterialChange("M1", MaterialState.HAVE)), null, null));
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_OWNED_LEGEND_LOCKED, e.getCode());
    }

    @Test
    @DisplayName("보유중으로 바꾸면 재료 0/8 초기화, 선호에서 빠지고 순위가 당겨진다")
    void 보유중_전환() {
        when(repo.findPreferences(U)).thenReturn(List.of(
                new PreferenceEntity("L1", 1), new PreferenceEntity("L2", 2)));
        service.saveChanges(U, req(null, List.of(new LegendChange("L1", LegendStatus.OWNED, null)), null));
        verify(repo).deleteMaterialStatesByLegendIds(U, List.of("L1"));
        verify(repo).upsertLegendState(U, "L1", LegendStatus.OWNED, TODAY, null);
        verify(repo).insertLegendStateLog(U, "L1", LegendStatus.NONE, LegendStatus.OWNED);
        verify(repo).insertPreference(U, "L2", 1);
        verify(repo, never()).insertPreference(eq(U), eq("L1"), anyInt());
    }

    @Test
    @DisplayName("다른 기기에서 먼저 저장했으면 409")
    void 동시_수정_충돌() {
        when(repo.findLatestUpdatedAt(U)).thenReturn(java.time.LocalDateTime.of(2026, 9, 29, 10, 0));
        var e = fail(new SaveChangesRequest("2026-09-29T09:00", null, null, null));
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_VERSION_CONFLICT, e.getCode());
    }

    @Test
    @DisplayName("선호는 보유중 레전드를 담을 수 없다")
    void 선호_보유중_거절() {
        when(repo.findLegendStates(U)).thenReturn(List.of(new LegendStateEntity("L1", LegendStatus.OWNED, null, null)));
        var r = new com.dawne.com2usbaseball.domain.legendCollection.dto.request.SavePreferencesRequest(
                null, List.of(new com.dawne.com2usbaseball.domain.legendCollection.dto.request.SavePreferencesRequest.Preference("L1", 1)), null);
        var e = assertThrows(BaseException.class, () -> service.savePreferences(U, r));
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_PREFERENCE_OWNED_LEGEND, e.getCode());
    }

    @Test
    @DisplayName("상태가 그대로면 로그도 저장도 하지 않고, 보유중에서 벗어나면 로그만 남기고 획득일을 비운다")
    void 상태_변경_로그() {
        when(repo.findLegendStates(U)).thenReturn(List.of(new LegendStateEntity("L1", LegendStatus.OWNED, LocalDate.of(2026, 9, 1), null)));
        service.saveChanges(U, req(null, List.of(new LegendChange("L1", LegendStatus.OWNED, null),
                new LegendChange("L2", LegendStatus.NONE, null)), null));
        verify(repo, never()).insertLegendStateLog(any(), any(), any(), any());
        service.saveChanges(U, req(null, List.of(new LegendChange("L1", LegendStatus.FRAME, null)), null));
        verify(repo).insertLegendStateLog(U, "L1", LegendStatus.OWNED, LegendStatus.FRAME);
        verify(repo).upsertLegendState(U, "L1", LegendStatus.FRAME, null, null);
    }

    private static final LocalDate TODAY = LocalDate.now(java.time.ZoneId.of("Asia/Seoul"));
    private static final LocalDate D = LocalDate.of(2026, 1, 1);

    private static SaveAcquiredAtRequest json(String body) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules()
                    .readValue(body, SaveAcquiredAtRequest.class);
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    private void states(LegendStatus s) {
        when(repo.findLegendStates(U)).thenReturn(List.of(new LegendStateEntity("L1", s, null, null)));
    }

    private BaseException failAt(String body) {
        return assertThrows(BaseException.class, () -> service.saveAcquiredAt(U, "L1", json(body)));
    }

    @Test
    @DisplayName("획득일 — 미보유는 거절")
    void 획득일_미보유_거절() {
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_ACQUIRED_AT_NOT_OWNED,
                failAt("{\"frameAcquiredAt\":\"2026-01-01\"}").getCode());
    }

    @Test
    @DisplayName("획득일 — 액자는 액자 획득일만 허용, 보유일을 보내면 거절")
    void 획득일_액자() {
        states(LegendStatus.FRAME);
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_ACQUIRED_AT_NOT_OWNED,
                failAt("{\"acquiredAt\":\"2026-01-01\"}").getCode());
        service.saveAcquiredAt(U, "L1", json("{\"frameAcquiredAt\":\"2026-01-01\"}"));
        verify(repo).updateAcquiredDates(U, "L1", true, D, false, null);
    }

    @Test
    @DisplayName("획득일 — 보유중은 둘 다 허용, 생략은 유지, 명시적 null 은 지움, 옛 클라이언트 형식 호환")
    void 획득일_보유중() {
        states(LegendStatus.OWNED);
        service.saveAcquiredAt(U, "L1", json("{\"frameAcquiredAt\":\"2026-01-01\",\"acquiredAt\":null}"));
        verify(repo).updateAcquiredDates(U, "L1", true, D, true, null);
        service.saveAcquiredAt(U, "L1", json("{\"acquiredAt\":\"2026-01-01\"}"));
        verify(repo).updateAcquiredDates(U, "L1", false, null, true, D);
        service.saveAcquiredAt(U, "L1", json("{\"acquiredAt\":null}"));
        verify(repo).updateAcquiredDates(U, "L1", false, null, true, null);
    }

    @Test
    @DisplayName("획득일 — 미래 날짜는 거절")
    void 획득일_미래_거절() {
        states(LegendStatus.OWNED);
        String f = TODAY.plusDays(1).toString();
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_ACQUIRED_AT_FUTURE,
                failAt("{\"acquiredAt\":\"" + f + "\"}").getCode());
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_ACQUIRED_AT_FUTURE,
                failAt("{\"frameAcquiredAt\":\"" + f + "\"}").getCode());
    }

    @Test
    @DisplayName("일괄 저장 — 미보유→액자는 액자 획득일, 미보유→보유중은 보유일(없으면 오늘)")
    void 일괄_획득일_신규() {
        service.saveChanges(U, req(null, List.of(new LegendChange("L1", LegendStatus.FRAME, D),
                new LegendChange("L2", LegendStatus.OWNED, D)), null));
        verify(repo).upsertLegendState(U, "L1", LegendStatus.FRAME, null, D);
        verify(repo).upsertLegendState(U, "L2", LegendStatus.OWNED, D, null);
        service.saveChanges(U, req(null, List.of(new LegendChange("L1", LegendStatus.FRAME, null)), null));
        verify(repo).upsertLegendState(U, "L1", LegendStatus.FRAME, null, TODAY);
    }

    @Test
    @DisplayName("일괄 저장 — 액자→보유중은 보유일만 새로(액자 획득일 유지), 보유중→액자는 보유일 비움")
    void 일괄_획득일_전환() {
        states(LegendStatus.FRAME);
        service.saveChanges(U, req(null, List.of(new LegendChange("L1", LegendStatus.OWNED, D)), null));
        verify(repo).upsertLegendState(U, "L1", LegendStatus.OWNED, D, null);
        states(LegendStatus.OWNED);
        service.saveChanges(U, req(null, List.of(new LegendChange("L1", LegendStatus.FRAME, D)), null));
        verify(repo).upsertLegendState(U, "L1", LegendStatus.FRAME, null, null);
    }

    @Test
    @DisplayName("일괄 저장 — 미래 획득일은 거절")
    void 일괄_미래_거절() {
        var e = fail(req(null, List.of(new LegendChange("L1", LegendStatus.OWNED, TODAY.plusDays(1))), null));
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_ACQUIRED_AT_FUTURE, e.getCode());
    }
}
