package com.dawne.com2usbaseball.domain.home.service;

import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.home.dto.response.HomeResponse;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.service.NoticeService;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * DB 없이 조합 로직만 검증한다 — 홈이 노리는 것은 "섹션 하나가 죽어도 나머지가 살아남는 것" 이다.
 */
@DisplayName("홈 통합 조회")
class HomeServiceTest {

    private static final CouponResponse COUPON = new CouponResponse(1L, "CODE", "쿠폰", "설명", null, true);
    private static final QuizResponse QUIZ = new QuizResponse(9L, 3, "퀴즈", null, null, null);

    private static NoticeService noticeService(List<NoticeResponse> list, RuntimeException error) {
        return new NoticeService() {
            @Override
            public List<NoticeResponse> getNoticeList() {
                if (error != null) throw error;
                return list;
            }

            @Override
            public NoticeResponse getNoticeDetail(Long noticeId) {
                return null;
            }
        };
    }

    @Test
    @DisplayName("네 섹션이 모두 성공하면 실패 목록이 비어 있다")
    void 모두_성공하면_실패목록이_빈다() {
        HomeService service = new HomeService(
                () -> List.of(COUPON),
                eventService(),
                noticeService(List.of(), null),
                () -> QUIZ
        );

        HomeResponse result = service.getHome();

        assertThat(result.failedSections()).isEmpty();
        assertThat(result.coupons()).hasSize(1);
        assertThat(result.events()).isEmpty();   // 정상 0건 — 실패가 아니다
        assertThat(result.quiz()).isEqualTo(QUIZ);
    }

    @Test
    @DisplayName("한 섹션이 터져도 예외가 새지 않고 그 칸만 비어 온다")
    void 한_섹션이_터져도_나머지는_살아남는다() {
        HomeService service = new HomeService(
                () -> { throw new IllegalStateException("쿠폰 조회 실패"); },
                eventService(),
                noticeService(List.of(), null),
                () -> { throw new IllegalStateException("퀴즈 없음"); }
        );

        HomeResponse result = service.getHome();

        assertThat(result.failedSections()).containsExactly("coupons", "quiz");
        assertThat(result.coupons()).isNull();
        assertThat(result.quiz()).isNull();
        assertThat(result.notices()).isEmpty();
        assertThat(result.events()).isEmpty();
    }

    private static com.dawne.com2usbaseball.domain.event.service.EventUserService eventService() {
        return new com.dawne.com2usbaseball.domain.event.service.EventUserService() {
            @Override
            public List<com.dawne.com2usbaseball.domain.event.dto.response.EventResponse> getExternalEventList() {
                return List.of();
            }

            @Override
            public com.dawne.com2usbaseball.domain.event.dto.response.EventResponse getPublicEvent(Long id) {
                throw new UnsupportedOperationException();
            }
        };
    }
}
