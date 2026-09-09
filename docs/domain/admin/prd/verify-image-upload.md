# 이미지 업로드 방식 재검증

작성일: 2026-09-09 · read-only 재검증 (코드 미수정)

배경: "이벤트 이미지 업로드가 S3 를 쓰는데, 이 방식이 적합한지" 재확인 요청. "S3 를 쓴다"는 것은 사용자 기억이므로 전제로 삼지 않고 코드로 실측했다.

---

## 1. 현재 구현 실측

| 항목 | 실측값 |
|---|---|
| 저장소 | **실제 AWS S3.** `software.amazon.awssdk:s3:2.25.59` 의존성 존재 (`build.gradle:49`), `S3Client` 빈이 `AwsBasicCredentials` + 고정 리전으로 구성됨 (`S3Config.java`). 목업/로컬 저장 아님 |
| 엔드포인트 | `POST /api/upload/events` 단 하나. `directory` 파라미터는 URL 경로로만 쓰이고 BE 는 `events` 외 다른 경로를 라우팅하지 않음 — FE 의 quiz/notices 도 전부 `directory: "events"` 를 하드코딩해서 같은 엔드포인트를 호출 |
| 파라미터 | `MultipartFile file` (RequestParam). 디렉터리 분기 로직 BE 에 없음 — S3 키는 항상 `uploads/images/{uuid}.{ext}` 고정 |
| 파일명 규칙 | `UUID.randomUUID() + "." + extension` — 원본 파일명 미사용 (경로 조작/충돌 위험 없음) |
| 크기 제한 | 있음. `upload.image.max-size-bytes=5242880` (5MB) 애플리케이션 레벨 검증 + `spring.servlet.multipart.max-file-size/max-request-size=5MB` 서블릿 레벨 제한 이중 적용 |
| MIME/확장자 검증 | 있음, 3중. (1) 확장자 화이트리스트 `jpg/jpeg/png/gif/webp` (2) 선언된 Content-Type 이 확장자와 일치하는지 (3) **파일 바이트 매직넘버 검사**로 실제 이미지 포맷인지 확인 (`matchesImageSignature`) — 확장자 위조 방어까지 되어 있음 |
| 인증 | **`permitAll` 아님.** `SecurityConfig.java:63` `.requestMatchers("/api/upload/**").hasRole("ADMIN")` + 컨트롤러 클래스에 `@PreAuthorize("hasRole('ADMIN')")` 이중 적용, `@EnableMethodSecurity` 로 후자도 실제 작동 |
| 반환 URL 형태 | S3 버킷 앞의 커스텀 도메인 조합. `props.getS3().getUrl()`(예: 운영값은 커스텀 도메인) + `/uploads/images/{key}` — CloudFront 여부는 코드로 확인 불가(설정값 영역, DNS/CDN 구성은 인프라 쪽이라 코드에 없음) |
| 삭제/고아 파일 정리 | **없음.** 저장소 전체(`grep s3Client\.`)에서 `putObject` 호출 1건뿐, `deleteObject` 호출 전무. 이벤트/공지/퀴즈 삭제 API 도 S3 객체를 지우지 않음 |
| 리사이즈/최적화 | **없음.** `build.gradle` 에 thumbnailator/imageio 계열 의존성 전무. 업로드된 원본 바이트를 그대로 S3 에 적재 |

설정 키 확인 (값은 비공개, 존재 여부만):

- 로컬(`application.properties`): `cloud.aws.credentials.access-key/secret-key`, `cloud.aws.region.static-value`, `cloud.aws.s3.bucket/url` 전부 `${ENV_VAR}` 참조 — placeholder, 로컬 환경변수 없으면 `S3Properties.validate()` 의 `@PostConstruct` 검증에서 즉시 기동 실패
- 운영(`application-prod.properties`): 동일 키에 리전(`ap-northeast-2`), 버킷명(`compya-images`), 커스텀 도메인(`compyafun.com`) 이 평문으로 박혀 있고 access/secret key 만 별도 env var 참조. **버킷명·도메인이 소스에 커밋되어 있는 점은 자격증명 유출은 아니나 정보 노출 — 우선순위 낮은 개선 후보**

## 2. 응답 계약 확정

**결론: 3중 방어는 불필요. 실제로는 항상 한 가지 형태만 온다.**

