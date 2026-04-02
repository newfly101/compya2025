package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import com.dawne.com2usbaseball.common.enums.fun.CardGrade;
import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerCardEntity {
    private Long id;
    private String cardCode;
    private String playerId;
    private String playerName;
    private Long teamId;
    private PlayerRole playerRole;
    private CardGrade cardGrade;
    private Short seasonYear;
    private Short overallRating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
