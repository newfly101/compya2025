package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.event.dto.mapstruct.EventMapStruct;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;
import com.dawne.com2usbaseball.domain.event.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** 이벤트 상세 페이지용 — hasContent, 목록 본문 제거, 상세 404 조건. */
class EventUserServiceImplTest {

    private EventRepository repo;
    private EventUserServiceImpl service;

    @BeforeEach
    void setUp() {
        repo = mock(EventRepository.class);
        service = new EventUserServiceImpl(repo, Mappers.getMapper(EventMapStruct.class));
    }

    private static EventEntity event(Long id, String html) {
        return EventEntity.builder().id(id).title("t").contentHtml(html).build();
    }

    @Test
    @DisplayName("본문이 있으면 hasContent 가 true, null·공백이면 false")
    void hasContent_판정() {
        EventMapStruct mapper = Mappers.getMapper(EventMapStruct.class);
        assertThat(mapper.toResponse(event(1L, "<p>x</p>")).hasContent()).isTrue();
        assertThat(mapper.toResponse(event(2L, null)).hasContent()).isFalse();
        assertThat(mapper.toResponse(event(3L, "  \n ")).hasContent()).isFalse();
    }

    @Test
    @DisplayName("공개 목록은 contentHtml 을 비우고 hasContent 로만 알린다")
    void 목록_본문_제거() {
        when(repo.findExternalEventsForUser()).thenReturn(List.of(event(1L, "<p>x</p>"), event(2L, null)));

        List<EventResponse> list = service.getExternalEventList();

        assertThat(list).extracting(EventResponse::contentHtml).containsOnlyNulls();
        assertThat(list).extracting(EventResponse::hasContent).containsExactly(true, false);
    }

    @Test
    @DisplayName("상세는 본문을 포함해 돌려준다")
    void 상세_본문_포함() {
        when(repo.findPublicById(1L)).thenReturn(Optional.of(event(1L, "<p>x</p>")));

        EventResponse res = service.getPublicEvent(1L);

        assertThat(res.contentHtml()).isEqualTo("<p>x</p>");
        assertThat(res.hasContent()).isTrue();
    }

    @Test
    @DisplayName("숨김·내부 이벤트·없는 id(저장소가 빈 값)는 404")
    void 상세_없으면_404() {
        when(repo.findPublicById(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPublicEvent(9L))
                .isInstanceOfSatisfying(BaseException.class, e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
    }
}
