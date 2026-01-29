package com.dawne.com2usbaseball.domain.player.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LegendPitcherCareerEntity {
    int seasons;
    int games;
    BigDecimal era;
    int wins;
    int losses;
    int saves;
    int holds;
    int strikeouts;
    int walks;
    int hitsAllowed;
}
