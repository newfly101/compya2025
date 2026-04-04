package com.dawne.com2usbaseball.domain.quiz.repository;

import com.dawne.com2usbaseball.domain.quiz.entity.QuizEntity;
import com.dawne.com2usbaseball.domain.quiz.repository.mapper.QuizMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class QuizRepository {

    private final QuizMapper mapper;

    public Optional<QuizEntity> findLatestVisible() {
        return mapper.selectLatestVisible();
    }

    public List<QuizEntity> findAll() {
        return mapper.selectAll();
    }

    public Optional<QuizEntity> findById(Long id) {
        return mapper.selectById(id);
    }

    public boolean save(QuizEntity entity) {
        return mapper.insertQuiz(entity) > 0;
    }

    public boolean update(QuizEntity entity) {
        return mapper.updateQuiz(entity) > 0;
    }

    public boolean delete(Long id) {
        return mapper.deleteQuiz(id) > 0;
    }
}
