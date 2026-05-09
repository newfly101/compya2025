package com.dawne.com2usbaseball.domain.quiz.dto.mapstruct;
import com.dawne.com2usbaseball.domain.quiz.dto.request.QuizRequest;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;
import com.dawne.com2usbaseball.domain.quiz.entity.QuizEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuizMapStruct {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    QuizEntity toEntity(QuizRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(QuizRequest request, @MappingTarget QuizEntity entity);

    /**
     * BE 동적 title 합성: "🎉컴프야 퀴즈 이벤트 {round}회 정답"
     * (PRD docs/prd/domains/quiz.md Part B v2 T3)
     */
    @Mapping(
            target = "title",
            expression = "java(entity.getRound() == null ? null : \"\\uD83C\\uDF89컴프야 퀴즈 이벤트 \" + entity.getRound() + \"회 정답\")"
    )
    QuizResponse toResponse(QuizEntity entity);

    List<QuizResponse> toResponseList(List<QuizEntity> entities);
}
