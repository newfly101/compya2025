# BE 배포 자동화 — 사전 준비

`.github/workflows/deploy-be.yml` 가 동작하려면 아래를 먼저 준비해야 한다.

## 1. GitHub Secrets 등록

저장소 Settings → Secrets and variables → Actions 에 등록.

- [ ] `BE_ARTIFACT_BUCKET` — jar 를 올릴 **비공개** S3 버킷명 (신규 생성, 아래 2번)
- [ ] `BE_INSTANCE_ID` — 배포 대상 EC2 인스턴스 ID (예: `i-0abcd1234...`)
- [ ] `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — FE 배포 워크플로우와 **동일한 키를 재사용**. 단 이 키를 쓰는 IAM 사용자에게 아래 4번 권한이 추가로 있어야 한다.

## 2. 비공개 S3 버킷 생성

- [ ] 신규 버킷 생성 (예: `compyafun-be-artifacts`) — **퍼블릭 액세스 차단을 4항목 모두 체크**
- [ ] 기존 `compya-images` 버킷과 절대 겹치지 않게 한다 — 그 버킷은 CloudFront 공개 서빙 + FE 배포의 `--delete` 대상이라 여기 섞이면 안 된다
- [ ] 라이프사이클 규칙(선택) — 오래된 커밋 경로의 jar 를 주기적으로 정리하고 싶다면 설정

## 3. EC2 인스턴스 준비

- [ ] 인스턴스에 **SSM 에이전트**가 실행 중인지 확인: AWS 콘솔 → Systems Manager → Fleet Manager 에서 해당 인스턴스가 "Managed" 상태로 보이는지 확인. 최신 Amazon Linux 2/2023 은 기본 설치되어 있음 — 안 보이면 `sudo systemctl status amazon-ssm-agent` 로 직접 확인
- [ ] 인스턴스에 연결된 **IAM 역할**에 다음 권한 부여:
  - `AmazonSSMManagedInstanceCore` (관리형 정책) — SSM 이 명령을 받으려면 필수
  - S3 읽기: `s3:GetObject` on `arn:aws:s3:::<BE_ARTIFACT_BUCKET>/*`
- [ ] `sudo` 비밀번호 없이 실행 가능해야 하는지 — **확인 필요 없음.** SSM 이 보내는 명령은 기본적으로 **root 권한**으로 실행되므로 (`ec2-user` 로 로그인해 `sudo` 를 치는 상황이 아님) `systemctl restart`, `journalctl`, `cp` 등은 이미 문제없이 동작한다. `visudo` 설정 변경 불필요.

## 4. GitHub Actions IAM 사용자 권한

기존 FE 배포용 IAM 사용자(`AWS_ACCESS_KEY_ID`)에 아래를 **추가**:

- [ ] `s3:PutObject` on `arn:aws:s3:::<BE_ARTIFACT_BUCKET>/*`
- [ ] `ssm:SendCommand` (대상: 해당 인스턴스 ARN + `AWS-RunShellScript` 문서 ARN)
- [ ] `ssm:GetCommandInvocation`, `ssm:ListCommandInvocations` — 결과 조회용
- [ ] (선택) `ssm:DescribeInstanceInformation` — 트러블슈팅 시 인스턴스 상태 확인용

## 5. 확인

준비가 끝나면 Actions 탭에서 `Deploy BE` 워크플로우를 **workflow_dispatch** 로 수동 실행해 전체 흐름(빌드 → S3 업로드 → SSM 배포 → 기동 확인)을 먼저 검증한다.
