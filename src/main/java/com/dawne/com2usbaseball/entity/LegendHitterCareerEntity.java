package com.dawne.com2usbaseball.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LegendHitterCareerEntity {
    int seasons;
    int games;
    BigDecimal avg;
    int atBats;
    int hits;
    int doubles;
    int triples;
    int homeRuns;
    int steals;
    int rbi;
    int runs;
    int strikeouts;
    int walks;
}
