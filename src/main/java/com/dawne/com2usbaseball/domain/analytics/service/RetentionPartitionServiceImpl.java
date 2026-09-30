package com.dawne.com2usbaseball.domain.analytics.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * site_user_event 원본 3개월 보관 정책 배치 — 매월 1일 03:40(KST) 다음 달 파티션을 추가하고
 * 4개월(보관 3개월 + 여유 1개월) 이전 파티션을 DROP 한다. 이 서비스가 동작하려면 테이블이
 * 이미 (id, created_at) 복합 PK + PARTITION BY RANGE COLUMNS(created_at) 로 재구성돼 있어야
 * 한다 — 그 초기 DDL(파티션 스키마 자체를 만드는 것)은 이 서비스가 아니라 ops 트랙이 실행한다.
 * 순수 DDL 실행이라 mapper 는 두지 않고 JdbcTemplate 을 직접 쓴다. 배치 실패는 수집 파이프라인과
 * 같은 원칙으로 흡수하고 로그만 남긴다 — 다음 달 다시 시도해도 늦지 않는다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RetentionPartitionServiceImpl {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final int RETENTION_MONTHS = 3;
    private static final int DROP_BUFFER_MONTHS = 1;
    private static final DateTimeFormatter PARTITION_SUFFIX = DateTimeFormatter.ofPattern("yyyyMM");

    private final JdbcTemplate jdbcTemplate;

    @Scheduled(cron = "0 40 3 1 * *", zone = "Asia/Seoul")
    public void manageEventPartitions() {
        LocalDate today = LocalDate.now(KST);
        try {
            addPartition(nextPartitionMonth(today));
        } catch (Exception e) {
            log.error("[ANALYTICS] 파티션 추가 배치 실패: {}", e.getMessage(), e);
        }
        try {
            dropPartition(expiredPartitionMonth(today));
        } catch (Exception e) {
            log.error("[ANALYTICS] 파티션 삭제 배치 실패: {}", e.getMessage(), e);
        }
    }

    private void addPartition(LocalDate monthStart) {
        String partitionName = partitionNameForMonth(monthStart);
        LocalDate boundary = monthStart.plusMonths(1);
        String sql = String.format(
                "ALTER TABLE site_user_event ADD PARTITION (PARTITION %s VALUES LESS THAN ('%s'))",
                partitionName, boundary);
        try {
            jdbcTemplate.execute(sql);
        } catch (DataAccessException e) {
            // 이미 존재하는 파티션이면 재실행해도 안전하게 스킵.
            log.info("[ANALYTICS] 파티션 {} 추가 스킵(이미 존재하거나 스키마 준비 전): {}", partitionName, e.getMessage());
        }
    }

    private void dropPartition(LocalDate monthStart) {
        String partitionName = partitionNameForMonth(monthStart);
        String sql = "ALTER TABLE site_user_event DROP PARTITION " + partitionName;
        try {
            jdbcTemplate.execute(sql);
        } catch (DataAccessException e) {
            // 대상 파티션이 없으면 스킵.
            log.info("[ANALYTICS] 파티션 {} 삭제 스킵(대상 없음): {}", partitionName, e.getMessage());
        }
    }

    static String partitionNameForMonth(LocalDate monthStart) {
        return "p_" + monthStart.format(PARTITION_SUFFIX);
    }

    static LocalDate nextPartitionMonth(LocalDate today) {
        return today.plusMonths(1).withDayOfMonth(1);
    }

    static LocalDate expiredPartitionMonth(LocalDate today) {
        return today.minusMonths(RETENTION_MONTHS + DROP_BUFFER_MONTHS).withDayOfMonth(1);
    }
}
