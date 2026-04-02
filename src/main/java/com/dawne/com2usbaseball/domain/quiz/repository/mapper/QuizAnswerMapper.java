package com.dawne.com2usbaseball.domain.quiz.repository.mapper;

import com.dawne.com2usbaseball.domain.quiz.entity.QuizAnswerEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface QuizAnswerMapper {
    Optional<QuizAnswerEntity> selectLatestVisible();
    List<QuizAnswerEntity> selectAll();
    int insertQuizAnswer(QuizAnswerEntity entity);
    int updateQuizAnswer(QuizAnswerEntity entity);
    int updateVisible(@Param("id") Long id, @Param("visible") boolean visible);
}
