package com.dawne.com2usbaseball.domain.home.service;

import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.service.CouponUserService;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.service.EventUserService;
import com.dawne.com2usbaseball.domain.home.dto.response.HomeResponse;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.service.NoticeService;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;
import com.dawne.com2usbaseball.domain.quiz.service.QuizUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

/**
 * 홈 4개 섹션을 한 번에 모아 주는 얇은 조합 계층. 조회 로직·캐시는 각 도메인 서비스 것을 그대로 쓴다
 * (@Cacheable 이 그쪽에 걸려 있어 프록시 호출만으로 기존 캐시를 재사용한다 — 통합 캐시는 두지 않는다).
 *
 * ⚠ 여기에 @Transactional 을 붙이면 안 된다 — 섹션 하나가 던진 예외를 잡아도 공유 트랜잭션이
 * rollback-only 로 표시돼 커밋 시점에 요청 전체가 터진다. 트랜잭션은 각 조회 서비스가 자기 것만 연다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HomeService {

    private final CouponUserService couponUserService;
    private final EventUserService eventUserService;
    private final NoticeService noticeService;
    private final QuizUserService quizUserService;

    public HomeResponse getHome() {
        List<String> failedSections = new ArrayList<>();

        List<CouponResponse> coupons = section("coupons", couponUserService::getCouponLists, failedSections);
        List<EventResponse> events = section("events", eventUserService::getExternalEventList, failedSections);
        List<NoticeResponse> notices = section("notices", noticeService::getNoticeList, failedSections);
        QuizResponse quiz = section("quiz", quizUserService::getLatest, failedSections);

        return new HomeResponse(coupons, events, notices, quiz, failedSections);
    }

    // 섹션 하나의 실패를 그 섹션에 가둔다. 여기서 예외가 새면 홈 전체가 빈 화면이 된다.
    private <T> T section(String name, Supplier<T> loader, List<String> failedSections) {
        try {
            return loader.get();
        } catch (Exception e) {
            log.warn("홈 통합 조회 — {} 섹션 실패", name, e);
            failedSections.add(name);
            return null;
        }
    }
}
