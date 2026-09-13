package com.dawne.com2usbaseball.domain.statistics.entity;

import lombok.*;

import java.time.LocalDateTime;

/**
 * statistic_support_click 1행. MyBatis 가 setter 로 채우므로 record 로 만들 수 없다.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StatisticSupportClickEntity {
    private Long id;
    private Long userId;
    private String target;
    private LocalDateTime createdAt;
}
