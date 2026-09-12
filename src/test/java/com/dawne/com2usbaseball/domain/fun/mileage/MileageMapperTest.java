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
 * 실제 DB(data_player_card 11,668행)로 확인한다 — 부포지션 반영 후 111건이 핵심 검증 대상이다
 * (부포지션 반영 전 119건 — 빠짐 15 · 추가 7).
 */
@SpringBootTest
class MileageMapperTest {

    @Autowired
    private MileageMapper mileageMapper;

    @Test
    void 저격_대상_카드는_111건이다() {
        List<MileageSniperTargetEntity> targets = mileageMapper.findSniperTargets();

        assertThat(targets).hasSize(111);
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
    void 부포지션으로만_혼자인_DOO_2000_DH_우즈가_새로_잡힌다() {
        List<MileageSniperTargetEntity> targets = mileageMapper.findSniperTargets();

        assertThat(targets)
                .anySatisfy(t -> {
                    assertThat(t.getTeamCode()).isEqualTo("DOO");
                    assertThat(t.getSeasonYear()).isEqualTo(2000);
                    assertThat(t.getPositionCode()).isEqualTo("1B");
                    assertThat(t.getSubPositionCode()).isEqualTo("DH");
                    assertThat(t.getPlayerName()).isEqualTo("우즈");
                    // 1B 칸엔 그해 DOO 에 다른 선수가 더 있어 주칸은 유일하지 않고, DH 칸에서만 혼자다.
                    assertThat(t.getMainUnique()).isEqualTo(0);
                    assertThat(t.getSubUnique()).isEqualTo(1);
                });
    }

    @Test
    void 모든_행은_주또는부중_적어도_하나가_유일이고_주만_부만_둘다의_건수를_센다() {
        List<MileageSniperTargetEntity> targets = mileageMapper.findSniperTargets();

        assertThat(targets).allSatisfy(t ->
                assertThat(t.getMainUnique() == 1 || t.getSubUnique() == 1).isTrue());

        long mainOnly = targets.stream().filter(t -> t.getMainUnique() == 1 && t.getSubUnique() == 0).count();
        long subOnly = targets.stream().filter(t -> t.getMainUnique() == 0 && t.getSubUnique() == 1).count();
        long both = targets.stream().filter(t -> t.getMainUnique() == 1 && t.getSubUnique() == 1).count();

        System.out.println("[MileageMapperTest] 주만=" + mainOnly + ", 부만=" + subOnly + ", 둘다=" + both);
        assertThat(mainOnly + subOnly + both).isEqualTo(targets.size());
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
