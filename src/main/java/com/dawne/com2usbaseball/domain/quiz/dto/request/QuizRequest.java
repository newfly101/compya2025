package com.dawne.com2usbaseball.domain.quiz.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

// round 는 회차 번호라 1 이상. imageUrl 상한은 fun_quiz.image_url VARCHAR(500) 기준.
public record QuizRequest(
        @Min(1) Integer round,
        @Size(max = 500) String imageUrl
) {}
