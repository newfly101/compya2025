package com.dawne.com2usbaseball.domain.admin.service;

import com.dawne.com2usbaseball.domain.admin.dto.response.UploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface UploadService {
    UploadResponse uploadImage(MultipartFile file) throws IOException;

    // 프로필 이미지 — {publicId}.jpg 고정 파일명으로 저장(있으면 덮어쓴다). userId 아닌 publicId 를 받는다 —
    // 호출부(컨트롤러)가 인증 컨텍스트에서만 publicId 를 구해 넘기도록 강제하기 위한 시그니처
    UploadResponse uploadProfileImage(MultipartFile file, String publicId) throws IOException;

    // url 이 우리 버킷의 프로필 이미지 경로인지 (사용자가 임의 URL 을 넣는 걸 막는 용도)
    boolean isProfileImageUrl(String url);

    // url 이 우리 버킷 소속이면 S3 에서 지운다. 아니면 아무 것도 하지 않는다 (방어적)
    void deleteByUrl(String url);
}
