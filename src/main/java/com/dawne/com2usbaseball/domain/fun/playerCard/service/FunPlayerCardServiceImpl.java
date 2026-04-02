package com.dawne.com2usbaseball.domain.fun.playerCard.service;

import com.dawne.com2usbaseball.domain.fun.playerCard.dto.FunPlayerCardDtoMapper;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardCreateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardUpdateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.FunPlayerCardResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.fun.playerCard.repository.FunPlayerCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class FunPlayerCardServiceImpl implements FunPlayerCardService {

    private final FunPlayerCardRepository funPlayerCardRepository;
    private final FunPlayerCardDtoMapper mapper;

    @Override
    @Transactional
    public Long create(FunPlayerCardCreateRequest request) {
        PlayerCardEntity entity = mapper.toEntity(request);

        return funPlayerCardRepository.insert(entity);
    }

    @Override
    @Transactional
    public void update(Long id, FunPlayerCardUpdateRequest request) {
        PlayerCardEntity entity = funPlayerCardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id"));

        mapper.updateFromRequest(request, entity);

        funPlayerCardRepository.update(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        int deletedCount = funPlayerCardRepository.deleteById(id);
        if (deletedCount == 0) {
            throw new IllegalArgumentException("존재하지 않는 playerCard id 입니다. id=" + id);
        }
    }

    @Override
    public FunPlayerCardResponse getById(Long id) {
        PlayerCardEntity entity = funPlayerCardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("없음"));

        return mapper.toResponse(entity);
    }

    @Override
    public PlayerCardEntity getByCardCode(String cardCode) {
        return funPlayerCardRepository.findByCardCode(cardCode)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 cardCode 입니다. cardCode=" + cardCode));
    }

    @Override
    public List<FunPlayerCardResponse> getAll() {

        return funPlayerCardRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }
}
