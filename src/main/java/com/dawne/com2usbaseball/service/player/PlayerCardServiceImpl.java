package com.dawne.com2usbaseball.service.player;

import com.dawne.com2usbaseball.dto.response.playerInfo.PlayerCardResponse;
import com.dawne.com2usbaseball.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.enums.Target;
import com.dawne.com2usbaseball.repository.PlayerCardInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlayerCardServiceImpl implements PlayerCardService {

    private final PlayerCardInfoRepository repository;
    private final CardNameGrouper cardNameGrouper;
    private final CardInfoMaker cardInfoMaker;

    @Override
    public List<PlayerCardResponse> getPlayerInfo(Target target) {

        List<PlayerCardEntity> list = repository.findAllPlayerCardInfoByPosition(target);

        Map<String, List<PlayerCardEntity>> grouped = cardNameGrouper.nameListMap(list);

        List<PlayerCardResponse> cardInfoList = cardInfoMaker.makeCardInfoList(grouped);

        return cardInfoList;
    }
}
