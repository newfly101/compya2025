package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.TagResponse;
import com.dawne.com2usbaseball.domain.community.service.tag.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ListResponse<TagResponse> getVisibleTagList() {
        return tagService.getVisibleTagList();
    }

    @GetMapping("/code/{code}")
    public TagResponse getTagDetailByCode(@PathVariable String code) {
        return tagService.getTagDetailByCode(code);
    }
}