- BE 응답: `GlobalResponse<UploadResponse>` = `{ success, code, data: { url, fileName } }` (record, 필드 고정 2개)
- FE `fetchAdminUploadImageFile` (`web/src/infra/api/uploads/api.js`) 이 `return data.data` 로 이미 봉투를 벗겨서, 호출부(thunk/컴포넌트)에 도달하는 값은 **항상 `{ url, fileName }` 객체 하나뿐**
- `extractUploadedUrl` 의 3개 분기(raw string / `.url` 객체 / `{data:{...}}` 래핑)는 사실상 첫 번째와 세 번째가 죽은 코드 — BE 가 절대 raw string 을 반환하지 않고, `.data` 는 api.js 단계에서 이미 벗겨졌으므로 재귀 분기까지 갈 일이 없음
- 3개 파일(`AdminEventScreen.jsx`, `AdminQuizScreen.jsx`, `AdminNoticeWriteScreen.jsx`)에 완전히 동일한 8줄짜리 `extractUploadedUrl` 함수가 중복 — 계약이 불명확해서가 아니라 **계약을 실측하지 않고 방어적으로 짠 코드가 복붙된 것**

## 3. 발견된 결함·위험 (심각도 순)

| 순위 | 결함 | 근거 | 영향 |
|---|---|---|---|
| 1 | 고아 파일(orphan) 정리 없음 | S3 delete 호출 0건, 이벤트/공지/퀴즈 삭제 로직에 이미지 정리 없음 | 삭제·재업로드 반복 시 S3 사용량이 단조 증가만 함. 8개월 운영에 관리자 소수만 올리는 규모라 당장 비용 임팩트는 작지만 방치하면 무한 누적 |
| 2 | 리사이즈/최적화 부재 | 원본 바이트 그대로 S3 적재, 관련 라이브러리 없음 | 관리자가 스마트폰 원본(4~10MB급, 5MB 제한에 걸려 재시도하게 됨) 사진을 그대로 올리면 모바일 유저가 큰 파일을 다운로드 — 로딩 속도·데이터비용 저하. 5MB 하드 제한이 있어 "무제한 대용량"은 아니지만 압축 없는 원본은 여전히 큼 |
| 3 | FE 코드 중복 (`extractUploadedUrl` 3벌) | §2 확정 | 버그는 아니나 유지보수 비용. 계약이 고정이므로 공용 유틸 하나로 축소 가능 |
| 4 | 운영 설정에 버킷명·도메인 평문 커밋 | `application-prod.properties` 실측 | 자격증명 유출은 아님. 정보 노출 수준의 경미한 위생 이슈 |
| 5 (해소 확인) | 인증 미비 우려 | `hasRole('ADMIN')` URL 매처 + `@PreAuthorize` 이중 확인, `@EnableMethodSecurity` 활성 | 우려했던 "permitAll" 아님 — **실제로는 문제 없음, 재확인만으로 종결** |
| 6 (해소 확인) | 업로드 취약점(크기/타입 미검증) 우려 | 5MB 이중 제한 + 확장자 화이트리스트 + Content-Type 매칭 + 매직넘버 바이트 검증 3중 | **문제 없음** — 오히려 이 규모 서비스치고 검증 수준이 높음 |

## 4. 적합성 판정 및 권고

**판정: 유지 (구조 변경 불필요). 단, 리사이즈 추가 + 고아 파일 정리 2가지만 개선.**

판단 근거:

- **업로드 주체가 관리자뿐**이고 이벤트/공지/퀴즈 이미지는 "수십~수백 장" 규모다. 업로드 빈도가 매우 낮다는 것은 (a) 서버 중계 방식의 대역폭 부담이 무시할 수준이고 (b) presigned URL 도입의 이득(서버 부하 경감)이 이 트래픽에서는 사실상 없다는 뜻이다. presigned URL 은 "다수 사용자가 동시에 대량 업로드"할 때 값어치가 있는데 이 서비스엔 해당 안 됨
- S3 스토리지·전송 비용도 이 규모(월 수십 장, 각 5MB 이하)에서는 사실상 무시 가능한 수준(스토리지 GB 단가 + 요청 단가는 소액). "S3 가 과한가"의 답은 **과하지 않다** — 오히려 이미 검증 로직까지 잘 갖춰 놓은 안정적인 구조를 리사이즈 없이 그대로 쓰는 게 관리 부담이 가장 낮다
- Cloudflare R2 로 옮기는 것도 이 규모에선 실익이 거의 없다: 현재 S3 egress 도 총 트래픽이 작아 무의미한 수준이고, 마이그레이션 비용(SDK 교체, 기존 업로드 URL 호환성, 리전 재설정)이 절감액을 초과한다
- 즉 **"서버가 파일을 중계 업로드하는 지금 방식 자체는 이 서비스 규모에 적합"**하다. 손볼 것은 인프라 선택이 아니라 운영 위생(고아 파일)과 유저 경험(원본 그대로 전송)의 미세 개선

