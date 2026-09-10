package com.dawne.com2usbaseball.domain.fun.playerCard;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper.PlayerCardMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 선수 카드 목록 조회 매퍼 검증. 실제 DB(data_player_card 11,668행)로 확인한다.
 */
@SpringBootTest
class PlayerCardMapperTest {

    @Autowired
    private PlayerCardMapper playerCardMapper;

    @Test
    void 전체_카드는_11668건이고_1초_이내에_조회된다() {
        long start = System.currentTimeMillis();
        List<PlayerCardEntity> cards = playerCardMapper.findAll();
        long elapsed = System.currentTimeMillis() - start;

        System.out.println("[PlayerCardMapperTest] findAll 소요시간 = " + elapsed + "ms, 행수 = " + cards.size());

        assertThat(cards).hasSize(11668);
        assertThat(elapsed).as("쿼리 소요시간(ms)").isLessThan(1000);
    }

    @Test
    void 레전드_재료_카드는_444건이다() {
        List<PlayerCardEntity> cards = playerCardMapper.findAll();

        long materialCount = cards.stream()
                .filter(c -> c.getLegendName() != null)
                .count();

        assertThat(materialCount).isEqualTo(444);
    }

    @Test
    void 표본_SAM_2001_마해영은_이승엽_재료로_legendName이_채워져_있다() {
        List<PlayerCardEntity> cards = playerCardMapper.findAll();

        assertThat(cards)
                .filteredOn(c -> "마해영".equals(c.getPlayerName())
                        && "SAM".equals(c.getTeamCode())
                        && c.getSeasonYear() == 2001)
                .hasSize(1)
                .first()
                .satisfies(c -> assertThat(c.getLegendName()).isEqualTo("이승엽"));
    }

    @Test
    void playerRole은_HITTER_PITCHER_두_값만_나온다() {
        List<PlayerCardEntity> cards = playerCardMapper.findAll();

        Set<PlayerRole> roles = cards.stream()
                .map(PlayerCardEntity::getPlayerRole)
                .collect(Collectors.toSet());

        assertThat(roles).isSubsetOf(PlayerRole.HITTER, PlayerRole.PITCHER);
        assertThat(roles).isNotEmpty();
    }
}
