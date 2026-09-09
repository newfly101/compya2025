package com.dawne.com2usbaseball.domain.fun.playerSkill;

import com.dawne.com2usbaseball.domain.fun.playerSkill.entity.PlayerSkillEntity;
import com.dawne.com2usbaseball.domain.fun.playerSkill.entity.PlayerSkillTierEntity;
import com.dawne.com2usbaseball.domain.fun.playerSkill.entity.PlayerSkillTierValueEntity;
import com.dawne.com2usbaseball.domain.fun.playerSkill.repository.mapper.PlayerSkillMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * data_player_skill(+tier, +tier_value) 조인 매퍼 검증.
 *
 * values 컬렉션을 <id> 없는 단순 타입(Integer)으로 매핑했을 때, 같은 skill_value 가
 * 반복되는 티어("8,8" 같은)에서 중복 제거로 값이 유실되는 사고가 있었다.
 * 특정 스킬 하나만으로는 못 잡는 문제라 92건 전부를 순회하며 원문(rawValue)과 대조한다.
 */
@SpringBootTest
class PlayerSkillMapperTest {

    @Autowired
    private PlayerSkillMapper playerSkillMapper;

    @Test
    void 타자_46건_투수_46건이_조회된다() {
        assertThat(playerSkillMapper.findByRole("HITTER")).hasSize(46);
        assertThat(playerSkillMapper.findByRole("PITCHER")).hasSize(46);
    }

    @Test
    void 타자와_투수_92개_전부_모든_티어에서_수치_개수와_순서가_원문과_일치한다() {
        List<PlayerSkillEntity> all = Stream.concat(
                playerSkillMapper.findByRole("HITTER").stream(),
                playerSkillMapper.findByRole("PITCHER").stream()
        ).toList();

        assertThat(all).hasSize(92);

        for (PlayerSkillEntity skill : all) {
            for (PlayerSkillTierEntity tier : skill.getTiers()) {
                List<Integer> values = flatten(tier);
                List<Integer> expected = parseRawValue(tier.getRawValue());

                assertThat(values)
                        .as("%s(%s) %s 티어 — 개수", skill.getSkillName(), skill.getPlayerRole(), tier.getTier())
                        .hasSize(skill.getValueCount());

                assertThat(values)
                        .as("%s(%s) %s 티어 — rawValue(%s) 대비 순서/값", skill.getSkillName(),
                                skill.getPlayerRole(), tier.getTier(), tier.getRawValue())
                        .containsExactlyElementsOf(expected);
            }
        }
    }

    /** 위압감(HITTER) E 티어는 raw "8,8" — 중복 값이 하나로 뭉개지지 않고 [8,8] 그대로 와야 한다. */
    @Test
    void 위압감_E_티어는_중복값_8_8_이_유실되지_않는다() {
        PlayerSkillEntity skill = playerSkillMapper.findByRole("HITTER").stream()
                .filter(s -> "위압감".equals(s.getSkillName()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("위압감 스킬을 찾지 못했다"));

        PlayerSkillTierEntity tierE = skill.getTiers().stream()
                .filter(t -> "E".equals(t.getTier()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("위압감 E 티어를 찾지 못했다"));

        assertThat(flatten(tierE)).containsExactly(8, 8);
    }

    private static List<Integer> flatten(PlayerSkillTierEntity tier) {
        return tier.getValues().stream()
                .sorted(Comparator.comparing(PlayerSkillTierValueEntity::getValueOrder))
                .map(PlayerSkillTierValueEntity::getSkillValue)
                .toList();
    }

    private static List<Integer> parseRawValue(String rawValue) {
        return Arrays.stream(rawValue.split("[,/]"))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toList());
    }
}
