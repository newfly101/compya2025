package com.dawne.com2usbaseball.domain.fun.playerCard;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.PlayerCardStatResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardStatEntity;
import com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper.PlayerCardMapper;
import com.dawne.com2usbaseball.domain.fun.playerCard.service.PlayerCardService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.zip.GZIPOutputStream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 선수 카드 목록 조회 매퍼 검증. 실제 DB(data_player_card 11,668행)로 확인한다.
 */
@SpringBootTest
class PlayerCardMapperTest {

    @Autowired
    private PlayerCardMapper playerCardMapper;

    @Autowired
    private PlayerCardService playerCardService;

    @Autowired
    private ObjectMapper objectMapper;

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

    /**
     * 구단 스탯 조회는 findAll() 을 팀코드로 거른 것과 행수가 같아야 한다(1:1 조인 확인).
     * 롯데(LOT)가 전체 구단 중 가장 큰 1,382행이라 이 크기로 확인한다.
     */
    @Test
    void 롯데_스탯_행수는_카드_목록에서_LOT로_거른_행수와_같다() {
        long expected = playerCardMapper.findAll().stream()
                .filter(c -> "LOT".equals(c.getTeamCode()))
                .count();

        List<PlayerCardStatEntity> stats = playerCardMapper.findStatsByTeamCode("LOT");

        System.out.println("[PlayerCardMapperTest] LOT 스탯 행수 = " + stats.size() + ", 카드 목록 행수 = " + expected);

        assertThat(stats).hasSize((int) expected);
    }

    @Test
    void 투수만_구종을_갖고_타자는_구종이_비어있다() {
        List<PlayerCardStatEntity> stats = playerCardMapper.findStatsByTeamCode("LOT");

        assertThat(stats).isNotEmpty();

        stats.forEach(s -> {
            if (s.getPlayerRole() == PlayerRole.HITTER) {
                assertThat(s.getPitches()).isEmpty();
            } else {
                assertThat(s.getPitches()).isNotEmpty();
            }
        });
    }

    @Test
    void 구단_코드_목록에_LOT가_있고_전체_스탯_행수는_카드_전체_행수와_같다() {
        List<String> teamCodes = playerCardMapper.findDistinctTeamCodes();
        assertThat(teamCodes).contains("LOT");

        long totalStats = teamCodes.stream()
                .mapToLong(tm -> playerCardMapper.findStatsByTeamCode(tm).size())
                .sum();
        long totalCards = playerCardMapper.findAll().size();

        assertThat(totalStats).isEqualTo(totalCards);
    }

    /** 가장 큰 구단(LOT) 응답의 실제 JSON/gzip 용량 실측 — 회귀 확인용 느슨한 상한만 둔다. */
    @Test
    void 롯데_스탯_응답_용량은_gzip_기준_60KB_미만이다() throws Exception {
        List<PlayerCardStatResponse> items = playerCardService.getStatsByTeam("LOT").items();

        byte[] json = objectMapper.writeValueAsBytes(items);

        ByteArrayOutputStream gzipBytes = new ByteArrayOutputStream();
        try (GZIPOutputStream gzip = new GZIPOutputStream(gzipBytes)) {
            gzip.write(json);
        }

        System.out.println("[PlayerCardMapperTest] LOT 스탯 응답 = " + items.size() + "건, JSON "
                + json.length + "B, gzip " + gzipBytes.size() + "B");

        assertThat(gzipBytes.size()).isLessThan(60 * 1024);
    }
}
