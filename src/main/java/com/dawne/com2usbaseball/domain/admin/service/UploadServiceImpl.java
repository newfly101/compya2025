package com.dawne.com2usbaseball.domain.admin.service;

import com.dawne.com2usbaseball.config.properties.S3Properties;
import com.dawne.com2usbaseball.config.properties.UploadProperties;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.admin.enums.UploadMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UploadServiceImpl implements UploadService {

    private final S3Client s3Client;
    private final S3Properties props;
    private final UploadProperties uploadProperties;

    // 이미지 업로드 허용 확장자 화이트리스트
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    // 확장자 -> 허용 컨텐츠 타입
    private static final Map<String, String> EXTENSION_CONTENT_TYPE = Map.of(
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "png", "image/png",
            "gif", "image/gif",
            "webp", "image/webp"
    );

    // 파일명에서 안전하게 확장자만 추출 (경로 조작 문자 차단)
    private static final Pattern SAFE_EXTENSION_PATTERN = Pattern.compile("^.+\\.([A-Za-z0-9]+)$");

    @Override
    public String uploadImage(MultipartFile file) throws IOException {
        validateNotEmpty(file);
        validateSize(file);

        String extension = extractSafeExtension(file.getOriginalFilename());
        validateExtension(extension);
        validateDeclaredContentType(file.getContentType(), extension);

        byte[] content = file.getBytes();
        validateActualContent(content, extension);

        String key = "uploads/images/" + UUID.randomUUID() + "." + extension;

        PutObjectRequest request =
                PutObjectRequest.builder()
                        .bucket(props.getS3().getBucket())
                        .key(key)
                        .contentType(EXTENSION_CONTENT_TYPE.get(extension))
                        .build();

        try {
            s3Client.putObject(request, RequestBody.fromBytes(content));
        } catch (Exception e) {
            throw new BaseException(UploadMessages.UPLOAD_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String baseUrl = props.getS3().getUrl();
        if (!baseUrl.startsWith("http")) baseUrl = "https://" + baseUrl;
        return baseUrl + "/" + key;
    }

    private void validateNotEmpty(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BaseException(UploadMessages.UPLOAD_FILE_EMPTY, HttpStatus.BAD_REQUEST);
        }
    }

    private void validateSize(MultipartFile file) {
        if (file.getSize() > uploadProperties.getMaxSizeBytes()) {
            throw new BaseException(UploadMessages.UPLOAD_FILE_TOO_LARGE, HttpStatus.BAD_REQUEST);
        }
    }

    private String extractSafeExtension(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new BaseException(UploadMessages.UPLOAD_INVALID_EXTENSION, HttpStatus.BAD_REQUEST);
        }

        Matcher matcher = SAFE_EXTENSION_PATTERN.matcher(originalFilename.trim());
        if (!matcher.matches()) {
            throw new BaseException(UploadMessages.UPLOAD_INVALID_EXTENSION, HttpStatus.BAD_REQUEST);
        }

        return matcher.group(1).toLowerCase(Locale.ROOT);
    }

    private void validateExtension(String extension) {
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BaseException(UploadMessages.UPLOAD_INVALID_EXTENSION, HttpStatus.BAD_REQUEST);
        }
    }

    private void validateDeclaredContentType(String declaredContentType, String extension) {
        String expected = EXTENSION_CONTENT_TYPE.get(extension);
        if (declaredContentType == null || !declaredContentType.equalsIgnoreCase(expected)) {
            throw new BaseException(UploadMessages.UPLOAD_INVALID_CONTENT_TYPE, HttpStatus.BAD_REQUEST);
        }
    }

    // 확장자/Content-Type 위조 방지 — 실제 파일 바이트의 매직 넘버로 진짜 이미지 포맷인지 검증
    private void validateActualContent(byte[] content, String extension) {
        if (!matchesImageSignature(content, extension)) {
            throw new BaseException(UploadMessages.UPLOAD_FILE_CORRUPTED, HttpStatus.BAD_REQUEST);
        }
    }

    private boolean matchesImageSignature(byte[] b, String extension) {
        switch (extension) {
            case "jpg":
            case "jpeg":
                return startsWith(b, 0xFF, 0xD8, 0xFF);
            case "png":
                return startsWith(b, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
            case "gif":
                return startsWith(b, 0x47, 0x49, 0x46, 0x38); // GIF8(7a/9a)
            case "webp":
                return b.length >= 12
                        && startsWith(b, 0x52, 0x49, 0x46, 0x46) // RIFF
                        && b[8] == 0x57 && b[9] == 0x45 && b[10] == 0x42 && b[11] == 0x50; // WEBP
            default:
                return false;
        }
    }

    private boolean startsWith(byte[] b, int... signature) {
        if (b.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((b[i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
    }
}
