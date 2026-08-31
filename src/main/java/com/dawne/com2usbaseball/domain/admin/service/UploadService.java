package com.dawne.com2usbaseball.domain.admin.service;

import com.dawne.com2usbaseball.domain.admin.dto.response.UploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface UploadService {
    UploadResponse uploadImage(MultipartFile file) throws IOException;
}
