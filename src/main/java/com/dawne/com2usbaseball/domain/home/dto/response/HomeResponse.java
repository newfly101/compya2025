package com.dawne.com2usbaseball.domain.home.dto.response;

import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;

import java.util.List;

/**
 * 홈 첫 진입 통합 응답. 섹션 조회가 실패하면 그 칸만 null 이 되고 failedSections 에 이름이 들어간다
 * — 응답 자체는 200 이라 나머지 섹션은 정상 렌더된다. null(실패) 과 빈 목록(정상 0건) 은 다른 뜻이다.
 */
public record HomeResponse(
        List<CouponResponse> coupons,
        List<EventResponse> events,
        List<NoticeResponse> notices,
        QuizResponse quiz,
        List<String> failedSections
) { }
