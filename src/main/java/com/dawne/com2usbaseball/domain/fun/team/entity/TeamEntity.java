package com.dawne.com2usbaseball.domain.fun.team.entity;

import lombok.*;

import java.time.LocalDateTime;

/**
 * fun_teams 1:1 매핑.
 * unique key 가 (team_code, start_year) 라 같은 team_code 가 여러 행일 수 있다 (팀명 변경 이력).
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TeamEntity {
    private Long id;
    private String teamCode;
    private String teamName;
    private Long latestTeamId;
    private String cityName;
    private Integer startYear;
    private Integer endYear;
    private String emblemUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
