package com.dawne.com2usbaseball.domain.notice.dto.mapstruct;

import com.dawne.com2usbaseball.domain.notice.dto.request.ChangeNoticeRequest;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NoticeMapStruct {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    NoticeEntity toEntity(ChangeNoticeRequest request);

    NoticeResponse toResponse(NoticeEntity entity);

    List<NoticeResponse> toResponseList(List<NoticeEntity> entities);

    default NoticeEntity toEntity(ChangeNoticeRequest request, Long id) {
        NoticeEntity entity = toEntity(request);
        entity.setId(id);
        return entity;
    }
}
