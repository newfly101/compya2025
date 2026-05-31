# Secrets Rotation Guide

> 작성일 2026-05-31. `application-prod.properties` 의 평문 secret 을 placeholder 화한 후 발생한 follow-up.
> 본 문서는 ops 트랙 단독 — develop 트랙 산출물 아님.

---

## § 1. 배경

이전 버전의 `src/main/resources/application-prod.properties` 에 운영 secret 이 평문으로 존재했음. 본 라운드에서 placeholder 화 (`${PROD_XXX}`) 완료. 단, **로컬 파일 시스템 / 작업 브랜치 stage 단계** 에서만 노출 → git history 에 commit 된 적이 있는지 별도 확인 필요 (§ 3).

### 노출 가능 secret 목록

> ⚠️ 본 표의 실제 secret 값은 commit `ec1c00f` 작성 시 평문으로 포함되어 있었음 → 이후 history rewrite 로 placeholder 치환. 실제 값은 별도 안전한 저장소 (예: 1Password / AWS Secrets Manager) 에서 관리.

| 키 | 영역 | 노출 형태 | rotation 필요 |
|---|---|---|---|
| DB password (`<REDACTED>`) | MariaDB `<DB_USER>` 유저 | 평문 | 🔴 즉시 |
| JWT secret (`<REDACTED>`) | JWT 서명 키 | 평문 | 🔴 즉시 |
| AWS access key (`<REDACTED>`) | S3 업로드 IAM | 평문 | 🔴 즉시 |
| AWS secret key (`<REDACTED>`) | S3 업로드 IAM | 평문 | 🔴 즉시 |
| Naver client id (`<REDACTED>`) | Naver OAuth 앱 | 평문 | 🟧 권고 (client_id 는 redirect 시 노출되긴 함) |
| Naver client secret (`<REDACTED>`) | Naver OAuth 앱 | 평문 | 🔴 즉시 |

---

## § 2. Rotation 절차 (서비스별)

### 2.1 DB password

1. 운영 서버 SSH → MariaDB 접속.
2. `ALTER USER 'newfly101'@'%' IDENTIFIED BY '<NEW_PASSWORD>';` (또는 host 별).
3. 배포 서버 env: `PROD_DB_PASSWORD=<NEW_PASSWORD>` 갱신.
4. application 재기동 (HikariCP 재연결).

### 2.2 JWT secret

1. 32바이트 이상 랜덤 문자열 생성 (`openssl rand -base64 48`).
2. 배포 서버 env: `PROD_JWT_SECRET=<NEW_SECRET>`.
3. application 재기동.
4. ⚠️ 발급된 모든 access/refresh token 무효화 — 사용자 재로그인 필요. 공지 또는 점검 시간 활용.

### 2.3 AWS S3 IAM 키

1. AWS Console → IAM → 해당 user → "Security credentials" → "Create access key".
2. 새 키를 배포 서버 env 에 우선 적용 (`PROD_AWS_ACCESS_KEY`, `PROD_AWS_SECRET_KEY`).
3. application 재기동 → S3 업로드 정상 확인.
4. 기존 노출된 key 는 "Make inactive" → 며칠 후 "Delete".

### 2.4 Naver OAuth client secret

1. Naver Developers → 해당 애플리케이션 → "API 설정" → "Client Secret 재발급".
2. 새 secret 을 배포 서버 env `PROD_NAVER_CLIENT_SECRET` 에 적용.
3. application 재기동.
4. (선택) client id 도 변경하려면 새 애플리케이션 등록 후 redirect URI 동일하게 설정.

---

## § 3. git history 점검

**현재 상태 (2026-05-31 본 라운드 확인 결과)**:
- `application-prod.properties` 는 `.gitignore` 28행 (`**/src/main/resources/application-prod.properties`) 으로 추적 제외 → **git history 에 commit 된 적 없음**.
- 따라서 git 차원에서 secret 유출 위험은 없음.

**남는 노출 경로**:
- 로컬 작업 디스크 / 백업.
- 운영 서버 파일 시스템 (서버 침해 시).
- 과거 ops 트랙에서 다른 경로로 (e.g. 채팅, 메모, 스크린샷) 평문 secret 을 공유한 이력 → 사용자 자체 검토.

**재검증 명령** (혹시 모를 다른 파일에 hardcoded 가 남아있는지):

> 실제 검색 패턴은 사용자 보관 시크릿 값 (별도 안전한 저장소) 으로 치환 후 사용. 본 문서엔 평문 미포함.

```powershell
# Windows PowerShell — <REDACTED_PATTERN> 자리에 실값 placeholder 입력
git log -p --all | Select-String -Pattern "<REDACTED_PATTERN_1>|<REDACTED_PATTERN_2>"
```

```bash
# bash — 동일
git log -p --all | grep -E "<REDACTED_PATTERN_1>|<REDACTED_PATTERN_2>"
```

매칭 발견 시:
- 해당 파일 / commit 식별 → rotation **필수** + `git filter-repo` / BFG 로 history 정리 검토.
- history 재작성은 협업자 모두에게 영향. 사용자 결정 사안.

---

## § 4. 배포 서버 env 변수 권장 목록

`.env` 또는 systemd unit `Environment=` / Docker `--env` / CI secret 어디에 두든 동일 키.

```
# DB
PROD_DB_HOST=127.0.0.1
PROD_DB_PORT=3306
PROD_DB_NAME=compyafun
PROD_DB_USERNAME=newfly101
PROD_DB_PASSWORD=<rotated>

# JWT
PROD_JWT_SECRET=<rotated, 32바이트 이상>

# AWS S3
PROD_AWS_ACCESS_KEY=<rotated>
PROD_AWS_SECRET_KEY=<rotated>

# Naver OAuth
PROD_NAVER_CLIENT_ID=<rotated 또는 기존>
PROD_NAVER_CLIENT_SECRET=<rotated>
```

`spring.config.import=optional:file:.env` 가 활성이라 운영 서버 working dir 에 `.env` 만 두면 자동 로드.

---

## § 5. 검증 체크리스트

- [ ] `application-prod.properties` 의 모든 secret 이 placeholder 형태인지
- [ ] 배포 서버 env 에 모든 PROD_* 변수가 정의됐는지
- [ ] application 재기동 후 정상 동작 (DB connect / JWT 발급 / S3 upload / Naver login)
- [ ] 기존 노출된 AWS access key 가 inactive/delete 되었는지
- [ ] git log 점검 후 history 노출 여부 확정
- [ ] 사용자/협업자에게 rotation 완료 공지

---

— 끝.
