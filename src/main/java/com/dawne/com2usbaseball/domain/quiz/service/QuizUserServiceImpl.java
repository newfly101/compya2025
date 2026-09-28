package com.dawne.com2usbaseball.domain.quiz.service;

import com.dawne.com2usbaseball.domain.quiz.dto.mapstruct.QuizMapStruct;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;
import com.dawne.com2usbaseball.domain.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuizUserServiceImpl implements QuizUserService {

    private final QuizRepository repository;
    private final QuizMapStruct quizMapStruct;

    // 테이블이 비어 있으면 null 을 그대로 반환해 캐시에 올린다(ConcurrentMapCache 는 null 도 캐시함).
    // 여기서 예외를 던지면 반환값이 없어 캐시에 아무것도 안 올라가고, 홈을 열 때마다 DB 조회 + 예외가 반복된다.
    // 404 판단은 이 값을 소비하는 컨트롤러에서 한다.
    @Override
    @Cacheable(value = "quiz", key = "'latest'")
    public QuizResponse getLatest() {
        return repository.findLatestVisible()
                .map(quizMapStruct::toResponse)
                .orElse(null);
    }
}
