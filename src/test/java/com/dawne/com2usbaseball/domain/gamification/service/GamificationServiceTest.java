package com.dawne.com2usbaseball.domain.gamification.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.gamification.dto.response.CheckInResponse;
import com.dawne.com2usbaseball.domain.gamification.dto.response.LedgerHistoryResponse;
import com.dawne.com2usbaseball.domain.gamification.entity.LedgerEntity;
import com.dawne.com2usbaseball.domain.gamification.entity.RewardLevelEntity;
import com.dawne.com2usbaseball.domain.gamification.entity.RewardRuleEntity;
import com.dawne.com2usbaseball.domain.gamification.repository.GamificationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class GamificationServiceTest {

    private final GamificationRepository repository = mock(GamificationRepository.class);
    private final RewardService rewardService = mock(RewardService.class);
    private final GamificationService service = new GamificationService(repository, rewardService);

    private static List<LedgerEntity> rows(int n) {
        List<LedgerEntity> list = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            list.add(LedgerEntity.builder().sourceType("SAVE").xpDelta(1).pointDelta(0)
                    .reason("저장").rewardDate(LocalDate.of(2026, 10, 8)).build());
        }
        return list;
    }

    @Test
    @DisplayName("내역 20건이면 다음 페이지 없음")
    void 내역_20건_다음없음() {
        when(repository.findLedgerPage(1L, "XP", 0, 21)).thenReturn(rows(20));
        LedgerHistoryResponse r = service.getHistory(1L, "XP", 0);
        assertFalse(r.hasNext());
        assertEquals(20, r.items().size());
    }

    @Test
    @DisplayName("내역 21건이면 다음 페이지 있음 — 20건만 돌려준다")
    void 내역_21건_다음있음() {
        when(repository.findLedgerPage(1L, "POINT", 20, 21)).thenReturn(rows(21));
        LedgerHistoryResponse r = service.getHistory(1L, "POINT", 1);
        assertTrue(r.hasNext());
        assertEquals(20, r.items().size());
        assertEquals("POINT", r.type());
    }

    @Test
    @DisplayName("type 이 XP/POINT 가 아니거나 page 가 음수면 400")
    void 내역_잘못된_입력() {
        assertThrows(BaseException.class, () -> service.getHistory(1L, "ABC", 0));
        assertThrows(BaseException.class, () -> service.getHistory(1L, "XP", -1));
    }

    private void stubCheckIn(int xpBefore, int xpAfter, boolean first) {
        RewardRuleEntity rule = new RewardRuleEntity();
        rule.setActivityType("CHECKIN");
        rule.setXp(10);
        rule.setPoint(5);
        when(repository.findRules()).thenReturn(List.of(rule));
        when(repository.findLevels()).thenReturn(List.of(
                new RewardLevelEntity(1, "연습생", 0, 0), new RewardLevelEntity(2, "신인", 50, 100)));
        when(repository.findSums(1L)).thenReturn(
                LedgerEntity.builder().xpDelta(xpBefore).build(),
                LedgerEntity.builder().xpDelta(xpAfter).build());
        when(rewardService.grant(eq(1L), anyString(), eq("CHECKIN"), anyInt(), anyInt(), any(), anyString())).thenReturn(first);
        when(repository.findCheckinDates(eq(1L), anyInt())).thenReturn(List.of(RewardService.today()));
        when(repository.findOwnedTitles(1L)).thenReturn(List.of());
    }

    @Test
    @DisplayName("출석으로 등급 기준을 넘으면 레벨업 표시")
    void 체크인_레벨업() {
        stubCheckIn(45, 55, true);
        CheckInResponse r = service.checkIn(1L);
        assertTrue(r.leveledUp());
        assertEquals(2, r.level());
        assertEquals("신인", r.levelName());
    }

    @Test
    @DisplayName("등급이 그대로거나 이미 받은 날은 레벨업 아님")
    void 체크인_레벨업_아님() {
        stubCheckIn(10, 20, true);
        assertFalse(service.checkIn(1L).leveledUp());
        stubCheckIn(60, 60, false);
        CheckInResponse again = service.checkIn(1L);
        assertFalse(again.leveledUp());
        assertEquals(0, again.xp());
    }
}
