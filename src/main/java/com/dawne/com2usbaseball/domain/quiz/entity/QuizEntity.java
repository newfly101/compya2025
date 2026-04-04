package com.dawne.com2usbaseball.domain.quiz.entity;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizEntity {
    private Long id;
    private Integer round;
    private String imageUrl;
    private boolean isVisible;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
