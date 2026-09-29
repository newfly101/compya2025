package com.dawne.com2usbaseball.domain.event.dto.request;

import com.dawne.com2usbaseball.domain.event.enums.EventType;

public record EventAdminListRequest(
        Integer page,
        Integer size,
        EventType eventType,
        Boolean visible,
        Boolean collected   // true 면 수집함 = 수집 초안(source_article_id 있고 비공개)
) {
    public EventAdminListRequest {
        // page/size 는 쿼리 파라미터라 음수도 그대로 들어온다. offset() = page * size 가
        // 음수가 되면 LIMIT n OFFSET -m 형태의 SQL 이 나가므로 여기서 하한을 정리한다.
        if (page == null || page < 0) page = 0;
        if (size == null || size < 1) size = 20;
    }

    public int offset() {
        return page * size;
    }
}
