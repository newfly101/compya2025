package com.dawne.com2usbaseball.domain.simulator;

import com.dawne.com2usbaseball.domain.simulator.dto.request.GsbEntryRequest;
import jakarta.validation.Validation;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GsbEntryRequestTest {

    private static final String ID = "a".repeat(36);
    private final jakarta.validation.Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private int violations(List<String> tiers) {
        return validator.validate(new GsbEntryRequest(ID, 1, 1, List.of(ID, ID, ID), tiers)).size();
    }

    @Test
    @DisplayName("등급 글자가 E·D·C 이거나 없으면 통과, 그 밖의 값은 거부")
    void 등급_검증() {
        assertEquals(0, violations(List.of("E", "D", "C")));
        assertEquals(0, violations(null));
        assertTrue(violations(List.of("E", "D", "B")) > 0);
        assertTrue(violations(List.of("E", "D")) > 0);
    }
}
