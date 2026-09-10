package com.dawne.com2usbaseball.domain.fun.mileage;

import com.dawne.com2usbaseball.domain.fun.mileage.entity.MileageSniperTargetEntity;
import com.dawne.com2usbaseball.domain.fun.mileage.repository.mapper.MileageMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 구단×연도×포지션에 선수가 한 명뿐인 조합(레전드 재료 카드) 조회 매퍼 검증.
 * 실제 DB(data_player_card 11,668행)로 확인한다 — 119건이 핵심 검증 대상이다.
 */
@SpringBootTest
class MileageMapperTest {

    @Autowired
    private MileageMapper mileageMapper;

    @Test
    void 저격_대상_카드는_119건이다() {
        List<MileageSniperTargetEntity> targets = mileageMapper.findSniperTargets();

        assertThat(targets).hasSize(119);
    }

    @Test
    void cardId가_전부_비어있지_않고_유일하다() {
        List<MileageSniperTargetEntity> targets = mileageMapper.findSniperTargets();

        assertThat(targets).allSatisfy(t -> assertThat(t.getCardId()).isNotBlank());

        long distinctCount = targets.stream()
                .map(MileageSniperTargetEntity::getCardId)
                .distinct()
                .count();
        assertThat(distinctCount).isEqualTo(targets.size());
    }

    @Test
    void 표본_BIN_1987_SS_장종훈이_결과에_있다() {
        List<MileageSniperTargetEntity> targets = mileageMapper.findSniperTargets();

        assertThat(targets)
                .anySatisfy(t -> {
                    assertThat(t.getTeamCode()).isEqualTo("BIN");
                    assertThat(t.getSeasonYear()).isEqualTo(1987);
                    assertThat(t.getPositionCode()).isEqualTo("SS");
                    assertThat(t.getPlayerName()).isEqualTo("장종훈");
                });
    }

    @Test
    void legendName이_전부_채워져_있다() {
        List<MileageSniperTargetEntity> targets = mileageMapper.findSniperTargets();

        List<MileageSniperTargetEntity> blank = targets.stream()
                .filter(t -> t.getLegendName() == null || t.getLegendName().isBlank())
                .collect(Collectors.toList());

        assertThat(blank).as("legendName 이 비어있는 행: %s", blank).isEmpty();
    }
}
