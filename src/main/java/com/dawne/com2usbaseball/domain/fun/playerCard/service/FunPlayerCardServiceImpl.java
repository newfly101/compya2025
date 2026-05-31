package com.dawne.com2usbaseball.domain.fun.playerCard.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.FunPlayerCardDtoMapper;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardCreateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardUpdateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.FunPlayerCardResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.fun.playerCard.enums.FunPlayerCardMessages;
import com.dawne.com2usbaseball.domain.fun.playerCard.repository.FunPlayerCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
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
                .orElseThrow(() -> new BaseException(FunPlayerCardMessages.FUN_PLAYER_CARD_NOT_FOUND, HttpStatus.NOT_FOUND));

        mapper.updateFromRequest(request, entity);

        funPlayerCardRepository.update(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        int deletedCount = funPlayerCardRepository.deleteById(id);
        if (deletedCount == 0) {
            throw new BaseException(FunPlayerCardMessages.FUN_PLAYER_CARD_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
    }

    @Override
    public FunPlayerCardResponse getById(Long id) {
        PlayerCardEntity entity = funPlayerCardRepository.findById(id)
                .orElseThrow(() -> new BaseException(FunPlayerCardMessages.FUN_PLAYER_CARD_NOT_FOUND, HttpStatus.NOT_FOUND));

        return mapper.toResponse(entity);
    }

    @Override
    public PlayerCardEntity getByCardCode(String cardCode) {
        return funPlayerCardRepository.findByCardCode(cardCode)
                .orElseThrow(() -> new BaseException(FunPlayerCardMessages.FUN_PLAYER_CARD_CARD_CODE_NOT_FOUND, HttpStatus.NOT_FOUND));
    }

    @Override
    public List<FunPlayerCardResponse> getAll() {

        return funPlayerCardRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }
}
