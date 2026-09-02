package com.dawne.com2usbaseball.domain.fun.historyMode.dto;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;

/**
 * 캐시에 함께 올려두는 응답 본문 + ETag. legendStat 의 LegendStatSnapshot 과 같은 패턴이다.
 */
public record HistoryRoundSnapshot<T>(List<T> items, String etag) {

    /**
     * ETag 는 반드시 weak(W/) 여야 한다.
     * Tomcat 은 strong ETag 가 붙은 응답을 gzip 하지 않아서, strong 으로 두면
     * 이 API 만 압축이 통째로 빠진다.
     */
    public static <T> HistoryRoundSnapshot<T> of(List<T> items) {
        return new HistoryRoundSnapshot<>(items, "W/\"" + hash(items.toString()) + "\"");
    }

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
