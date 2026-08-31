package com.dawne.com2usbaseball.domain.admin.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.admin.dto.response.UploadResponse;
import com.dawne.com2usbaseball.domain.admin.enums.UploadMessages;
import com.dawne.com2usbaseball.domain.admin.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/upload")
public class UploadController {

    private final UploadService uploadService;

    @PostMapping("/events")
    public GlobalResponse<UploadResponse> uploadImage(@RequestParam MultipartFile file) throws Exception {
        UploadResponse response = uploadService.uploadImage(file);
        return GlobalResponse.success(UploadMessages.UPLOAD_SUCCESS, response);
    }
}
