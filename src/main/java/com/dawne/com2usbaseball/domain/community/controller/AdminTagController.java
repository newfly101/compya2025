package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.community.dto.request.ChangeTagVisibleRequest;
import com.dawne.com2usbaseball.domain.community.dto.request.TagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.TagResponse;
import com.dawne.com2usbaseball.domain.community.service.tag.AdminTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/tags")
public class AdminTagController {

    private final AdminTagService adminTagService;

    @GetMapping
    public ListResponse<TagResponse> getTagList() {
        return adminTagService.getTagList();
    }

    @GetMapping("/{id}")
    public TagResponse getTagDetail(@PathVariable Long id) {
        return adminTagService.getTagDetail(id);
    }

    @PostMapping
    public TagResponse createTag(@RequestBody TagRequest request) {
        return adminTagService.createTag(request);
    }

    @PutMapping("/{id}")
    public TagResponse updateTag(@PathVariable Long id,
                                 @RequestBody TagRequest request) {
        return adminTagService.updateTag(id, request);
    }

    @PatchMapping("/{id}/visible")
    public void updateTagVisible(@PathVariable Long id,
                                 @RequestBody ChangeTagVisibleRequest request) {
        adminTagService.updateTagVisible(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTag(@PathVariable Long id) {
        adminTagService.deleteTag(id);
    }
}