### 대안 비교표

| 방식 | 비용 | 운영 난이도 | 효과(이 서비스 기준) | 채택 여부 |
|---|---|---|---|---|
| 현행 유지 (서버 중계 + S3) | 이미 지불 중, 증분 없음 | 낮음 (이미 안정 동작) | 관리자 소수·저빈도 업로드에 충분 | **채택** |
| presigned URL 전환 | 구현 공수 추가, 런타임 비용 변화 없음 | 중간 (FE 업로드 흐름 재작성, 실패 처리 이원화) | 서버 부하 경감 — 이 트래픽에선 체감 이득 없음 | 비채택 |
| Cloudflare R2 이전 | 마이그레이션 공수, egress 절감액은 미미 | 중간~높음 (SDK/자격증명/URL 스킴 전면 교체) | 현재도 비용이 문제 아님 | 비채택 |
| 리사이즈 파이프라인 추가 (Thumbnailator 등) | 낮음 (라이브러리 1개 + 서비스 로직 소폭) | 낮음 | 모바일 유저 다운로드 용량 직접 절감 — **효과 큼** | **채택 권고** |
| 고아 파일 정리(삭제 시 S3 object 삭제) | 낮음 | 낮음 | 스토리지 누적 방지 | **채택 권고** |

## 5. 수정 dispatch brief

다른 agent 가 그대로 받아 실행 가능하도록 우선순위·범위·파일을 명시한다. **본 문서 작성 agent 는 코드를 건드리지 않았음 — 아래는 후속 작업 제안일 뿐.**

1. **[권고 1] 리사이즈/최적화 추가** (우선순위 최상)
   - 대상: `UploadServiceImpl.java` — `uploadImage()` 내 `content` 확보 직후, `s3Client.putObject` 이전 단계
   - 방법: Thumbnailator(순수 자바, 의존성 가볍고 톰캣급 서버에 무리 없음) 로 장변 기준 리사이즈(예: 1600px) + JPEG/WebP 재인코딩 품질 80~85. gif 는 리사이즈 제외(움짤 깨짐) 하고 크기 제한만 유지
   - 회피: 기존 매직넘버 검증·화이트리스트 로직은 그대로 두고 그 뒤 단계에 리사이즈만 삽입
   - build.gradle 에 `net.coobird:thumbnailator:0.4.20` 1줄 추가 필요

2. **[권고 2] 고아 파일 정리** (우선순위 상)
   - 대상: 이벤트/공지/퀴즈 각 도메인의 삭제(delete) 서비스 로직 — 도메인별로 분리해서 dispatch 필요 (파일 겹침 방지)
   - 방법: 삭제 시 해당 레코드의 `image_url` 에서 S3 key 역산 후 `s3Client.deleteObject` 호출. 실패해도 레코드 삭제 자체는 막지 않도록 try-catch로 격리
   - 대안(더 간단): 별도 배치 없이, "이미지 교체 시에만" 우선 정리(신규 업로드 성공 후 기존 URL 삭제) — 이벤트/공지/퀴즈 수정 API 3곳에 각각 필요
   - 이 항목은 범위가 넓으므로 도메인별(events/notices/quiz) agent 3개로 병렬 분리 권장

3. **[선택, 우선순위 하] FE `extractUploadedUrl` 중복 제거**
   - 계약이 `{ url, fileName }` 단일 형태로 확정됐으므로, `web/src/infra/api/uploads/` 밑에 공용 헬퍼 하나만 두고 3개 파일(`AdminEventScreen.jsx`, `AdminQuizScreen.jsx`, `AdminNoticeWriteScreen.jsx`)의 중복 함수를 제거
   - risk 낮음, 다만 세 파일이 겹치므로 단일 agent 가 한 번에 처리(파일 분할 불필요할 만큼 작은 작업)

4. **[선택, 우선순위 최하] 운영 설정 위생**
   - `application-prod.properties` 의 버킷명/도메인을 env var 로 옮길지 여부는 보안팀 판단 사안이 아니라 단순 취향 — 굳이 지금 안 바꿔도 무방. 사용자 결정 필요하면 문의만

HITL 필요 항목 없음 (법무/결제/권한/DB 파괴적 4분야 해당 없음).
