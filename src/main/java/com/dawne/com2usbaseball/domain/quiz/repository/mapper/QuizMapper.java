package com.dawne.com2usbaseball.domain.quiz.repository.mapper;

import com.dawne.com2usbaseball.domain.quiz.entity.QuizEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface QuizMapper {
    Optional<QuizEntity> selectLatestVisible();
    List<QuizEntity> selectAll();
    Optional<QuizEntity> selectById(@Param("id") Long id);
    int insertQuiz(QuizEntity entity);
    int updateQuiz(QuizEntity entity);
    int deleteQuiz(@Param("id") Long id);
}
