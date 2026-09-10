package com.dawne.com2usbaseball.domain.fun.mileage.dto;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;

/**
 * 캐시에 함께 올려두는 응답 본문 + ETag. 적재 시점에 한 번만 해싱한다.
 * legendStat 도메인의 LegendStatSnapshot 과 동일한 패턴.
 */
public record MileageSnapshot<T>(List<T> items, String etag) {

    /**
     * ETag 는 반드시 weak(W/) 여야 한다.
     * Tomcat 은 strong ETag 가 붙은 응답을 gzip 하지 않는다 — 304 동작은 동일하다.
     */
    public static <T> MileageSnapshot<T> of(List<T> items) {
        return new MileageSnapshot<>(items, "W/\"" + hash(items.toString()) + "\"");
    }

    /** record 의 toString 은 선언 순서대로라 같은 내용이면 항상 같은 값이 나온다. */
    private static String hash(String raw) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest, 0, 8);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
