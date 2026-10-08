package com.dawne.com2usbaseball.domain.gamification.repository.mapper;

import com.dawne.com2usbaseball.domain.gamification.entity.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface GamificationMapper {

    List<RewardRuleEntity> selectRules();
    List<RewardLevelEntity> selectLevels();

    // 원장
    int insertLedgerIfAbsent(LedgerEntity ledger);
    LedgerEntity selectSums(@Param("userId") Long userId);
    List<LedgerEntity> selectLedger(@Param("userId") Long userId, @Param("size") int size);
    List<LedgerEntity> selectLedgerPage(@Param("userId") Long userId, @Param("type") String type,
                                        @Param("offset") int offset, @Param("limit") int limit);
    List<LocalDate> selectCheckinDates(@Param("userId") Long userId, @Param("limit") int limit);

    // 활동 (저장 횟수)
    int insertActivity(@Param("userId") Long userId, @Param("type") String type, @Param("date") LocalDate date);
    int countActivity(@Param("userId") Long userId, @Param("type") String type, @Param("date") LocalDate date);

    // 칭호
    TitleEntity selectTitleByCode(@Param("code") String code);
    List<TitleEntity> selectAllTitles();
    List<TitleEntity> selectOwnedTitles(@Param("userId") Long userId);
    int insertUserTitleIfAbsent(@Param("userId") Long userId, @Param("titleId") Long titleId);
    int deleteUserTitle(@Param("userId") Long userId, @Param("titleId") Long titleId);
    int clearEquipped(@Param("userId") Long userId);
    int updateEquipped(@Param("userId") Long userId, @Param("titleId") Long titleId);

    // 유저 조회 (보상 대상 판정용 — site_users 읽기 전용)
    Long selectUserIdByPublicId(@Param("publicId") String publicId);
    String selectUserRole(@Param("userId") Long userId);
    String selectPublicIdByUserId(@Param("userId") Long userId);
    List<EarlyCandidateEntity> selectEarlyCandidates(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
    List<Long> selectVisitedUserIds(@Param("since") LocalDateTime since);
}
