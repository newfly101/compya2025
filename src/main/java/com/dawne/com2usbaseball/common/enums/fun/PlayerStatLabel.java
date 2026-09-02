package com.dawne.com2usbaseball.common.enums.fun;

import java.util.List;

/**
 * 선수 스탯 슬롯(stat1~stat5)의 화면 라벨.
 * DB 는 중립 슬롯만 들고 있고 의미는 {@link PlayerRole} 이 정한다.
 * 대응 테이블: data_player_legend_stat. 다른 카드 등급 스탯도 같은 슬롯 규칙을 따른다.
 */
public enum PlayerStatLabel {

    HITTER(PlayerRole.HITTER, "정확", "파워", "선구", "주력", "수비"),
    PITCHER(PlayerRole.PITCHER, "제구", "구위", "체력", "직구", "변화");

    public static final int SLOT_SIZE = 5;

    private final PlayerRole role;
    private final List<String> labels;

    PlayerStatLabel(PlayerRole role, String... labels) {
        this.role = role;
        this.labels = List.of(labels);
    }

    public PlayerRole getRole() {
        return role;
    }

    public List<String> getLabels() {
        return labels;
    }

    /** 슬롯 번호는 1~5. */
    public String getLabel(int slotNo) {
        if (slotNo < 1 || slotNo > SLOT_SIZE) {
            throw new IllegalArgumentException("스탯 슬롯 번호는 1~" + SLOT_SIZE + " 범위여야 합니다: " + slotNo);
        }
        return labels.get(slotNo - 1);
    }

    public static PlayerStatLabel from(PlayerRole role) {
        for (PlayerStatLabel label : values()) {
            if (label.role == role) return label;
        }
        throw new IllegalArgumentException("스탯 라벨이 정의되지 않은 선수 역할입니다: " + role);
    }

    public static List<String> labelsOf(PlayerRole role) {
        return from(role).getLabels();
    }
}
