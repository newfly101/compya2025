package com.dawne.com2usbaseball.domain.legendCollection.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
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
    private static final Long U = 1L;

    @BeforeEach
    void setUp() {
        repo = Mockito.mock(LegendCollectionRepository.class);
        service = new LegendCollectionServiceImpl(repo);
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
        when(repo.findLegendStates(U)).thenReturn(List.of(new LegendStateEntity("L1", LegendStatus.OWNED)));
        var e = fail(req(List.of(new MaterialChange("M1", MaterialState.HAVE)), null, null));
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_OWNED_LEGEND_LOCKED, e.getCode());
    }

    @Test
    @DisplayName("보유중으로 바꾸면 재료 0/8 초기화, 선호에서 빠지고 순위가 당겨진다")
    void 보유중_전환() {
        when(repo.findPreferences(U)).thenReturn(List.of(
                new PreferenceEntity("L1", 1), new PreferenceEntity("L2", 2)));
        service.saveChanges(U, req(null, List.of(new LegendChange("L1", LegendStatus.OWNED)), null));
        verify(repo).deleteMaterialStatesByLegendIds(U, List.of("L1"));
        verify(repo).upsertLegendState(U, "L1", LegendStatus.OWNED);
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
        when(repo.findLegendStates(U)).thenReturn(List.of(new LegendStateEntity("L1", LegendStatus.OWNED)));
        var r = new com.dawne.com2usbaseball.domain.legendCollection.dto.request.SavePreferencesRequest(
                null, List.of(new com.dawne.com2usbaseball.domain.legendCollection.dto.request.SavePreferencesRequest.Preference("L1", 1)), null);
        var e = assertThrows(BaseException.class, () -> service.savePreferences(U, r));
        assertEquals(LegendCollectionMessages.LEGEND_COLLECTION_PREFERENCE_OWNED_LEGEND, e.getCode());
    }
}
