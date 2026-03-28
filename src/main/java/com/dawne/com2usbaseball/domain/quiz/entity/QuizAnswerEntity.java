package com.dawne.com2usbaseball.domain.quiz.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAnswerEntity {
    Long id;
    Integer round;
    String title;
    String imageUrl;
    boolean visible;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
