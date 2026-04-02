package com.dawne.com2usbaseball.domain.kbo.dto.response;

import com.dawne.com2usbaseball.domain.kbo.entity.KboGameEntity;

import java.time.format.DateTimeFormatter;
import java.util.List;

public record KboMatchResponse(
        String matchId,
        String gameDate,
        String gameTime,
        String stadium,
        String status,           // BEFORE | LIVE | FINAL | CANCEL
        KboTeamInfo homeTeam,
        KboTeamInfo awayTeam
) {
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * KboGameEntity + 최근 결과 목록 → KboMatchResponse 변환
     *
     * @param game        kbo_games 엔티티
     * @param homeRecent  홈팀 최근 5경기 결과 리스트 ("W" | "L" | "D")
     * @param awayRecent  원정팀 최근 5경기 결과 리스트
     */
    public static KboMatchResponse from(KboGameEntity game,
                                        List<String> homeRecent,
                                        List<String> awayRecent) {

        String gameTime = (game.getGameDatetime() != null)
                ? game.getGameDatetime().format(TIME_FMT)
                : "";

        // DB statusCode → 프론트 status 매핑
        String status = switch (game.getStatusCode()) {
            case "RESULT" -> "FINAL";
            case "LIVE"   -> "LIVE";
            case "CANCEL" -> "CANCEL";
            default       -> "BEFORE";
        };

        KboTeamInfo home = new KboTeamInfo(
                game.getHomeTeamCode(),
                game.getHomeTeamName(),
                game.getHomeEmblemUrl(),
                nullIfEmpty(game.getHomeStarter()),
                homeRecent,
                null
        );

        KboTeamInfo away = new KboTeamInfo(
                game.getAwayTeamCode(),
                game.getAwayTeamName(),
                game.getAwayEmblemUrl(),
                nullIfEmpty(game.getAwayStarter()),
                awayRecent,
                null
        );

        return new KboMatchResponse(
                game.getGameId(),
                game.getGameDate().format(DATE_FMT),
                gameTime,
                game.getStadium(),
                status,
                home,
                away
        );
    }

    private static String nullIfEmpty(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}
