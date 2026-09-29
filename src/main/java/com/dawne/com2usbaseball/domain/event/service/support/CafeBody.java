package com.dawne.com2usbaseball.domain.event.service.support;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 추출한 본문 구간. html 의 이미지 주소는 아직 카페 원본이다(S3 재업로드 전).
 * found=false 면 구간을 못 찾은 것 — html 은 null.
 */
public record CafeBody(
        boolean found,
        String html,
        List<String> images,
        String periodText,
        LocalDateTime periodStart,
        LocalDateTime periodEnd,
        String bannerImage
) {
    public static CafeBody notFound(String bannerImage) {
        return new CafeBody(false, null, List.of(), null, null, null, bannerImage);
    }
}
