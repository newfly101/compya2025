package com.dawne.com2usbaseball.domain.gamification.entity;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EarlyCandidateEntity {
    private Long id;
    private String publicId;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
