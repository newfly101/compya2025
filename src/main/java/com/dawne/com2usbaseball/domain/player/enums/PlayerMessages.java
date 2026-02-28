package com.dawne.com2usbaseball.domain.player.enums;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum PlayerMessages {
    PLAYER_CREATED, // playerCard 생성 meta
    PLAYER_CREATED_WITH_ATTRIBUTE, // playerCard 생성 meta + attribute
    PLAYER_CREATED_WITHOUT_ATTRIBUTE, // playerCard 생성 meta
    PLAYER_UPDATED,
    PLAYER_DELETED,
    PLAYER_FAILED
}
