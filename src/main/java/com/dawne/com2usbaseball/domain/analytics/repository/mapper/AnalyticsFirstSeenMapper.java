package com.dawne.com2usbaseball.domain.analytics.repository.mapper;

import com.dawne.com2usbaseball.domain.analytics.dto.response.SignupConversionRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** site_user_first_seen(anon_id 최초 관측일 + 가입 전환) 전용 매퍼. */
@Mapper
public interface AnalyticsFirstSeenMapper {

    /** 이미 있으면 아무것도 바꾸지 않는다(최초 관측일은 불변). */
    void upsertFirstSeen(@Param("anonId") String anonId, @Param("firstSeenDate") LocalDate firstSeenDate);

    /** converted_user_id 가 이미 채워졌으면 갱신하지 않는다(최초 전환만 기록). */
    void markConverted(@Param("anonId") String anonId, @Param("userId") Long userId, @Param("convertedAt") LocalDateTime convertedAt);

    List<SignupConversionRow> sumSignupConversion(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
