package com.dawne.com2usbaseball.domain.admin.service;

import com.dawne.com2usbaseball.config.properties.S3Properties;
import com.dawne.com2usbaseball.config.properties.UploadProperties;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.admin.dto.response.UploadResponse;
import com.dawne.com2usbaseball.domain.admin.enums.UploadMessages;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadServiceImpl implements UploadService {

    private final S3Client s3Client;
    private final S3Properties props;
    private final UploadProperties uploadProperties;

    // 이벤트 이미지와 프로필 이미지는 저장 경로를 구분한다 — 나중에 정리(만료/일괄삭제) 할 때 섞이면 안 된다
    private static final String EVENT_KEY_PREFIX = "uploads/images/";
    private static final String PROFILE_KEY_PREFIX = "uploads/profile-images/";

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

    // 프로필 이미지는 원본 파일명을 신뢰하지 않는다 — 항상 이 확장자로 고정 저장한다.
    // FE 는 이미 업로드 전 캔버스로 정사각 JPEG 압축해서 보낸다(resizeProfileImage.js) — 서버도 JPEG 만 받는다.
    private static final String PROFILE_EXTENSION = "jpg";

    // 같은 키(파일명)로 덮어쓰므로 주소만으로는 캐시 무효화가 안 된다 — S3 객체 자체도 캐시 수명을 짧게 잡아
    // (쿼리스트링을 무시하는 CDN/프록시가 있더라도) 최악의 경우에도 오래 묵은 이미지가 보이지 않게 한다.
    private static final String PROFILE_CACHE_CONTROL = "public, max-age=60, must-revalidate";

    // 파일명에서 안전하게 확장자만 추출 (경로 조작 문자 차단)
    private static final Pattern SAFE_EXTENSION_PATTERN = Pattern.compile("^.+\\.([A-Za-z0-9]+)$");

    @Override
    public UploadResponse uploadImage(MultipartFile file) throws IOException {
        return upload(file, EVENT_KEY_PREFIX);
    }

    @Override
    public UploadResponse uploadProfileImage(MultipartFile file, String publicId) throws IOException {
        validateNotEmpty(file);
        validateSize(file);
        // 원본 파일명은 보지 않는다 — 확장자를 고정하고 실제 바이트가 JPEG 인지만 검증한다.
        // PNG 등 다른 포맷을 올리면 매직 넘버가 안 맞아 UPLOAD_FILE_CORRUPTED 로 거부된다(변환하지 않음).
        validateDeclaredContentType(file.getContentType(), PROFILE_EXTENSION);
        byte[] content = file.getBytes();
        validateActualContent(content, PROFILE_EXTENSION);

        // {publicId}.jpg 고정 키 — 있으면 PutObject 가 그대로 덮어쓴다(별도 삭제 불필요)
        String key = PROFILE_KEY_PREFIX + publicId + "." + PROFILE_EXTENSION;

        PutObjectRequest request =
                PutObjectRequest.builder()
                        .bucket(props.getS3().getBucket())
                        .key(key)
                        .contentType(EXTENSION_CONTENT_TYPE.get(PROFILE_EXTENSION))
                        .cacheControl(PROFILE_CACHE_CONTROL)
                        .build();

        try {
            s3Client.putObject(request, RequestBody.fromBytes(content));
        } catch (Exception e) {
            // PutObject 는 원자적이라 실패해도 기존 객체는 그대로 남는다 — 사용자는 이전 이미지를 계속 본다(깨지지 않음)
            throw new BaseException(UploadMessages.UPLOAD_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // 주소가 고정이라 덮어써도 브라우저/CDN 캐시가 옛 이미지를 붙잡고 있을 수 있다 —
        // 업로드 시각을 쿼리스트링으로 붙여 매번 새 주소를 내려준다(1차 방어). S3 Cache-Control(2차 방어)과 이중으로 막는다.
        String url = resolveUrl(key) + "?v=" + Instant.now().toEpochMilli();

        return new UploadResponse(url, publicId + "." + PROFILE_EXTENSION);
    }

    @Override
    public boolean isProfileImageUrl(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        return url.startsWith(resolveUrl(PROFILE_KEY_PREFIX));
    }

    @Override
    public void deleteByUrl(String url) {
        String baseUrl = resolveUrl("");
        if (url == null || !url.startsWith(baseUrl)) {
            return; // 우리 버킷 URL 이 아니면 손대지 않는다 (방어적)
        }

        String key = url.substring(baseUrl.length());
        try {
            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(props.getS3().getBucket())
                            .key(key)
                            .build()
            );
        } catch (Exception e) {
            // 옛 파일 정리 실패로 사용자 흐름(이미지 교체 자체)을 막을 이유는 없다 — 로그만 남긴다
            log.warn("옛 이미지 삭제 실패: {}", url, e);
        }
    }

    private UploadResponse upload(MultipartFile file, String keyPrefix) throws IOException {
        validateNotEmpty(file);
        validateSize(file);

        String extension = extractSafeExtension(file.getOriginalFilename());
        validateExtension(extension);
        validateDeclaredContentType(file.getContentType(), extension);

        byte[] content = file.getBytes();
        validateActualContent(content, extension);

        String fileName = UUID.randomUUID() + "." + extension;
        String key = keyPrefix + fileName;

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

        return new UploadResponse(resolveUrl(key), fileName);
    }

    private String resolveUrl(String key) {
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
