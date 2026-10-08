package com.dawne.com2usbaseball.domain.gamification.repository;

import com.dawne.com2usbaseball.domain.gamification.entity.*;
import com.dawne.com2usbaseball.domain.gamification.repository.mapper.GamificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class GamificationRepository {

    private final GamificationMapper mapper;

    public List<RewardRuleEntity> findRules() { return mapper.selectRules(); }
    public List<RewardLevelEntity> findLevels() { return mapper.selectLevels(); }

    /** 이미 같은 키가 있으면 false. */
    public boolean insertLedgerIfAbsent(LedgerEntity ledger) { return mapper.insertLedgerIfAbsent(ledger) > 0; }
    public LedgerEntity findSums(Long userId) { return mapper.selectSums(userId); }
    public List<LedgerEntity> findLedger(Long userId, int size) { return mapper.selectLedger(userId, size); }
    public List<LedgerEntity> findLedgerPage(Long userId, String type, int offset, int limit) { return mapper.selectLedgerPage(userId, type, offset, limit); }
    public List<LocalDate> findCheckinDates(Long userId, int limit) { return mapper.selectCheckinDates(userId, limit); }

    public void insertActivity(Long userId, String type, LocalDate date) { mapper.insertActivity(userId, type, date); }
    /** date 가 null 이면 전체 횟수. */
    public int countActivity(Long userId, String type, LocalDate date) { return mapper.countActivity(userId, type, date); }

    public Optional<TitleEntity> findTitleByCode(String code) { return Optional.ofNullable(mapper.selectTitleByCode(code)); }
    public List<TitleEntity> findAllTitles() { return mapper.selectAllTitles(); }
    public List<TitleEntity> findOwnedTitles(Long userId) { return mapper.selectOwnedTitles(userId); }
    public void insertUserTitleIfAbsent(Long userId, Long titleId) { mapper.insertUserTitleIfAbsent(userId, titleId); }
    /** 지운 행이 있으면 true. */
    public boolean deleteUserTitle(Long userId, Long titleId) { return mapper.deleteUserTitle(userId, titleId) > 0; }
    public void clearEquipped(Long userId) { mapper.clearEquipped(userId); }
    public void equip(Long userId, Long titleId) { mapper.updateEquipped(userId, titleId); }

    public Optional<Long> findUserIdByPublicId(String publicId) { return Optional.ofNullable(mapper.selectUserIdByPublicId(publicId)); }
    public String findUserRole(Long userId) { return mapper.selectUserRole(userId); }
    public Optional<String> findPublicIdByUserId(Long userId) { return Optional.ofNullable(mapper.selectPublicIdByUserId(userId)); }
    public List<EarlyCandidateEntity> findEarlyCandidates(LocalDateTime from, LocalDateTime to) { return mapper.selectEarlyCandidates(from, to); }
    public List<Long> findVisitedUserIds(LocalDateTime since) { return mapper.selectVisitedUserIds(since); }
}
