package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import lombok.*;

import java.util.List;

/**
 * data_player_card(한 구단) + data_player_card_stat + (LEFT JOIN) data_player_card_pitch 조인 결과.
 * 타자는 pitches 가 빈 목록.
 *
 * card_id(UUID) 는 갖지 않는다 — (teamCode, seasonYear, positionCode, playerName) 이
 * data_player_card 의 UNIQUE 키(카드종류 제외, 이 조회 범위는 NORMAL 뿐이라 유일함이 그대로 유지된다)라
 * MyBatis 매핑·화면 매칭 모두 이 4개 조합으로 충분하다.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerCardStatEntity {
    private String teamCode;
    private Integer seasonYear;
    private String positionCode;
    private String playerName;
    private PlayerRole playerRole;

    private Short stat1;
    private Short stat2;
    private Short stat3;
    private Short stat4;
    private Short stat5;

    private List<PlayerCardPitchEntity> pitches;
}
