package com.dawne.com2usbaseball.domain.gamification.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.gamification.dto.request.TitleActionRequest;
import com.dawne.com2usbaseball.domain.gamification.dto.response.TitleGrantResponse;
import com.dawne.com2usbaseball.domain.gamification.dto.response.TitleRevokeResponse;
import com.dawne.com2usbaseball.domain.gamification.entity.TitleEntity;
import com.dawne.com2usbaseball.domain.gamification.enums.GamificationMessages;
import com.dawne.com2usbaseball.domain.gamification.repository.GamificationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import com.dawne.com2usbaseball.domain.gamification.entity.LedgerEntity;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.IntSupplier;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AdminGamificationServiceTest {

    private final GamificationRepository repository = mock(GamificationRepository.class);
    private final GamificationService gamificationService = mock(GamificationService.class);
    private final RewardService rewardService = mock(RewardService.class);
    private final AdminGamificationService service =
            new AdminGamificationService(repository, gamificationService, rewardService);

    private static TitleEntity title(long id, String code, String category, int bonus) {
        return TitleEntity.builder().id(id).code(code).name(code).category(category).bonusPoint(bonus).build();
    }

    private void stub(Long userId, TitleEntity t) {
        when(repository.findPublicIdByUserId(1L)).thenReturn(Optional.of("admin-pid"));
        when(repository.findUserIdByPublicId("p")).thenReturn(Optional.of(userId));
        when(repository.findTitleByCode(t.getCode())).thenReturn(Optional.of(t));
    }

    private static void assertError(GamificationMessages code, HttpStatus status, Runnable r) {
        BaseException e = assertThrows(BaseException.class, r::run);
        assertEquals(code, e.getCode());
        assertEquals(status, e.getStatus());
    }

    @Test
    @DisplayName("MANUAL 이 아닌 칭호는 400")
    void MANUAL_아님_400() {
        stub(1L, title(1, "FOUNDER", "AUTO", 100));
        assertError(GamificationMessages.GAMIFICATION_TITLE_NOT_MANUAL, HttpStatus.BAD_REQUEST,
                () -> service.grantTitle(new TitleActionRequest("p", "FOUNDER"), 1L));
    }

    @Test
    @DisplayName("시범 대상이 아닌 유저는 400 — 아무것도 기록하지 않는다")
    void 시범_대상_아님_400() {
        stub(2L, title(5, "BUG_HUNTER", "MANUAL", 100));
        assertError(GamificationMessages.GAMIFICATION_PILOT_ONLY, HttpStatus.BAD_REQUEST,
                () -> service.grantTitle(new TitleActionRequest("p", "BUG_HUNTER"), 1L));
        verifyNoInteractions(gamificationService);
    }

    @Test
    @DisplayName("GM 은 대상이 관리자가 아니면 403")
    void GM_비관리자_403() {
        stub(1L, title(6, "GM", "MANUAL", 0));
        when(repository.findUserRole(1L)).thenReturn("USER");
        assertError(GamificationMessages.GAMIFICATION_GM_ADMIN_ONLY, HttpStatus.FORBIDDEN,
                () -> service.grantTitle(new TitleActionRequest("p", "GM"), 1L));
        verifyNoInteractions(gamificationService);
    }

    @Test
    @DisplayName("이미 보유한 칭호 지급은 granted=false — 멱등")
    void 지급_멱등() {
        stub(1L, title(5, "BUG_HUNTER", "MANUAL", 100));
        when(repository.findOwnedTitles(1L)).thenReturn(List.of(title(5, "BUG_HUNTER", "MANUAL", 100)));
        TitleGrantResponse r = service.grantTitle(new TitleActionRequest("p", "BUG_HUNTER"), 1L);
        assertFalse(r.granted());
        verify(gamificationService, never()).grantTitle(any(), any(), any(), any());
    }

    @Test
    @DisplayName("미보유 칭호 지급은 기존 지급 경로를 타고 granted=true")
    void 지급_성공() {
        TitleEntity t = title(5, "BUG_HUNTER", "MANUAL", 100);
        stub(1L, t);
        when(repository.findOwnedTitles(1L)).thenReturn(List.of(), List.of(t));
        TitleGrantResponse r = service.grantTitle(new TitleActionRequest("p", "BUG_HUNTER"), 1L);
        assertTrue(r.granted());
        assertEquals(100, r.bonusPoint());
        verify(gamificationService).grantTitle(eq(1L), eq("BUG_HUNTER"), startsWith("ADMIN_TITLE:1:BUG_HUNTER:"),
                eq("칭호 지급 by admin-pid"));
    }

    @Test
    @DisplayName("회수하면 칭호 행을 지우고 보너스를 음수 원장으로 남긴다")
    void 회수_음수_원장() {
        stub(1L, title(5, "BUG_HUNTER", "MANUAL", 100));
        when(repository.deleteUserTitle(1L, 5L)).thenReturn(true);
        TitleRevokeResponse r = service.revokeTitle(new TitleActionRequest("p", "BUG_HUNTER"), 1L);
        assertTrue(r.revoked());
        verify(rewardService).grant(eq(1L), startsWith("TITLE_REVOKE:1:BUG_HUNTER:"), eq("TITLE"),
                eq(0), eq(-100), eq("BUG_HUNTER"), eq("칭호 회수 by admin-pid"));
    }

    @Test
    @DisplayName("미보유 칭호 회수는 revoked=false, 원장 기록 없음")
    void 회수_미보유() {
        stub(1L, title(5, "BUG_HUNTER", "MANUAL", 100));
        when(repository.deleteUserTitle(1L, 5L)).thenReturn(false);
        assertFalse(service.revokeTitle(new TitleActionRequest("p", "BUG_HUNTER"), 1L).revoked());
        verifyNoInteractions(rewardService);
    }

    @Test
    @DisplayName("지급 → 회수 → 재지급: 원장 포인트 합이 +B → 0 → +B, 보유 중 재지급은 원장 행 없음")
    void 재지급_보너스_원장() {
        // 실제 GamificationService/RewardService 를 쓰고 저장소만 메모리로 흉내낸다
        TitleEntity t = title(5, "BUG_HUNTER", "MANUAL", 100);
        List<LedgerEntity> ledger = new ArrayList<>();
        Set<String> keys = new HashSet<>();
        boolean[] owned = {false};
        when(repository.findPublicIdByUserId(1L)).thenReturn(Optional.of("admin-pid"));
        when(repository.findUserIdByPublicId("p")).thenReturn(Optional.of(1L));
        when(repository.findTitleByCode("BUG_HUNTER")).thenReturn(Optional.of(t));
        when(repository.findOwnedTitles(1L)).thenAnswer(i -> owned[0] ? List.of(t) : List.of());
        doAnswer(i -> owned[0] = true).when(repository).insertUserTitleIfAbsent(1L, 5L);
        when(repository.deleteUserTitle(1L, 5L)).thenAnswer(i -> { boolean had = owned[0]; owned[0] = false; return had; });
        when(repository.insertLedgerIfAbsent(any())).thenAnswer(i -> {
            LedgerEntity l = i.getArgument(0);
            if (!keys.add(l.getRewardKey())) return false;
            ledger.add(l);
            return true;
        });
        RewardService reward = new RewardService(repository);
        AdminGamificationService svc = new AdminGamificationService(repository,
                new GamificationService(repository, reward), reward);
        TitleActionRequest req = new TitleActionRequest("p", "BUG_HUNTER");
        IntSupplier sum = () -> ledger.stream().mapToInt(LedgerEntity::getPointDelta).sum();

        assertTrue(svc.grantTitle(req, 1L).granted());
        assertEquals(100, sum.getAsInt());
        assertFalse(svc.grantTitle(req, 1L).granted());
        assertEquals(1, ledger.size());
        assertTrue(svc.revokeTitle(req, 1L).revoked());
        assertEquals(0, sum.getAsInt());
        assertTrue(svc.grantTitle(req, 1L).granted());
        assertEquals(100, sum.getAsInt());
        assertTrue(ledger.stream().allMatch(l -> l.getReason().endsWith("by admin-pid")));
    }
}
