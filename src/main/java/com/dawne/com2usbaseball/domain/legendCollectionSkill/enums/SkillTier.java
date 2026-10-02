package com.dawne.com2usbaseball.domain.legendCollectionSkill.enums;

/** 강화 등급 E → S. ordinal 이 곧 단계. */
public enum SkillTier {
    E, D, C, B, A, S;

    public SkillTier next() {
        return values()[ordinal() + 1];
    }
}
