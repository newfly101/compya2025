package com.dawne.com2usbaseball.domain.admin.controller;

import com.dawne.com2usbaseball.domain.admin.service.UploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/upload")
public class UploadController {

    private final UploadService uploadService;

    @PostMapping("/events")
    public String uploadImage(@RequestParam MultipartFile file) throws Exception {
        log.info("file={}",file);
        return uploadService.uploadImage(file);
    }
    /* 값을 아래와 같이 내려 줄 수 있도록 변경 필요
        {
          "url": "https://...",
          "fileName": "uuid.png"
        }
    */
}
