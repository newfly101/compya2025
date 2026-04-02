package com.dawne.com2usbaseball.domain.kbo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KboGameEntity {

    // 식별
    String gameId;
    int    seasonYear;

    // 일정
    LocalDate     gameDate;
    LocalDateTime gameDatetime;
    String        stadium;

    // 홈팀
    String homeTeamCode;
    String homeTeamName;
    int    homeScore;
    String homeStarter;
    String homeEmblemUrl;

    // 원정팀
    String awayTeamCode;
    String awayTeamName;
    int    awayScore;
    String awayStarter;
    String awayEmblemUrl;

    // 결과
    String winner;        // HOME | AWAY | DRAW
    String winPitcher;
    String losePitcher;

    // 상태
    String  statusCode;   // BEFORE | LIVE | RESULT | CANCEL
    String  statusInfo;
    boolean canceled;
    boolean suspended;
}
