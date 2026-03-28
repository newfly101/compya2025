package com.dawne.com2usbaseball.domain.quiz.repository;

import com.dawne.com2usbaseball.domain.quiz.entity.QuizAnswerEntity;
import com.dawne.com2usbaseball.domain.quiz.repository.mapper.QuizAnswerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class QuizAnswerRepository {

    private final QuizAnswerMapper mapper;

    public Optional<QuizAnswerEntity> findLatestVisible() {
        return mapper.selectLatestVisible();
    }

    public List<QuizAnswerEntity> findAll() {
        return mapper.selectAll();
    }

    public boolean save(QuizAnswerEntity entity) {
        return mapper.insertQuizAnswer(entity) > 0;
    }

    public boolean update(QuizAnswerEntity entity) {
        return mapper.updateQuizAnswer(entity) > 0;
    }

    public boolean updateVisible(Long id, boolean visible) {
        return mapper.updateVisible(id, visible) > 0;
    }
}
