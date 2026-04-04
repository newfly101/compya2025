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

    QuizResponse toResponse(QuizEntity entity);

    List<QuizResponse> toResponseList(List<QuizEntity> entities);
}
