package com.dawne.com2usbaseball.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** 공식 카페 이벤트·쿠폰 자동 수집 설정 (ADR 0009). 비밀값 아님 — 모두 공개 식별자. */
@Getter
@Setter
@ConfigurationProperties(prefix = "cafe-sync")
public class CafeSyncProperties {

    /** 매일 11:01 스케줄 실행 여부. 수동 실행 API 는 이 값과 무관하게 동작한다. */
    private boolean enabled = true;
    private long cafeId = 27851354L;
    private String cafeUrl = "com2usbaseball2015";
    /** "진행 중 Event" 게시판 */
    private int menuId = 1;
    /** GM드리미 멤버 고유키 — 닉네임이 아니라 이 값으로 거른다 */
    private String memberKey = "cN6ap4Sf5cNHc4PUCl3PDcxeX8yLXa1o75N2-iuJG1E";
    private int listPageSize = 50;
    private String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            + "(KHTML, like Gecko) Chrome/140.0 Safari/537.36";
    /** 카페 부담을 줄이려고 요청 사이에 두는 간격 (ms) */
    private long requestDelayMs = 700;
}
