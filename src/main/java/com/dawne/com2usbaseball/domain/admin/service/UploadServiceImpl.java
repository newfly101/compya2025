package com.dawne.com2usbaseball.domain.admin.service;

import com.dawne.com2usbaseball.config.properties.S3Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UploadServiceImpl implements UploadService {

    private final S3Client s3Client;
    private final S3Properties props;

    @Override
    public String uploadImage(MultipartFile file) throws IOException {
        String ext = Objects.requireNonNull(file.getOriginalFilename())
                .substring(file.getOriginalFilename().lastIndexOf("."));

        String key = "uploads/images/" + UUID.randomUUID() + ext;

        PutObjectRequest request =
                PutObjectRequest.builder()
                        .bucket(props.getS3().getBucket())
                        .key(key)
                        .contentType(file.getContentType())
                        .build();

        s3Client.putObject(
                request,
                RequestBody.fromInputStream(file.getInputStream(), file.getSize())
        );

        String baseUrl = props.getS3().getUrl();
        if (!baseUrl.startsWith("http")) baseUrl = "https://" + baseUrl;
        return baseUrl + "/" + key;
    }
}
