package com.dawne.com2usbaseball.domain.analytics.repository;

import com.dawne.com2usbaseball.domain.analytics.dto.response.SignupConversionRow;
import com.dawne.com2usbaseball.domain.analytics.repository.mapper.AnalyticsFirstSeenMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class AnalyticsFirstSeenRepository {

    private final AnalyticsFirstSeenMapper analyticsFirstSeenMapper;

    public void upsertFirstSeen(String anonId, LocalDate firstSeenDate) {
        analyticsFirstSeenMapper.upsertFirstSeen(anonId, firstSeenDate);
    }

    public void markConverted(String anonId, Long userId, LocalDateTime convertedAt) {
        analyticsFirstSeenMapper.markConverted(anonId, userId, convertedAt);
    }

    public List<SignupConversionRow> sumSignupConversion(LocalDate start, LocalDate end) {
        return analyticsFirstSeenMapper.sumSignupConversion(start, end);
    }
}
