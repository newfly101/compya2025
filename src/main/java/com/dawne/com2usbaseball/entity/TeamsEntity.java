package com.dawne.com2usbaseball.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamsEntity {
    Long id;
    String teamCode;
    String teamName;
    Integer latestTeam;
}
