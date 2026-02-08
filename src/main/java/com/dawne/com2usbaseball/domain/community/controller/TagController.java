package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.TagChangeRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.tag.TagListResponse;
import com.dawne.com2usbaseball.domain.community.enums.CommunityMessages;
import com.dawne.com2usbaseball.domain.community.service.tag.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/community")
public class TagController {

    private final TagService tagService;

    @GetMapping("/admin/tags")
    public TagListResponse getTagList() {
        return tagService.selectTagList();
    }
    @PostMapping("/admin/tags")
    public OperationResponse<CommunityMessages> createNewTag(@RequestBody TagChangeRequest request) {
        return tagService.createNewTagItem(request.toEntity());
    }
    @PatchMapping("/admin/tags/{id}")
    public OperationResponse<CommunityMessages> changeTag(@RequestBody TagChangeRequest request, @PathVariable Long id) {
        return tagService.updateTagItem(request.toEntity(id));
    }
}
