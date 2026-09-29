package com.dawne.com2usbaseball.domain.analytics.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("원본 보관정책 배치 — 대상 파티션 계산")
class RetentionPartitionServiceImplTest {

    @Test
    @DisplayName("다음 달 1일 파티션명을 만든다")
    void 다음달_파티션명() {
        LocalDate today = LocalDate.of(2026, 9, 30);
        assertThat(RetentionPartitionServiceImpl.nextPartitionMonth(today)).isEqualTo(LocalDate.of(2026, 10, 1));
        assertThat(RetentionPartitionServiceImpl.partitionNameForMonth(LocalDate.of(2026, 10, 1))).isEqualTo("p_202610");
    }

    @Test
    @DisplayName("4개월(보관 3개월+여유 1개월) 이전 파티션을 삭제 대상으로 계산한다")
    void 만료_파티션명() {
        LocalDate today = LocalDate.of(2026, 9, 30);
        assertThat(RetentionPartitionServiceImpl.expiredPartitionMonth(today)).isEqualTo(LocalDate.of(2026, 5, 1));
        assertThat(RetentionPartitionServiceImpl.partitionNameForMonth(LocalDate.of(2026, 5, 1))).isEqualTo("p_202605");
    }
}
